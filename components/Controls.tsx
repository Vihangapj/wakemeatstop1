import React, { useState } from 'react';
import { AlertOptions } from '../types';
import IconBell from './icons/IconBell';
import IconVibration from './icons/IconVibration';
import IconSpeaker from './icons/IconSpeaker';
import IconSparkles from './icons/IconSparkles';
import IconStar from './icons/IconStar';
import IconClock from './icons/IconClock';
import IconTrash from './icons/IconTrash';
import IconPlay from './icons/IconPlay';
import IconStop from './icons/IconStop';

interface ControlsProps {
  alertRadiuses: number[];
  setAlertRadiuses: (radiuses: number[]) => void;
  alertOptions: AlertOptions;
  setAlertOptions: (options: AlertOptions) => void;
  isTracking: boolean;
  onToggleTracking: () => void;
  distance: number | null;
  eta: string | null;
  hasDestination: boolean;
  geolocationError: string | null;
  onOpenFindDestination: () => void;
  onOpenLocationPermissionInfo: () => void;
  onSaveFavorite: () => void;
  isFavorite: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  alertRadiuses,
  setAlertRadiuses,
  alertOptions,
  setAlertOptions,
  isTracking,
  onToggleTracking,
  distance,
  eta,
  hasDestination,
  geolocationError,
  onOpenFindDestination,
  onOpenLocationPermissionInfo,
  onSaveFavorite,
  isFavorite,
}) => {
  const [newRadius, setNewRadius] = useState<string>('500');

  const formatDistance = (dist: number | null) => {
    if (dist === null) return '--';
    if (dist >= 1000) {
      return `${(dist / 1000).toFixed(2)} km`;
    }
    return `${Math.round(dist)} m`;
  };

  const getStatusMessage = () => {
    if (geolocationError) {
      const isPermissionError = geolocationError.toLowerCase().includes('denied');
      return (
        <div className={`text-center p-3 rounded-lg w-full ${isPermissionError ? 'bg-red-900/50 border border-red-500/30' : 'bg-red-500/20'}`}>
          <p className="text-red-300 text-sm font-medium">{geolocationError}</p>
          {isPermissionError && (
            <button onClick={onOpenLocationPermissionInfo} className="text-sm text-teal-300 hover:text-teal-200 font-semibold mt-2 underline">
              Why is this needed?
            </button>
          )}
        </div>
      );
    }
    if (isTracking) {
      return (
        <div className="flex items-center justify-around w-full text-center bg-gray-900/50 rounded-lg p-2">
            <div>
                <div className="text-sm font-semibold text-gray-400 tracking-wider">DISTANCE</div>
                <div className="text-2xl font-bold text-teal-300">{formatDistance(distance)}</div>
            </div>
            {eta && (
            <>
                <div className="border-l border-gray-700 h-10"></div>
                <div>
                    <div className="text-sm font-semibold text-gray-400 tracking-wider">ETA</div>
                    <div className="text-2xl font-bold text-teal-300 flex items-center gap-2 justify-center">
                        <IconClock className="w-5 h-5" /> {eta}
                    </div>
                </div>
            </>
            )}
        </div>
      );
    }
    if (!hasDestination) return <span className="text-gray-400">Tap map or use search to set destination</span>;
    return <span className="text-gray-300">Ready to track</span>;
  }

  const toggleAlertOption = (option: keyof AlertOptions) => {
    setAlertOptions({ ...alertOptions, [option]: !alertOptions[option] });
  };

  const handleAddRadius = () => {
    const radiusVal = parseInt(newRadius, 10);
    if (radiusVal > 0 && !alertRadiuses.includes(radiusVal)) {
      setAlertRadiuses([...alertRadiuses, radiusVal].sort((a,b) => b - a));
      setNewRadius('500');
    }
  };
  
  const handleRemoveRadius = (radiusToRemove: number) => {
    setAlertRadiuses(alertRadiuses.filter(r => r !== radiusToRemove));
  };


  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4">
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl p-5 text-white max-w-md mx-auto border border-gray-700">
        
        <div className="text-center mb-4 h-16 flex items-center justify-center font-medium">
          {getStatusMessage()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="w-full space-y-3">
              <label className="block text-sm font-medium text-gray-300 text-center">
                Alert Distances (meters)
              </label>
              {hasDestination && !isTracking ? (
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      step="100"
                      min="100"
                      value={newRadius}
                      onChange={e => setNewRadius(e.target.value)}
                      className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white text-lg focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="e.g. 500"
                    />
                    <button onClick={handleAddRadius} className="bg-teal-600 hover:bg-teal-500 text-white font-bold p-3 rounded-lg transition-transform active:scale-95">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {alertRadiuses.map(r => (
                       <span key={r} className="bg-teal-500/20 text-teal-300 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2">
                        {r < 1000 ? `${r}m` : `${r/1000}km`}
                        <button onClick={() => handleRemoveRadius(r)} className="text-teal-300 hover:text-white transition-transform active:scale-90"><IconTrash className="w-4 h-4"/></button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {alertRadiuses.length > 0 ? alertRadiuses.map(r => (
                     <span key={r} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      {r < 1000 ? `${r}m` : `${r/1000}km`}
                    </span>
                  )) : <p className="text-gray-500 text-sm">No alerts set</p>}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
                <button title="Sound Alert" onClick={() => toggleAlertOption('sound')} className={`flex flex-col gap-1 items-center justify-center p-3 rounded-lg text-sm transition-all duration-200 border-2 transform active:scale-95 ${alertOptions.sound ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle sound alert"><IconBell className="w-6 h-6"/><span className="text-xs font-medium">Sound</span></button>
                <button title="Vibration Alert" onClick={() => toggleAlertOption('vibration')} className={`flex flex-col gap-1 items-center justify-center p-3 rounded-lg text-sm transition-all duration-200 border-2 transform active:scale-95 ${alertOptions.vibration ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle vibration alert"><IconVibration className="w-6 h-6"/><span className="text-xs font-medium">Vibrate</span></button>
                <button title="Voice Alert" onClick={() => toggleAlertOption('voice')} className={`flex flex-col gap-1 items-center justify-center p-3 rounded-lg text-sm transition-all duration-200 border-2 transform active:scale-95 ${alertOptions.voice ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`} disabled={isTracking} aria-label="Toggle voice alert"><IconSpeaker className="w-6 h-6"/><span className="text-xs font-medium">Voice</span></button>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button onClick={onOpenFindDestination} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all active:scale-95 flex-shrink-0" aria-label="Open AI Assistant">
              <IconSparkles className="w-6 h-6 text-teal-400" />
            </button>
            {hasDestination && !isFavorite && (
                <button onClick={onSaveFavorite} disabled={isTracking} className="p-4 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                    <IconStar className="w-6 h-6"/>
                </button>
            )}
            <button
              onClick={onToggleTracking}
              disabled={!hasDestination || !!geolocationError}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg flex items-center justify-center gap-2 transform active:scale-95
                ${!hasDestination || !!geolocationError ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 
                isTracking ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30'}`}
            >
              {isTracking ? (
                  <>
                      <IconStop className="w-6 h-6" />
                      <span>Stop Tracking</span>
                  </>
              ) : (
                  <>
                      <IconPlay className="w-6 h-6" />
                      <span>Start Tracking</span>
                  </>
              )}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Controls;