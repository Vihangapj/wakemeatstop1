import React from 'react';
import { AlertOptions, AlertDistance } from '../types';
import IconBell from './icons/IconBell';
import IconVibration from './icons/IconVibration';
import IconSpeaker from './icons/IconSpeaker';
import IconSparkles from './icons/IconSparkles';
import IconStar from './icons/IconStar';
import IconClock from './icons/IconClock';
import IconPlus from './icons/IconPlus';
import AlertPill from './AlertPill';

interface ControlsProps {
  alertDistances: AlertDistance[];
  setAlertDistances: (updater: (prev: AlertDistance[]) => AlertDistance[]) => void;
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
  alertDistances,
  setAlertDistances,
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
  
  const handleAddAlert = () => {
    // Add a new alert with a default value and a unique ID
    setAlertDistances(prev => 
      [...prev, { id: Date.now().toString(), distance: 500 }]
      .sort((a,b) => b.distance - a.distance)
    );
  };

  const handleUpdateAlert = (idToUpdate: string, newDistance: number) => {
    setAlertDistances(prev =>
      prev
        .map(a => a.id === idToUpdate ? { ...a, distance: newDistance } : a)
        .sort((a,b) => b.distance - a.distance)
    );
  };
  
  const handleRemoveAlert = (idToRemove: string) => {
    setAlertDistances(prev => prev.filter(a => a.id !== idToRemove));
  };


  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-5 text-white max-w-md mx-auto border border-gray-700">
        
        <div className="text-center mb-4 h-5 flex items-center justify-center font-medium">
          {getStatusMessage()}
        </div>
        
        <div className="space-y-4 mb-4">
            {/* Alert Distances Control */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                Alert Distances (editable)
              </label>
              <div className="bg-gray-900/50 p-3 rounded-lg flex flex-wrap items-center justify-center gap-2">
                {alertDistances.map(alert => (
                    <AlertPill 
                      key={alert.id}
                      alert={alert}
                      onUpdate={handleUpdateAlert}
                      onRemove={handleRemoveAlert}
                      isTracking={isTracking}
                    />
                ))}
                <button 
                  onClick={handleAddAlert} 
                  disabled={isTracking || !hasDestination} 
                  className="bg-gray-600 hover:bg-gray-500 rounded-full w-7 h-7 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Add new alert distance"
                >
                    <IconPlus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Alert Options Control */}
            <div className="grid grid-cols-3 gap-3">
                <button onClick={() => toggleAlertOption('sound')} className={`flex items-center justify-center p-3 rounded-full text-sm transition-all duration-200 border-2 active:scale-110 ${alertOptions.sound ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle sound alert"><IconBell className="w-6 h-6"/></button>
                <button onClick={() => toggleAlertOption('vibration')} className={`flex items-center justify-center p-3 rounded-full text-sm transition-all duration-200 border-2 active:scale-110 ${alertOptions.vibration ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle vibration alert"><IconVibration className="w-6 h-6"/></button>
                <button onClick={() => toggleAlertOption('voice')} className={`flex items-center justify-center p-3 rounded-full text-sm transition-all duration-200 border-2 active:scale-110 ${alertOptions.voice ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle voice alert"><IconSpeaker className="w-6 h-6"/></button>
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
                isTracking ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-500/30'}`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Controls;