# Decreto Mari Carmen

Web estática con las caras de los 350 diputados y diputadas del Congreso y un botón por cada uno:
**«Pídele a X que vote el Decreto Mari Carmen este viernes»**, que abre un correo ya redactado
dirigido a su dirección pública.


## Datos

`npm run scrape` descarga de congreso.es:

1. La lista de diputados en activo de la XV Legislatura (endpoint de búsqueda de diputados).
2. La ficha pública de cada uno, de donde se extrae el correo (`@congreso.es`).
3. Su foto oficial, guardada en `public/fotos/<id>.jpg`.

Resultado: `public/data/diputados.json`. Quien no publica correo en su ficha tiene `email: null`
y el botón enlaza a su ficha oficial. No se infieren direcciones.

Añade `--force-photos` para volver a descargar las fotos.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5902
npm run build    # genera dist/, desplegable en cualquier hosting estático
```
