<?php
/**
 * Plugin Name:       Decreto Mari Carmen
 * Description:       Publica la web de campaña del Decreto Mari Carmen en una dirección propia de tu web (por defecto /decretomaricarmen/). Configura el correo de contacto en Ajustes → Decreto Mari Carmen.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 * Text Domain:       decreto-mari-carmen
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const DMC_OPCION    = 'dmc_ajustes';
const DMC_QUERY_VAR = 'dmc_pagina';
const DMC_SLUG      = 'decretomaricarmen';

// Addresses WordPress itself relies on; the campaign can't take them over.
const DMC_SLUGS_RESERVADOS = array( 'wp-admin', 'wp-content', 'wp-includes', 'wp-json', 'wp-login', 'feed', 'page', 'comments', 'search', 'author', 'category', 'tag' );

/**
 * Saved settings merged with the defaults.
 */
function dmc_ajustes() {
	$por_defecto = array(
		'correo'       => '__CORREO_CONTACTO__', // Filled in from campana.config.json by npm run plugin.
		'organizacion' => '',
		'slug'         => DMC_SLUG,
	);
	$guardado = get_option( DMC_OPCION, array() );
	return array_merge( $por_defecto, is_array( $guardado ) ? $guardado : array() );
}

/**
 * Public address of the campaign. With "plain" permalinks WordPress can't serve
 * clean addresses, so a query-string address is used instead.
 */
function dmc_url() {
	if ( '' === get_option( 'permalink_structure' ) ) {
		return add_query_arg( DMC_QUERY_VAR, '1', home_url( '/' ) );
	}
	return home_url( '/' . dmc_ajustes()['slug'] . '/' );
}

/* ------------------------------------------------------------------------- *
 * Address: /decretomaricarmen/ (with or without trailing slash)
 * ------------------------------------------------------------------------- */

function dmc_registrar_direccion() {
	$slug = dmc_ajustes()['slug'];
	add_rewrite_rule( '^' . preg_quote( $slug, '#' ) . '/?$', 'index.php?' . DMC_QUERY_VAR . '=1', 'top' );
}
add_action( 'init', 'dmc_registrar_direccion' );

// After the address changes in the settings, rebuild WordPress's address table once.
add_action(
	'init',
	function () {
		if ( get_option( 'dmc_recargar_direcciones' ) ) {
			delete_option( 'dmc_recargar_direcciones' );
			flush_rewrite_rules( false );
		}
	},
	20
);

add_filter(
	'query_vars',
	function ( $vars ) {
		$vars[] = DMC_QUERY_VAR;
		return $vars;
	}
);

/**
 * Serves the campaign page. The page's own files stay in the plugin's web/
 * folder; the page is told where they are and gets the saved settings.
 */
function dmc_servir_pagina() {
	if ( ! get_query_var( DMC_QUERY_VAR ) ) {
		return;
	}

	$html = file_get_contents( __DIR__ . '/web/index.html' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	if ( false === $html ) {
		wp_die( esc_html__( 'Falta el archivo web/index.html del plugin Decreto Mari Carmen. Vuelve a instalar el plugin.', 'decreto-mari-carmen' ) );
	}

	$ajustes = dmc_ajustes();
	// Root-relative (no domain): the files load from whatever host the visitor
	// used (www or not, http or https), since this runs before any canonical redirect.
	$base = wp_make_link_relative( plugins_url( 'web/', __FILE__ ) );
	$entorno = array(
		'base'   => $base,
		'config' => array(
			'correoContacto' => $ajustes['correo'],
			'organizacion'   => $ajustes['organizacion'],
		),
	);

	// Asset links in index.html are relative ("./assets/…"): point them at the plugin folder.
	$html = str_replace( '="./', '="' . esc_url( $base ), $html );
	$html = preg_replace(
		'/<head>/i',
		'<head><script>window.__DMC__=' . wp_json_encode( $entorno, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES ) . ';</script>',
		$html,
		1
	);

	status_header( 200 );
	header( 'Content-Type: text/html; charset=utf-8' );
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static page shipped with the plugin.
	exit;
}
// Priority 0: before WordPress decides the address is a 404 or redirects it.
add_action( 'template_redirect', 'dmc_servir_pagina', 0 );

register_activation_hook(
	__FILE__,
	function () {
		dmc_registrar_direccion();
		flush_rewrite_rules( false );
	}
);

register_deactivation_hook(
	__FILE__,
	function () {
		flush_rewrite_rules( false );
	}
);

/* ------------------------------------------------------------------------- *
 * Settings page: Ajustes → Decreto Mari Carmen
 * ------------------------------------------------------------------------- */

add_action(
	'admin_init',
	function () {
		register_setting(
			'dmc',
			DMC_OPCION,
			array(
				'type'              => 'array',
				'sanitize_callback' => 'dmc_sanear_ajustes',
				'default'           => array(),
			)
		);
	}
);

function dmc_aviso( $codigo, $mensaje ) {
	foreach ( get_settings_errors( DMC_OPCION ) as $error ) {
		if ( $error['code'] === $codigo ) {
			return;
		}
	}
	add_settings_error( DMC_OPCION, $codigo, $mensaje );
}

function dmc_sanear_ajustes( $entrada ) {
	$actual  = dmc_ajustes();
	$entrada = is_array( $entrada ) ? $entrada : array();

	$correo = sanitize_email( $entrada['correo'] ?? '' );
	if ( ! is_email( $correo ) ) {
		dmc_aviso( 'correo', 'El correo de contacto no es válido. Se mantiene el anterior.' );
		$correo = $actual['correo'];
	}

	$slug = sanitize_title( $entrada['slug'] ?? '' );
	if ( '' === $slug ) {
		$slug = DMC_SLUG;
	}
	if ( in_array( $slug, DMC_SLUGS_RESERVADOS, true ) ) {
		dmc_aviso( 'slug', 'Esa dirección la usa WordPress. Se mantiene la anterior.' );
		$slug = $actual['slug'];
	}
	if ( $slug !== $actual['slug'] ) {
		update_option( 'dmc_recargar_direcciones', 1 );
	}

	return array(
		'correo'       => $correo,
		'organizacion' => sanitize_text_field( $entrada['organizacion'] ?? '' ),
		'slug'         => $slug,
	);
}

add_action(
	'admin_menu',
	function () {
		add_options_page( 'Decreto Mari Carmen', 'Decreto Mari Carmen', 'manage_options', 'decreto-mari-carmen', 'dmc_pagina_ajustes' );
	}
);

function dmc_pagina_ajustes() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$a      = dmc_ajustes();
	$url    = dmc_url();
	$pagina = get_page_by_path( $a['slug'] );
	?>
	<div class="wrap">
		<h1>Decreto Mari Carmen</h1>

		<div class="notice notice-success inline"><p>
			<strong>La web está publicada en:</strong>
			<a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $url ); ?></a>
			— es la dirección que hay que compartir.
		</p></div>

		<?php if ( '' === get_option( 'permalink_structure' ) ) : ?>
			<div class="notice notice-warning inline"><p>
				Tus enlaces permanentes están en «Simple», así que la dirección lleva <code>?<?php echo esc_html( DMC_QUERY_VAR ); ?>=1</code>.
				Para una dirección limpia (<code>/<?php echo esc_html( $a['slug'] ); ?>/</code>), elige otra opción en
				<a href="<?php echo esc_url( admin_url( 'options-permalink.php' ) ); ?>">Ajustes → Enlaces permanentes</a>.
			</p></div>
		<?php endif; ?>

		<?php if ( $pagina ) : ?>
			<div class="notice notice-warning inline"><p>
				Ya existe una página llamada «<?php echo esc_html( get_the_title( $pagina ) ); ?>» con esa dirección: la campaña la tapa.
				Si quieres conservarla, cambia la dirección de la campaña más abajo.
			</p></div>
		<?php endif; ?>

		<form method="post" action="options.php">
			<?php settings_fields( 'dmc' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="dmc-correo">Correo de contacto</label></th>
					<td>
						<input name="<?php echo esc_attr( DMC_OPCION ); ?>[correo]" id="dmc-correo" type="email" class="regular-text" value="<?php echo esc_attr( $a['correo'] ); ?>" required />
						<p class="description">Aparece en el aviso de privacidad, para consultas y para pedir que se corrija o se retire un dato.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="dmc-organizacion">Organización</label></th>
					<td>
						<input name="<?php echo esc_attr( DMC_OPCION ); ?>[organizacion]" id="dmc-organizacion" type="text" class="regular-text" value="<?php echo esc_attr( $a['organizacion'] ); ?>" />
						<p class="description">Quién firma la campaña. Aparece al pie («Una iniciativa de…») y como responsable en el aviso de privacidad. Déjalo vacío si no firma nadie.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="dmc-slug">Dirección</label></th>
					<td>
						<code><?php echo esc_html( home_url( '/' ) ); ?></code>
						<input name="<?php echo esc_attr( DMC_OPCION ); ?>[slug]" id="dmc-slug" type="text" class="regular-text" value="<?php echo esc_attr( $a['slug'] ); ?>" />
						<p class="description">Solo letras, números y guiones. Normalmente no hace falta cambiarla.</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Guardar cambios' ); ?>
		</form>

		<p class="description">El contador de correos se actualiza solo cada 10 minutos. No hace falta hacer nada más.</p>
	</div>
	<?php
}

// "Ajustes" and "Ver la web" links in the plugin list.
add_filter(
	'plugin_action_links_' . plugin_basename( __FILE__ ),
	function ( $enlaces ) {
		array_unshift(
			$enlaces,
			'<a href="' . esc_url( admin_url( 'options-general.php?page=decreto-mari-carmen' ) ) . '">Ajustes</a>',
			'<a href="' . esc_url( dmc_url() ) . '" target="_blank" rel="noopener">Ver la web</a>'
		);
		return $enlaces;
	}
);
