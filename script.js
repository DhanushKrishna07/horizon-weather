const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("static"));

const weatherCode = {
  "0": "Unknown",
  "1000": "Clear, Sunny",
  "1100": "Mostly Clear",
  "1101": "Partly Cloudy",
  "1102": "Mostly Cloudy",
  "1001": "Cloudy",
  "2000": "Fog",
  "2100": "Light Fog",
  "4000": "Drizzle",
  "4001": "Rain",
  "4200": "Light Rain",
  "4201": "Heavy Rain",
  "5000": "Snow",
  "5001": "Flurries",
  "5100": "Light Snow",
  "5101": "Heavy Snow",
  "6000": "Freezing Drizzle",
  "6001": "Freezing Rain",
  "6200": "Light Freezing Rain",
  "6201": "Heavy Freezing Rain",
  "7000": "Ice Pellets",
  "7101": "Heavy Ice Pellets",
  "7102": "Light Ice Pellets",
  "8000": "Thunderstorm",
};

app.get("/weather", async (req, res) => {
  try {
    const { city } = req.query;
    const apiKey = process.env.API_KEY;
    const apiUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${city}&apikey=${apiKey}`;

    const response = await axios.get(apiUrl);
    res.json(formatWeatherData(response.data));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while fetching weather data.",
    });
  }
});

// Function to format weather data
function formatWeatherData(data) {
  return (
    data?.timelines?.daily?.map(({ time, values }) => {
      return {
        time,
        weatherCode: values.weatherCodeMax,
        temperature: values.temperatureAvg,
        humidity: values.humidityAvg,
      };
    }) ?? []
  );
}

// Function to convert wind direction in degrees to cardinal direction
function convertWindDirection(degrees) {
  
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Default route handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  const open = (await import("open")).default;
  open(`http://localhost:${PORT}`);
});



