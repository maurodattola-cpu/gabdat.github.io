const PRE_MATCH_URL = "https://api.sportmonks.com/v3/football/news/pre-match";
const POST_MATCH_URL = "https://api.sportmonks.com/v3/football/news/post-match";
const DEFAULT_INCLUDE = "fixture;league";

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function buildNewsRequests(requestUrl) {
  const type = requestUrl.searchParams.get("type") || "mixed";
  const include = requestUrl.searchParams.get("include") || DEFAULT_INCLUDE;
  const locale = requestUrl.searchParams.get("locale") || "it";

  const buildUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    url.searchParams.set("include", include);
    url.searchParams.set("locale", locale);
    return url;
  };

  if (type === "pre-match") {
    return [{ type: "pre-match", url: buildUrl(PRE_MATCH_URL) }];
  }

  if (type === "post-match") {
    return [{ type: "post-match", url: buildUrl(POST_MATCH_URL) }];
  }

  return [
    { type: "pre-match", url: buildUrl(PRE_MATCH_URL) },
    { type: "post-match", url: buildUrl(POST_MATCH_URL) }
  ];
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
    const requests = buildNewsRequests(requestUrl);

    const responses = await Promise.all(
      requests.map(async (entry) => {
        const upstreamResponse = await fetch(entry.url, {
          headers: {
            Accept: "application/json",
            Authorization: token
          }
        });

        const payload = await upstreamResponse.json();

        if (!upstreamResponse.ok) {
          throw new Error(`Sportmonks news upstream failed: ${upstreamResponse.status}`);
        }

        const items = Array.isArray(payload?.data) ? payload.data : [];
        return items.map((item) => ({ ...item, type: entry.type }));
      })
    );

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    response.status(200).json({ data: responses.flat() });
  } catch (error) {
    response.status(500).json({
      error: "Unexpected news proxy error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
