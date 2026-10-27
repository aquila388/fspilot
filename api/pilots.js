
export default async function handler(req, res) {
  const allowedOrigins = [
    "https://www.flyingfriends.org",
    "https://flyingfriends.org"
  ];

  const origin = req.headers.origin;

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: "Origine non autorizzata"
    });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Metodo non consentito"
    });
  }

  const token = process.env.FSHUB_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "Token FSHub non configurato"
    });
  }

  try {
    const response = await fetch(
      "https://fshub.io/api/v3/airline/3822/pilot",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-Pilot-Token": token
        }
      }
    );

    if (!response.ok) {
      return res.status(502).json({
        error: "Errore nella risposta FSHub",
        status: response.status
      });
    }

    const result = await response.json();

    return res.status(200).json({
      data: result.data || [],
      meta: result.meta || {},
      count: (result.data || []).length
    });
  } catch (error) {
    return res.status(502).json({
      error: "Impossibile contattare FSHub"
    });
  }
}
