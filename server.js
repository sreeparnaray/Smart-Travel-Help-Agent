import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = 4000;

const FOURSQUARE_API_KEY = "1EJZMOZHRSAORYRBF1KCPPEDU5XFDTSTNHOAFQ5MQG4HAX3B"; 
const UNSPLASH_ACCESS_KEY = "K7pHwS1LxSL7J20TUL2_2u_6juOvtdqS7ZWzcFH5Okg"; 
const API_VERSION = "2025-06-17";

app.use(cors());

// ==========================
// Search Places
// ==========================
app.get("/api/search", async (req, res) => {
  const { ll, categories, limit = 8 } = req.query;

  const url = new URL("https://places-api.foursquare.com/places/search");
  url.searchParams.set("ll", ll);
  url.searchParams.set("limit", limit);
  if (categories) url.searchParams.set("categories", categories);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        "X-Places-API-Version": API_VERSION,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in /api/search:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

// ==========================
// Nearby Suggestions
// ==========================
app.get("/api/nearby", async (req, res) => {
  const { ll, categories, limit = 5 } = req.query;

  const url = new URL("https://places-api.foursquare.com/places/search");
  url.searchParams.set("ll", ll);
  url.searchParams.set("limit", limit);
  if (categories) url.searchParams.set("categories", categories);
  url.searchParams.set("sort", "distance");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        "X-Places-API-Version": API_VERSION,
        Accept: "application/json",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in /api/nearby:", err);
    res.status(500).json({ error: "Failed to fetch nearby places" });
  }
});

// ==========================
// Get Photos for Place
// ==========================
app.get("/api/photos/:id", async (req, res) => {
  const placeId = req.params.id;
  const { name, category } = req.query;

  let photos = [];

  // helper
  async function fetchFsqPhotos(id, sortType = "popular") {
    const url = `https://places-api.foursquare.com/places/${id}/photos?limit=6&sort=${sortType}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        "X-Places-API-Version": API_VERSION,
        Accept: "application/json",
      },
    });
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data.map((p) => {
        const targetWidth = p.width > 800 ? 800 : p.width;
        const aspectRatio = p.height / p.width;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        return {
          url: `${p.prefix}${targetWidth}x${targetHeight}${p.suffix}`,
          width: targetWidth,
          height: targetHeight,
          created_at: p.created_at,
          source: "foursquare",
        };
      });
    }
    return [];
  }

  try {
    // Step 1: Direct place photos
    photos = await fetchFsqPhotos(placeId, "popular");
    if (photos.length === 0) {
      photos = await fetchFsqPhotos(placeId, "newest");
    }

    // Step 2: Category-wide Foursquare fallback
    if (photos.length === 0 && category) {
      const catUrl = new URL("https://places-api.foursquare.com/places/search");
      catUrl.searchParams.set("categories", category);
      catUrl.searchParams.set("ll", "40.758,-73.9855"); // fallback NYC
      catUrl.searchParams.set("limit", 5);

      const catRes = await fetch(catUrl.toString(), {
        headers: {
          Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
          "X-Places-API-Version": API_VERSION,
          Accept: "application/json",
        },
      });
      const catData = await catRes.json();

      if (catData.results?.length > 0) {
        for (let c of catData.results) {
          let catPhotos = await fetchFsqPhotos(c.fsq_id, "popular");
          if (catPhotos.length > 0) {
            photos = catPhotos;
            break;
          }
        }
      }
    }

    // Step 3: Unsplash fallback
    if (photos.length === 0 && UNSPLASH_ACCESS_KEY) {
      const query = name || category || "travel";
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`;
      const uRes = await fetch(unsplashUrl);
      const uData = await uRes.json();
      photos =
        uData.results?.map((p) => ({
          url: p.urls.small,
          width: p.width,
          height: p.height,
          created_at: p.created_at || new Date().toISOString(),
          source: "unsplash",
        })) || [];
    }

    res.json(photos);
  } catch (err) {
    console.error("❌ Error in /api/photos:", err);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
