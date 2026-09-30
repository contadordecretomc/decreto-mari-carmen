<?php
// Removes the plugin's settings when it is deleted from Plugins → Installed plugins.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}
delete_option( 'dmc_ajustes' );
delete_option( 'dmc_recargar_direcciones' );
