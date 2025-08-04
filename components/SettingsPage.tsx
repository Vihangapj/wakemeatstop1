import React from 'react';
import { MapTheme, Favorite, LatLngTuple } from '../types';
import { ringtones } from '../data/ringtones';
import IconTrash from './icons/IconTrash';
import IconTarget from './icons/IconTarget';
import IconPlay from './icons/IconPlay';

interface SettingsPageProps {
  onClose: () => void;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  highAccuracyGPS: boolean;
  setHighAccuracyGPS: (enabled: boolean) => void;
  keepScreenOn: boolean;
  setKeepScreenOn: (enabled: boolean) => void;
  favorites: Favorite[];
  onSelectFavorite: (position: LatLngTuple) => void;
  onDeleteFavorite: (id: string) => void;
  selectedRingtoneId: string;
  setSelectedRingtoneId: (id: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onClose,
  mapTheme,
  setMapTheme,
  highAccuracyGPS,
  setHighAccuracyGPS,
  keepScreenOn,
  setKeepScreenOn,
  favorites,
  onSelectFavorite,
  onDeleteFavorite,
  selectedRingtoneId,
  setSelectedRingtoneId,
}) => {
  const mapThemes: { id: MapTheme; label: string }[] = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    { id: 'satellite', label: 'Satellite' },
  ];

  const handleSelectFavorite = (favorite: Favorite) => {
    onSelectFavorite(favorite.position);
    onClose();
  };

  const handlePreviewSound = () => {
    const ringtone = ringtones.find(r => r.id === selectedRingtoneId);
    if (ringtone) {
        const audio = new Audio(ringtone.url);
        audio.play().catch(e => console.error("Preview audio failed", e));
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900 animate-slide-in-from-right flex flex-col">
      <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl w-full flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto flex-grow">
          {/* Favorite Places Setting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Favorite Places</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {favorites.length > 0 ? (
                favorites.map(fav => (
                  <div key={fav.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <span className="font-medium text-white truncate mr-4">{fav.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleSelectFavorite(fav)} className="text-teal-400 hover:text-teal-300" title="Set as destination"><IconTarget className="w-5 h-5"/></button>
                      <button onClick={() => onDeleteFavorite(fav.id)} className="text-red-500 hover:text-red-400" title="Delete favorite"><IconTrash className="w-5 h-5"/></button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No favorite places saved yet.</p>
              )}
            </div>
          </div>
        
          <div className="border-t border-gray-700 pt-6 space-y-6">
             {/* Alert Sound Setting */}
            <div>
              <label htmlFor="ringtone-select" className="block text-sm font-medium text-gray-300 mb-2">Alert Sound</label>
              <div className="flex items-center gap-2">
                <select
                  id="ringtone-select"
                  value={selectedRingtoneId}
                  onChange={(e) => setSelectedRingtoneId(e.target.value)}
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-2.5 text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  {ringtones.map(ringtone => (
                    <option key={ringtone.id} value={ringtone.id}>
                      {ringtone.name}
                    </option>
                  ))}
                </select>
                <button
                    onClick={handlePreviewSound}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border-2 border-gray-600 transition-colors flex-shrink-0"
                    aria-label="Preview sound"
                >
                    <IconPlay className="w-5 h-5 text-teal-400" />
                </button>
              </div>
            </div>

            {/* Map Theme Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Map Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {mapThemes.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setMapTheme(id)}
                    className={`p-2 rounded-lg text-sm transition-all duration-200 border-2 ${mapTheme === id ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Accuracy Setting */}
            <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
              <div>
                <label htmlFor="gps-accuracy" className="block text-sm font-medium text-gray-300">High Accuracy GPS</label>
                <p className="text-xs text-gray-400">More precise, uses more battery.</p>
              </div>
              <button
                id="gps-accuracy"
                onClick={() => setHighAccuracyGPS(!highAccuracyGPS)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highAccuracyGPS ? 'bg-teal-500' : 'bg-gray-600'}`}
                role="switch"
                aria-checked={highAccuracyGPS}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highAccuracyGPS ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Keep Screen On Setting */}
            <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
              <div>
                <label htmlFor="keep-screen-on" className="block text-sm font-medium text-gray-300">Keep Screen On</label>
                <p className="text-xs text-gray-400">Prevents screen from sleeping.</p>
              </div>
              <button
                id="keep-screen-on"
                onClick={() => setKeepScreenOn(!keepScreenOn)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${keepScreenOn ? 'bg-teal-500' : 'bg-gray-600'}`}
                role="switch"
                aria-checked={keepScreenOn}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${keepScreenOn ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
        
        <footer className="flex-shrink-0 p-4 text-center text-xs text-gray-500 border-t border-gray-700">
          <p>WakeMe@Stop v1.4</p>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPage;