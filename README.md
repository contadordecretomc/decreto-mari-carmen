# Decreto Mari Carmen

Web estática de campaña para pedir a los 350 diputados y diputadas del Congreso que voten a favor
de convalidar el «Decreto Mari Carmen». Muestra el hemiciclo por grupos, deja escribir a un grupo
entero (con todos en CC) o a cada diputado desde su ficha, y enseña un contador común de correos
preparados.

La guía completa (funcionamiento, instalación, GoatCounter, GitHub Pages y dominio propio) está en
`DOCUMENTACION.pdf`, que acompaña al paquete.

## Arranque rápido

```bash
npm install
npm run dev        # http://localhost:5902
npm run build      # genera dist/, desplegable en cualquier hosting estático
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor local de desarrollo. |
| `npm run build` | Compila la web en `dist/`. |
| `npm run scrape` | Vuelve a descargar diputados, correos y fotos de congreso.es. |
| `npm run contador` | Recalcula `public/data/contador.json` desde GoatCounter (necesita `GOATCOUNTER_SITE` y `GOATCOUNTER_TOKEN`). |
| `npm run artifact` | Genera un único HTML autocontenido en `artifact/` (opcional). |

## Datos

`npm run scrape` descarga de congreso.es la lista de diputados en activo, la ficha pública de cada
uno (correo `@congreso.es`), su foto oficial y su biografía de los datos abiertos. No se infieren
direcciones: quien no publica correo recibe el mensaje en la dirección general de su grupo o
partido ([scripts/contactos-grupos.mjs](scripts/contactos-grupos.mjs)), con su nombre en el asunto.

## Contador de correos preparados

Cada clic en un botón de escribir (o «Copiar mensaje») envía a GoatCounter un evento anónimo
`correos/<n>/<k>`: `n` = diputados nuevos para ese navegador, `k` = número de envío del navegador.
Sin cookies ni datos personales. Cada navegador cuenta a cada diputado una sola vez.

La web no consulta nada en directo: `scripts/update-contador.mjs` suma `n × visitantes` y escribe
`public/data/contador.json`, que la web lee al cargar. En GitHub lo hace
`.github/workflows/deploy.yml` cada 10 minutos; en un servidor propio, una tarea `cron`.

## Publicar dentro de otra web (p. ej. `https://webdeejemplo.com/decretomaricarmen/`)

La web compilada es una carpeta autónoma: funciona en cualquier dominio y subcarpeta sin volver a
compilar. La copia de GitHub Pages sigue calculando el contador y la web lo lee de ahí.

1. `npm run carpeta` → genera `carpeta/decretomaricarmen/` (y su `.zip`), con la cifra actual del
   contador como copia de respaldo y un `LEEME.txt`.
2. Sube esa carpeta tal cual a la carpeta pública de la otra web. Funciona con y sin barra final, y
   con cualquier nombre de carpeta.
3. Edita `configuracion.json` dentro de la carpeta subida: `correoContacto` y `organizacion`. Es el
   único archivo que hay que tocar.
4. Opcional, el día del lanzamiento: en GitHub → Settings → Secrets and variables → Actions →
   Variables, crea `REDIRIGIR_A` con la nueva dirección. La copia de GitHub pasa a redirigir allí
   (conservando `#d-160`) y sigue sirviendo `data/contador.json` y `compartir.png`.

Si el servidor de destino tiene una política de seguridad de contenidos, debe permitir
el dominio de GitHub Pages en `connect-src` y el de GoatCounter en `img-src` (ver `campana.config.json`).
