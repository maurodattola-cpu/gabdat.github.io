const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football/livescores";
const DEFAULT_INCLUDE = "participants;scores;league;state";

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function buildSportmonksUrl(requestUrl) {
  const mode = requestUrl.searchParams.get("mode") || "all";
  const include = requestUrl.searchParams.get("include") || DEFAULT_INCLUDE;
  const locale = requestUrl.searchParams.get("locale") || "it";
  const leagues = requestUrl.searchParams.get("leagues");

  let endpoint = SPORTMONKS_BASE_URL;
  if (mode === "latest") {
    endpoint = `${SPORTMONKS_BASE_URL}/latest`;
  } else if (mode === "inplay") {
    endpoint = `${SPORTMONKS_BASE_URL}/inplay`;
  }

  const upstreamUrl = new URL(endpoint);
  upstreamUrl.searchParams.set("include", include);
  upstreamUrl.searchParams.set("locale", locale);

  if (leagues) {
    upstreamUrl.searchParams.set("filters", `fixtureLeagues:${leagues}`);
  }

  return upstreamUrl;
}

export default async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    response.status(500).json({
      error: "SPORTMONKS_API_TOKEN is not configured",
      hint: "Set the environment variable in Vercel project settings."
    });
    return;
  }

  try {
    const requestUrl = new URL(request.url, `https://${request.headers.host}`);
    const upstreamUrl = buildSportmonksUrl(requestUrl);

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        Authorization: token
      }
    });

    const payload = await upstreamResponse.json();

    response.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

    if (!upstreamResponse.ok) {
      response.status(upstreamResponse.status).json({
        error: "Sportmonks upstream request failed",
        upstreamStatus: upstreamResponse.status,
        details: payload
      });
      return;
    }

    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      error: "Unexpected proxy error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
