import React, { useState } from 'react';
import { WeatherData } from '../types';
import IconWind from './icons/IconWind';
import IconDroplet from './icons/IconDroplet';
import IconCloudRain from './icons/IconCloudRain';
import IconCloud from './icons/IconCloud';

interface WeatherDisplayProps {
  weatherData: WeatherData;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)} 
        className="flex-shrink-0 flex flex-col items-center justify-center text-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors w-24 h-24"
        aria-label="Show weather details"
        title="Show weather details"
      >
          <img src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} alt={weatherData.description} className="w-12 h-12" />
          <p className="text-xl font-bold text-white -mt-2">{weatherData.temp}°C</p>
      </button>
    );
  }

  return (
    <div 
      className="flex-shrink-0 flex flex-col items-center text-center bg-gray-800/60 backdrop-blur-sm p-3 rounded-lg cursor-pointer shadow-lg animate-fade-in"
      onClick={() => setIsExpanded(false)}
      title="Hide weather details"
    >
        <div className="flex items-center gap-2 w-full">
            <img src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`} alt={weatherData.description} className="w-12 h-12 -m-1" />
            <div className="text-left">
              <p className="text-2xl font-bold text-white">{weatherData.temp}°C</p>
              <p className="text-xs text-gray-300 capitalize whitespace-nowrap -mt-1">{weatherData.description}</p>
            </div>
        </div>
        
        <div className="border-t border-gray-700 w-full my-2"></div>

        <div className="space-y-1 text-sm text-gray-300 w-full text-left">
            {weatherData.rainVolume !== undefined && weatherData.rainVolume > 0 && (
                <div className="flex items-center gap-2">
                    <IconCloudRain className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    <span>{weatherData.rainVolume} mm rain (1h)</span>
                </div>
            )}
             <div className="flex items-center gap-2">
                <IconWind className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{weatherData.windSpeed.toFixed(1)} m/s wind</span>
            </div>
            <div className="flex items-center gap-2">
                <IconDroplet className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{weatherData.humidity}% humidity</span>
            </div>
             <div className="flex items-center gap-2">
                <IconCloud className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>{weatherData.cloudiness}% clouds</span>
            </div>
        </div>
    </div>
  );
};

export default WeatherDisplay;