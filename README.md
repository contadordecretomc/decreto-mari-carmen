# Decreto Mari Carmen

Web estática con las caras de los 350 diputados y diputadas del Congreso y un botón por cada uno:
**«Pídele a X que vote el Decreto Mari Carmen este viernes»**, que abre un correo ya redactado
dirigido a su dirección pública.


## Datos

`npm run scrape` descarga de congreso.es:

1. La lista de diputados en activo de la XV Legislatura (endpoint de búsqueda de diputados).
2. La ficha pública de cada uno, de donde se extrae el correo (`@congreso.es`).
3. Su foto oficial, guardada en `public/fotos/<id>.jpg`.

Resultado: `public/data/diputados.json`. No se infieren direcciones.

31 diputados no publican correo en su ficha (en ninguna legislatura). Para ellos, `contactoGrupo`
guarda la dirección general de su grupo parlamentario o su partido, verificada a mano en la web de
cada uno ([scripts/contactos-grupos.mjs](scripts/contactos-grupos.mjs)). El correo va con
«A la atención de…» y el nombre en el asunto.

Añade `--force-photos` para volver a descargar las fotos.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5902
npm run build    # genera dist/, desplegable en cualquier hosting estático
```

## Contador de correos preparados

Cada clic en un botón de escribir (o «Copiar mensaje») envía a GoatCounter un evento anónimo
`correos/<n>`, con `n` = diputados nuevos para ese navegador (cada navegador cuenta a cada diputado
una vez). No hay cookies ni datos personales.

La web no consulta nada en directo: `.github/workflows/deploy.yml` se ejecuta cada 10 minutos,
suma `n × visitas` con `scripts/update-contador.mjs`, escribe `public/data/contador.json` y
publica en GitHub Pages.

Configuración:

1. `src/config.ts` → `GOATCOUNTER_CODE` con el código del sitio de GoatCounter.
2. En GitHub → Settings → Secrets and variables → Actions:
   - Variable `GOATCOUNTER_SITE` = el mismo código.
   - Secret `GOATCOUNTER_TOKEN` = API key de GoatCounter con permiso «Read statistics».
3. Settings → Pages → Source: **GitHub Actions**.
