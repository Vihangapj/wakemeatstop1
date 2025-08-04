import React from 'react';
import { AlertOptions } from '../types';
import IconBell from './icons/IconBell';
import IconVibration from './icons/IconVibration';
import IconSpeaker from './icons/IconSpeaker';
import IconSparkles from './icons/IconSparkles';
import IconStar from './icons/IconStar';
import IconClock from './icons/IconClock';

interface ControlsProps {
  radius: number;
  setRadius: (radius: number) => void;
  alertOptions: AlertOptions;
  setAlertOptions: (options: AlertOptions) => void;
  isTracking: boolean;
  onToggleTracking: () => void;
  distance: number | null;
  eta: string | null;
  hasDestination: boolean;
  geolocationError: string | null;
  onOpenAIAssistant: () => void;
  onSaveFavorite: () => void;
  isFavorite: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  radius,
  setRadius,
  alertOptions,
  setAlertOptions,
  isTracking,
  onToggleTracking,
  distance,
  eta,
  hasDestination,
  geolocationError,
  onOpenAIAssistant,
  onSaveFavorite,
  isFavorite,
}) => {
  const formatDistance = (dist: number | null) => {
    if (dist === null) return '--';
    if (dist >= 1000) {
      return `${(dist / 1000).toFixed(2)} km`;
    }
    return `${Math.round(dist)} m`;
  };

  const getStatusMessage = () => {
    if (geolocationError) return <span className="text-red-400 text-sm">{geolocationError}</span>;
    if (isTracking) return (
      <div className="flex items-center justify-center gap-4 text-teal-400">
        <span>Distance: {formatDistance(distance)}</span>
        {eta && (
          <span className="flex items-center gap-1.5">
            <IconClock className="w-4 h-4" /> ETA: {eta}
          </span>
        )}
      </div>
    );
    if (!hasDestination) return <span className="text-gray-400">Tap map or use AI to set destination</span>;
    return <span className="text-gray-300">Ready to track</span>;
  }

  const toggleAlertOption = (option: keyof AlertOptions) => {
    setAlertOptions({ ...alertOptions, [option]: !alertOptions[option] });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-5 text-white max-w-md mx-auto border border-gray-700">
        
        <div className="text-center mb-4 h-5 flex items-center justify-center font-medium">
          {getStatusMessage()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-full">
              <label htmlFor="radius" className="block text-sm font-medium text-gray-300 mb-1 text-center">
                Alert Radius: <span className="font-bold text-teal-400">{radius}m</span>
              </label>
              <input
                id="radius"
                type="range"
                min="100"
                max="5000"
                step="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-teal-500"
                disabled={isTracking || !hasDestination}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => toggleAlertOption('sound')} className={`flex items-center justify-center p-2 rounded-lg text-sm transition-all duration-200 border-2 ${alertOptions.sound ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle sound alert"><IconBell className="w-5 h-5"/></button>
                <button onClick={() => toggleAlertOption('vibration')} className={`flex items-center justify-center p-2 rounded-lg text-sm transition-all duration-200 border-2 ${alertOptions.vibration ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle vibration alert"><IconVibration className="w-5 h-5"/></button>
                <button onClick={() => toggleAlertOption('voice')} className={`flex items-center justify-center p-2 rounded-lg text-sm transition-all duration-200 border-2 ${alertOptions.voice ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle voice alert"><IconSpeaker className="w-5 h-5"/></button>
            </div>
        </div>
        
        <div className="flex gap-2">
            <button onClick={onOpenAIAssistant} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0" aria-label="Open AI Assistant">
              <IconSparkles className="w-6 h-6 text-teal-400" />
            </button>
            {hasDestination && !isFavorite && (
                <button onClick={onSaveFavorite} disabled={isTracking} className="p-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                    <IconStar className="w-6 h-6"/>
                </button>
            )}
            <button
              onClick={onToggleTracking}
              disabled={!hasDestination || !!geolocationError}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg
                ${!hasDestination || !!geolocationError ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 
                isTracking ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/30'}`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Controls;