window.SPORT360_CONFIG = {
  // Inserisci qui l'URL del tuo proxy/serverless che chiama API-Football lato server.
  // Non mettere la chiave API direttamente nel browser.
  proxyUrl: "https://your-domain.example.com/api/sportmonks/livescores",

  // Route dedicata per le notizie reali pre-match e post-match.
  newsProxyUrl: "https://your-domain.example.com/api/sportmonks/news?type=mixed",

  // Etichette mostrate nella UI.
  resultsProviderLabel: "API-Football",
  newsProviderLabel: "Sportmonks",

  // Intervallo di refresh in millisecondi.
  pollMs: 3600000,

  // Timeout della chiamata fetch in millisecondi.
  timeoutMs: 12000
};
