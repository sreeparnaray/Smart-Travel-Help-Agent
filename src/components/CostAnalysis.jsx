import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./CostAnalysis.module.css";

export default function CostAnalysis() {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    rooms: 1,
    hotelRating: "3",
    foodType: "veg",
    meals: {
      breakfast: false,
      lunch: false,
      snacks: false,
      dinner: false,
    },
    transport: "train",
    nearby: false,
  });

  const [analysis, setAnalysis] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMealChange = (meal) => {
    setForm({
      ...form,
      meals: { ...form.meals, [meal]: !form.meals[meal] },
    });
  };

  useEffect(() => {
    const { travelers, rooms, hotelRating, transport, meals, nearby } = form;
    if (!travelers || travelers <= 0) return;

    const transportCost =
      transport === "flight" ? 5000 * travelers : 1000 * travelers;
    const hotelCost =
      rooms *
      (hotelRating === "5" ? 4000 : hotelRating === "4" ? 2500 : 1500);
    const foodCost =
      Object.values(meals).filter(Boolean).length * 300 * travelers;
    const otherCost = nearby ? 2000 : 1000;

    const total = transportCost + hotelCost + foodCost + otherCost;

    setAnalysis({
      transportCost,
      hotelCost,
      foodCost,
      otherCost,
      total,
      perHead: (total / travelers).toFixed(2),
      nearbyPlaces: nearby
        ? "Agent analyzing.."
        : "Not selected",
    });
  }, [form]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardContent>
          <Typography variant="h4" className={styles.header}>
            ✈️ Trip Cost Analysis
          </Typography>
          <Divider className={styles.divider} />

          <Grid container spacing={2}>
            {/* ------------------- LEFT SIDE ------------------- */}
            <Grid item xs={12} md={6} className={styles.leftPanel}>
              <Typography variant="h6" className={styles.subHeader}>
                User Details
              </Typography>

              <TextField
                fullWidth
                label="Origin"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                className={styles.input}
              />
              <TextField
                fullWidth
                label="Destination"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                className={styles.input}
              />
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={handleChange}
                className={styles.input}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={handleChange}
                className={styles.input}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Travelers"
                    name="travelers"
                    value={form.travelers}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Rooms"
                    name="rooms"
                    value={form.rooms}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </Grid>
              </Grid>

              <TextField
                select
                fullWidth
                label="Hotel Rating"
                name="hotelRating"
                value={form.hotelRating}
                onChange={handleChange}
                className={styles.input}
              >
                <MenuItem value="3">3 Star</MenuItem>
                <MenuItem value="4">4 Star</MenuItem>
                <MenuItem value="5">5 Star</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Food Type"
                name="foodType"
                value={form.foodType}
                onChange={handleChange}
                className={styles.input}
              >
                <MenuItem value="veg">Veg</MenuItem>
                <MenuItem value="nonveg">Non-Veg</MenuItem>
              </TextField>

              <Typography className={styles.mealLabel}>Meals:</Typography>
              {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
                <FormControlLabel
                  key={meal}
                  control={
                    <Checkbox
                      checked={form.meals[meal]}
                      onChange={() => handleMealChange(meal)}
                    />
                  }
                  label={meal.charAt(0).toUpperCase() + meal.slice(1)}
                />
              ))}

              <TextField
                select
                fullWidth
                label="Transport"
                name="transport"
                value={form.transport}
                onChange={handleChange}
                className={styles.input}
              >
                <MenuItem value="train">Train</MenuItem>
                <MenuItem value="bus">Bus</MenuItem>
                <MenuItem value="flight">Flight</MenuItem>
              </TextField>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.nearby}
                    onChange={() => setForm({ ...form, nearby: !form.nearby })}
                  />
                }
                label="Want to travel nearby famous places?"
              />
            </Grid>

            {/* ------------------- RIGHT SIDE ------------------- */}
            <Grid item xs={12} md={6} className={styles.rightPanel}>
              <Typography variant="h6" className={styles.subHeader}>
                💡 Recommendation By Agent
              </Typography>
              {analysis ? (
                <>
                  <Typography>🚆 Travel Cost: ₹{analysis.transportCost}</Typography>
                  <Typography>🏨 Hotel Cost: ₹{analysis.hotelCost}</Typography>
                  <Typography>🍽 Food Cost: ₹{analysis.foodCost}</Typography>
                  <Typography>🎟 Other Cost: ₹{analysis.otherCost}</Typography>
                  <Divider className={styles.divider} />
                  <Typography variant="h6" className={styles.total}>
                    Total Trip Cost: ₹{analysis.total}
                  </Typography>
                  <Typography>👤 Cost per Head: ₹{analysis.perHead}</Typography>
                  <Divider className={styles.divider} />
                  <Typography>
                    📍 Nearby Travel Places: {analysis.nearbyPlaces}
                  </Typography>

                  {/* Pie Chart */}
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Transport", value: analysis.transportCost },
                          { name: "Hotel", value: analysis.hotelCost },
                          { name: "Food", value: analysis.foodCost },
                          { name: "Other", value: analysis.otherCost },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {[analysis.transportCost, analysis.hotelCost, analysis.foodCost, analysis.otherCost].map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <Typography color="text.secondary">
                  Start filling details to see cost analysis
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}
