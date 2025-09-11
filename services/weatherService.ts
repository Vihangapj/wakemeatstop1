import { WeatherData } from '../types';

// --- IMPORTANT ---
// The OpenWeatherMap API key is loaded from an environment variable.
// To make the weather feature work, you MUST set the OPENWEATHER_API_KEY
// variable in your deployment environment.
//
// 1. Go to https://openweathermap.org/appid
// 2. Sign up and get your API key.
// 3. Set it as an environment variable named OPENWEATHER_API_KEY.
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.warn("OpenWeather API key is not set. The weather feature is disabled. Please set the OPENWEATHER_API_KEY environment variable.");
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