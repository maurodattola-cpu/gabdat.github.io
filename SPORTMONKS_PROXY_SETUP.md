# Sportmonks Proxy Setup

Questo progetto usa un proxy serverless Vercel per leggere risultati realtime e notizie reali da Sportmonks senza esporre la chiave API nel browser.

## File inclusi

- `api/sportmonks/livescores.js`
- `api/sportmonks/news.js`
- `vercel.json`
- `.env.example`

## Deploy

1. Importa il repository su Vercel.
2. Aggiungi la variabile ambiente `SPORTMONKS_API_TOKEN`.
3. Fai deploy.

## Endpoint pronto

Una volta deployato, la pagina `calcio.html` usa di default:

`/api/sportmonks/livescores?mode=all`

e per le notizie:

`/api/sportmonks/news?type=mixed`

Modalita supportate:

- `mode=all`
- `mode=inplay`
- `mode=latest`

Parametri opzionali:

- `include`
- `locale`
- `leagues`

Esempi:

- `/api/sportmonks/livescores?mode=inplay`
- `/api/sportmonks/livescores?mode=all&leagues=384,8`
- `/api/sportmonks/livescores?mode=latest&locale=en`

Tipi supportati per le news:

- `type=mixed`
- `type=pre-match`
- `type=post-match`

Esempi news:

- `/api/sportmonks/news?type=mixed`
- `/api/sportmonks/news?type=pre-match&locale=en`

Filtri frontend gia pronti in `calcio.html`:

- `Serie A` usa league id `384`
- `Premier League` usa league id `8`
- `Champions League` usa league id `2`

## Note

- L'autenticazione usa l'header `Authorization` con il token Sportmonks.
- Il proxy imposta un cache breve per alleggerire il carico.
- Se vuoi personalizzare il frontend, puoi ancora sovrascrivere i proxy via `window.SPORT360_CONFIG`.
