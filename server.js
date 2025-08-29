import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 4000;


const FOURSQUARE_API_KEY = "1EJZMOZHRSAORYRBF1KCPPEDU5XFDTSTNHOAFQ5MQG4HAX3B";
const API_VERSION = "2025-06-17";  

app.use(cors());


app.get("/api/search", async (req, res) => {
  const { ll, categories, limit } = req.query;
  const url = `https://places-api.foursquare.com/places/search?ll=${ll}&categories=${categories}&limit=${limit}`;

  console.log("➡️ Fetching search:", url);
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        "X-Places-Api-Version": API_VERSION,
        Accept: "application/json",
      },
    });
    console.log("FSQ status:", response.status);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/search:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

// Get Photos for Place route
app.get("/api/photos/:id", async (req, res) => {
  const url = `https://places-api.foursquare.com/places/${req.params.id}/photos`;

  console.log("➡️ Fetching photos:", url);
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        "X-Places-Api-Version": API_VERSION,
        Accept: "application/json",
      },
    });
    console.log("FSQ status:", response.status);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/photos:", err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

