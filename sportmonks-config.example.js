window.SPORT360_CONFIG = {
  // Inserisci qui l'URL del tuo proxy/serverless che chiama Sportmonks lato server.
  // Non mettere la chiave API direttamente nel browser.
  proxyUrl: "https://your-domain.example.com/api/sportmonks/livescores?mode=all",

  // Route dedicata per le notizie reali pre-match e post-match.
  newsProxyUrl: "https://your-domain.example.com/api/sportmonks/news?type=mixed",

  // Etichetta mostrata nella UI.
  providerLabel: "Sportmonks",

  // Intervallo di refresh in millisecondi.
  pollMs: 60000,

  // Timeout della chiamata fetch in millisecondi.
  timeoutMs: 12000
};
