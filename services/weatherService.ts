import { WeatherData } from '../types';

// --- IMPORTANT ---
// The API key previously used ('781e9c87207bf8091971eaf8b5063a03') is an invalid example key.
// To make the weather feature work, you MUST get your own FREE API key from OpenWeatherMap.
// 1. Go to https://openweathermap.org/appid
// 2. Sign up and get your API key.
// 3. Paste your key here.
const API_KEY = '6cab979ab2cfd70b84e8d39baf24da9e'; // <-- PASTE YOUR VALID OPENWEATHERMAP API KEY HERE
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.warn("OpenWeather API key is not set. The weather feature is disabled. Please add a valid key to services/weatherService.ts");
    return null;
  }
  try {
    const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        const errorData = await response.json();
        // OpenWeatherMap returns a 401 for invalid API keys.
        throw new Error(`Failed to fetch weather: ${errorData.message}`);
    }
    const data = await response.json();
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1),
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      cloudiness: data.clouds.all,
      rainVolume: data.rain ? data.rain['1h'] : undefined,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};