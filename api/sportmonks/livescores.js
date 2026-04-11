const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io/fixtures";
const DEFAULT_TIMEZONE = "Europe/Rome";

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getSeasonYear(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return month >= 7 ? year : year - 1;
}

function getTodayDateString() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(new Date());
}

function buildApiFootballUrl({ live = false, leagues }) {
  const upstreamUrl = new URL(API_FOOTBALL_BASE_URL);
  upstreamUrl.searchParams.set("timezone", DEFAULT_TIMEZONE);

  if (live) {
    upstreamUrl.searchParams.set("live", "all");
  } else {
    upstreamUrl.searchParams.set("date", getTodayDateString());
    upstreamUrl.searchParams.set("season", String(getSeasonYear()));
  }

  if (leagues) {
    upstreamUrl.searchParams.set("league", leagues);
  }

  return upstreamUrl;
}

function normalizeStatus(fixture) {
  const elapsed = fixture?.status?.elapsed;
  const short = fixture?.status?.short || "";
  const long = fixture?.status?.long || "Oggi";

  if (elapsed && /1H|2H|ET|BT|P|LIVE|INT/i.test(short)) {
    return `Live ${elapsed}'`;
  }

  if (/FT|AET|PEN/i.test(short)) {
    return "Finale";
  }

  return long;
}

function normalizeFixture(item) {
  const leagueName = item?.league?.name || "Campionato";
  const home = item?.teams?.home?.name || "Casa";
  const away = item?.teams?.away?.name || "Trasferta";
  const goals = item?.goals || {};
  const venue = item?.fixture?.venue?.name;
  const city = item?.fixture?.venue?.city;
  const noteParts = [venue, city].filter(Boolean);

  return {
    id: item?.fixture?.id || `${leagueName}-${home}-${away}`,
    league: leagueName,
    status: normalizeStatus(item?.fixture),
    home,
    away,
    homeScore: typeof goals.home === "number" ? goals.home : null,
    awayScore: typeof goals.away === "number" ? goals.away : null,
    note: noteParts.length ? `Stadio: ${noteParts.join(", ")}` : "Aggiornamento realtime da API-Football."
  };
}

async function fetchApiFootball(url, apiKey) {
  const upstreamResponse = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-apisports-key": apiKey
    }
  });

  const payload = await upstreamResponse.json();

  if (!upstreamResponse.ok) {
    const error = new Error("API-Football upstream request failed");
    error.status = upstreamResponse.status;
    error.payload = payload;
    throw error;
  }

  return payload;
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

  const apiKey = process.env.API_FOOTBALL_API_KEY;
  if (!apiKey) {
    response.status(500).json({
      error: "API_FOOTBALL_API_KEY is not configured",
      hint: "Set the environment variable in Vercel project settings."
    });
    return;
  }

  try {
    const requestUrl = new URL(request.url, `https://${request.headers.host}`);
    const leagues = requestUrl.searchParams.get("leagues");
    const [livePayload, todayPayload] = await Promise.all([
      fetchApiFootball(buildApiFootballUrl({ live: true, leagues }), apiKey),
      fetchApiFootball(buildApiFootballUrl({ live: false, leagues }), apiKey)
    ]);

    const combined = [...(livePayload.response || []), ...(todayPayload.response || [])];
    const uniqueFixtures = Array.from(
      new Map(combined.map((item) => [item?.fixture?.id, item])).values()
    );

    response.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
    response.status(200).json({
      provider: "API-Football",
      data: uniqueFixtures.map(normalizeFixture)
    });
  } catch (error) {
    response.status(error.status || 500).json({
      error: "Unexpected proxy error",
      details: error.payload || (error instanceof Error ? error.message : "Unknown error")
    });
  }
}
