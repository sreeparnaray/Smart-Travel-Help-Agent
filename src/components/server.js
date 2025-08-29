// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 4000;

// Replace with your real Foursquare API key
const FOURSQUARE_API_KEY = "J4L3GVRUWBEDM3D5W4G3P4MTVB34HTHFFSVEK0C4NIZLDO4Y";

// Enable CORS for your frontend
app.use(cors());

// Route: Search places
app.get("/api/search", async (req, res) => {
  try {
    const { ll, categories, limit } = req.query;
    const response = await fetch(
      `https://places-api.foursquare.com/v3/places/search?ll=${ll}&categories=${categories}&limit=${limit}`,
      {
        headers: {
          Authorization: FOURSQUARE_API_KEY,
          accept: "application/json",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/search:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

// Route: Get photos for a place
app.get("/api/photos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(
      `https://places-api.foursquare.com/v3/places/${id}/photos`,
      {
        headers: {
          Authorization: FOURSQUARE_API_KEY,
          accept: "application/json",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error in /api/photos:", err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
