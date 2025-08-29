import React, { useEffect, useState } from "react";

const CATEGORIES = [
  { key: "13065", label: "Restaurants", emoji: "🍴" },
  { key: "13032", label: "Coffee Shops", emoji: "☕" },
  { key: "19014", label: "Hotels", emoji: "🏨" },
  { key: "16032", label: "Parks", emoji: "🌳" },
  { key: "16000", label: "Attractions", emoji: "🎡" },
];

export default function TouristGallery() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [category, setCategory] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current location
  useEffect(() => {
    const fallback = { lat: 17.385, lng: 78.4867 }; // Hyderabad fallback
    if (!navigator.geolocation) {
      setLocation(fallback);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation(fallback),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch places + photos
  async function fetchPlaces(cat) {
    if (!location.lat || !location.lng) return;

    setCategory(cat);
    setLoading(true);
    setPlaces([]);

    try {
      const res = await fetch(
        `http://localhost:4000/api/search?ll=${location.lat},${location.lng}&categories=${cat}&limit=8`
      );
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      // Fetch photos for each place
      const withPhotos = await Promise.all(
        data.results.map(async (place) => {
          try {
            const photosRes = await fetch(
              `http://localhost:4000/api/photos/${place.fsq_id}`
            );
            const photos = await photosRes.json();

            return {
              id: place.fsq_id,
              name: place.name,
              address: place.location?.formatted_address,
              photos: Array.isArray(photos) ? photos.map((p) => p.url) : [],
            };
          } catch (err) {
            console.error("Error fetching photos for", place.name, err);
            return {
              id: place.fsq_id,
              name: place.name,
              address: place.location?.formatted_address,
              photos: [],
            };
          }
        })
      );

      setPlaces(withPhotos.filter(Boolean));
    } catch (err) {
      console.error("Error fetching places:", err);
    }

    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📸 Tourist Gallery</h2>

      {/* Category Buttons */}
      <div style={styles.buttonRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => fetchPlaces(cat.key)}
            style={{
              ...styles.btn,
              backgroundColor: category === cat.key ? "#16a34a" : "#2563eb",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={styles.results}>
        <h3>
          {loading
            ? "Loading photos..."
            : places.length > 0
            ? `Showing ${places.length} places`
            : category
            ? "No photos found"
            : "Pick a category above"}
        </h3>

        {places.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.emoji}>
                {CATEGORIES.find((c) => c.key === category)?.emoji || "📍"}
              </span>
              <div>
                <div style={styles.cardTitle}>{p.name}</div>
                <div style={styles.cardAddress}>
                  {p.address || "📍 Address not available"}
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div style={styles.gallery}>
              {p.photos.length > 0 ? (
                p.photos.map((url, i) => (
                  <img key={i} src={url} alt={p.name} style={styles.photo} />
                ))
              ) : (
                <div style={styles.noPhoto}>No photos available</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "system-ui, Arial, sans-serif",
    margin: 30,
  },
  heading: { textAlign: "center", marginBottom: 10, fontSize: 30 },
  buttonRow: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  btn: {
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "600",
    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  results: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 14,
  },
  card: {
    background: "#e0f2fe",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 3px 10px rgba(0,0,0,.08)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  emoji: { fontSize: 22 },
  cardTitle: { fontWeight: 600, fontSize: 16, color: "#111" },
  cardAddress: { fontSize: 13, color: "#555" },
  gallery: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: 6,
    marginTop: 8,
  },
  photo: {
    width: "100%",
    height: 100,
    objectFit: "cover",
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,.15)",
  },
  noPhoto: {
    textAlign: "center",
    fontSize: 13,
    color: "#777",
    padding: 10,
  },
};
