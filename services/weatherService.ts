import { WeatherData } from '../types';

const API_KEY = '6cab979ab2cfd70b84e8d39baf24da9e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
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
