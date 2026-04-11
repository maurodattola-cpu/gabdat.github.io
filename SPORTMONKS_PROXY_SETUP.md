# Risultati Live e News Setup

Questo progetto usa un proxy serverless Vercel per leggere:

- risultati realtime da API-Football
- notizie reali da Sportmonks

senza esporre le chiavi API nel browser.

## File inclusi

- `api/sportmonks/livescores.js`
- `api/sportmonks/news.js`
- `vercel.json`
- `.env.example`

## Deploy

1. Importa il repository su Vercel.
2. Aggiungi le variabili ambiente:
   - `API_FOOTBALL_API_KEY`
   - `SPORTMONKS_API_TOKEN`
3. Fai deploy.

## Endpoint pronto

Una volta deployato, la pagina `calcio.html` usa di default:

`/api/sportmonks/livescores`

e per le notizie:

`/api/sportmonks/news?type=mixed`

Parametri opzionali per i risultati:

- `leagues`

Esempi:

- `/api/sportmonks/livescores`
- `/api/sportmonks/livescores?leagues=135`
- `/api/sportmonks/livescores?leagues=39`
- `/api/sportmonks/livescores?leagues=2`

Tipi supportati per le news:

- `type=mixed`
- `type=pre-match`
- `type=post-match`

Esempi news:

- `/api/sportmonks/news?type=mixed`
- `/api/sportmonks/news?type=pre-match&locale=en`

Filtri frontend gia pronti in `calcio.html`:

- `Serie A` usa league id `135`
- `Premier League` usa league id `39`
- `Champions League` usa league id `2`

## Note

- Il proxy risultati usa l'header `x-apisports-key` di API-Football.
- Il proxy news continua a usare il token Sportmonks.
- Il proxy imposta una cache breve per alleggerire il carico.
- Se vuoi personalizzare il frontend, puoi ancora sovrascrivere i proxy via `window.SPORT360_CONFIG`.
