import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";
import FloatingChatButton from "../chatcomponents/FloatingChatButton";
import styles from "./Dashboard.module.css";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import CloudIcon from "@mui/icons-material/Cloud";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TravelNewsFeed from "../components/TravelNewsFeed";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function DashboardPage() {
  const [location, setLocation] = useState({ city: "", region: "", country: "" });
  const [weather, setWeather] = useState({ temp: "", description: "", humidity: "" });
  const [date, setDate] = useState("");

  const userName = localStorage.getItem("userName") || "User";

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);


  


  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          `https://newsdata.io/1api/1/latest?apikey=pub_a9b4ef8457154e18845b075439f7ecf4&q=Travel%2C%20Famous%20places%2C%20Famous%20foods%2C%20Tourism`
        );
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setNews(data.results);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);


  // 🗓️ Get today’s date
  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const dayName = today.toLocaleDateString("en-GB", { weekday: "long" });
    setDate(`${formatted} (${dayName})`);
  }, []);

  // 📍 Get user location + 🌦️ weather
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Reverse geocode → city/region/country
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const geoData = await geoRes.json();
        setLocation({
          city: geoData.city || geoData.locality,
          region: geoData.principalSubdivision,
          country: geoData.countryName,
        });

        // Weather (OpenWeather API)
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY; // set in .env
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        const weatherData = await weatherRes.json();
        setWeather({
          temp: weatherData.main.temp,
          description: weatherData.weather[0].description,
          humidity: weatherData.main.humidity,
        });
      });
    }
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <Layout />
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ p: 1, mt: 8 }}>
          <section className={styles.section}>
            {/* Welcome */}
            <div className={styles.titleRow}>
              <div>
                <img className={styles.welcome} src="../../../stha-background.png" alt="welcome" />
                <h2 className={styles.pageTitle}>Hi {userName}!</h2>
              </div>
            </div>

            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
              {/* Location */}
              <div className={styles.iconCard}>
                <div className={`${styles.icon} ${styles.purple}`}><MyLocationIcon /></div>
                <div className={styles.kpiContent}>
                  <h6 className={styles.kpiLabel}>My Current Location</h6>
                  <h3 className={styles.kpiValue}>{location.city || "Detecting..."}</h3>
                  <p className={`${styles.delta} ${styles.up}`}>
                    {location.country} <span className={styles.muted}>({location.region})</span>
                  </p>
                </div>
              </div>

              {/* Weather */}
              <div className={styles.iconCard}>
                <div className={`${styles.icon} ${styles.success}`}><DeviceThermostatIcon /></div>
                <div className={styles.kpiContent}>
                  <h6 className={styles.kpiLabel}>Current Weather</h6>
                  <h3 className={styles.kpiValue}>
                    {weather.temp ? `${weather.temp}°C` : "Loading..."}
                  </h3>
                  <p className={`${styles.delta} ${styles.up}`}>
                    {weather.humidity && `${weather.humidity}% Humidity`}{" "}
                    <span className={styles.muted}>{weather.description}</span>
                  </p>
                </div>
              </div>

              {/* Weather description */}
              <div className={styles.iconCard}>
                <div className={`${styles.icon} ${styles.primary}`}><CloudIcon /></div>
                <div className={styles.kpiContent}>
                  <h6 className={styles.kpiLabel}>Condition</h6>
                  <h3 className={styles.kpiValue}>
                    {weather.description || "Fetching..."}
                  </h3>
                  <p className={`${styles.delta} ${styles.up}`}>Weather Updates</p>
                </div>
              </div>

              {/* Date */}
              <div className={styles.iconCard}>
                <div className={`${styles.icon} ${styles.orange}`}><CalendarMonthIcon /></div>
                <div className={styles.kpiContent}>
                  <h6 className={styles.kpiLabel}>Today</h6>
                  <h3 className={styles.kpiValue}>{date || "Loading..."}</h3>
                  <p className={`${styles.delta} ${styles.down}`}>
                    <span className={styles.muted}>Stay safe & enjoy!</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className={styles.gridTwoColsLargeLeft}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h6 className={styles.cardSubtitle}>Plans</h6>
                    <h3 className={styles.cardTitle}>Current Plans</h3>
                  </div>
                  <select className={styles.select} defaultValue="Yearly">
                    <option>Yearly</option>
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <div className={styles.chartHolder}>
                  {/* Placeholder canvas; hook up Chart.js later if needed */}
                  <canvas id="chart1" className={styles.canvas}></canvas>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h6 className={styles.cardSubtitle}>Upcoming Plans</h6>
                  <select className={styles.select} defaultValue="Yearly">
                    <option>Yearly</option>
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                </div>
                <div className={styles.chartHolder}>
                  <canvas id="chart2" className={styles.canvas}></canvas>
                </div>
              </div>
            </div>

            {/* Map + Top Selling */}
            <div className={styles.gridTwoColsSmallLeft}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h6 className={styles.cardSubtitle}>Travel News</h6>
                </div>
                <div className={styles.cardContent}>
                  

                  {loading ? (
      <p className="text-gray-500 text-sm">Loading news...</p>
    ) : news.length === 0 ? (
      <p className="text-gray-500 text-sm">No travel news available.</p>
    ) : (
      <ul className="space-y-3">
        {news.slice(0, 6).map((item, index) => (
          <li key={index} className="border-b pb-2 last:border-none">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              {item.title}
            </a>
            <p className="text-xs text-gray-500">
              {item.pubDate
                ? new Date(item.pubDate).toLocaleString()
                : "No date"}
            </p>
          </li>
        ))}
      </ul>
    )}


                </div>

                <p className={styles.muted}>Last updated: Just Now</p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h6 className={styles.cardSubtitle}>Your Scheduled Plans</h6>
                  <select className={styles.select} defaultValue="Yearly">
                    <option>Yearly</option>
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Trip Name</th>
                        <th>Location</th>
                        <th>Total Cost</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td>
                          <div className={styles.productCell}>
                            <p>Trip 1</p>
                          </div>
                        </td>
                        <td>Bangalore</td>
                        <td>6000</td>
                        <td>10/06/25</td>
                        <td>15/06/25</td>
                        <td className={styles.textRight}><button>📝</button>|<button>🗑️</button></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td>
                          <div className={styles.productCell}>
                            <p>Trip 1</p>
                          </div>
                        </td>
                        <td>Bangalore</td>
                        <td>6000</td>
                        <td>10/06/25</td>
                        <td>15/06/25</td>
                        <td className={styles.textRight}><button>📝</button>|<button>🗑️</button></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td>
                          <div className={styles.productCell}>
                            <p>Trip 1</p>
                          </div>
                        </td>
                        <td>Bangalore</td>
                        <td>6000</td>
                        <td>10/06/25</td>
                        <td>15/06/25</td>
                        <td className={styles.textRight}><button>📝</button>|<button>🗑️</button></td>
                      </tr>
                      <tr>
                        <td><input type="checkbox" /></td>
                        <td>
                          <div className={styles.productCell}>
                            <p>Trip 1</p>
                          </div>
                        </td>
                        <td>Bangalore</td>
                        <td>6000</td>
                        <td>10/06/25</td>
                        <td>15/06/25</td>
                        <td className={styles.textRight}><button>📝</button>|<button>🗑️</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* You can continue porting more sections below if needed */}
          </section>
          {/* ======== END: Body ======== */}

          {/* Keep nested routes working if you need them later */}
          <Outlet />
        </Box>
      </Box>

      <FloatingChatButton />
    </Box>
  );
}