import React from 'react';
import { MapTheme, Favorite, LatLngTuple } from '../types';
import { ringtones } from '../data/ringtones';
import IconTrash from './icons/IconTrash';
import IconTarget from './icons/IconTarget';
import IconPlay from './icons/IconPlay';
import IconStar from './icons/IconStar';

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
  const mapThemes: { id: MapTheme; label: string, previewClass: string }[] = [
    { id: 'dark', label: 'Dark', previewClass: 'bg-gray-800 border-2 border-gray-600' },
    { id: 'light', label: 'Light', previewClass: 'bg-gray-200 border-2 border-gray-400' },
    { id: 'satellite', label: 'Satellite', previewClass: 'bg-cover bg-center border-2 border-gray-500 bg-[url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/4/8/6)]' },
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
            className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 space-y-8 overflow-y-auto flex-grow">
          {/* Favorite Places Setting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Favorite Places</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {favorites.length > 0 ? (
                favorites.map(fav => (
                  <div key={fav.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-teal-500/10 transition-colors">
                    <span className="font-medium text-white truncate mr-4">{fav.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleSelectFavorite(fav)} className="text-teal-400 hover:text-teal-300 p-1 transition-transform active:scale-90" title="Set as destination"><IconTarget className="w-6 h-6"/></button>
                      <button onClick={() => onDeleteFavorite(fav.id)} className="text-red-500 hover:text-red-400 p-1 transition-transform active:scale-90" title="Delete favorite"><IconTrash className="w-6 h-6"/></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 px-4 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">No favorite places saved yet.</p>
                    <p className="text-xs text-gray-500 mt-1">Set a destination on the map and tap the <IconStar className="w-3 h-3 inline-block -mt-1"/> icon to save.</p>
                </div>
              )}
            </div>
          </div>
        
          {/* Alert Sound Setting */}
          <div className="border-t border-gray-700/60 pt-6">
            <label htmlFor="ringtone-select" className="block text-lg font-semibold text-gray-200 mb-3">Alert Sound</label>
            <div className="flex items-center gap-3">
              <select
                id="ringtone-select"
                value={selectedRingtoneId}
                onChange={(e) => setSelectedRingtoneId(e.target.value)}
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                {ringtones.map(ringtone => (
                  <option key={ringtone.id} value={ringtone.id}>
                    {ringtone.name}
                  </option>
                ))}
              </select>
              <button
                  onClick={handlePreviewSound}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg border-2 border-gray-600 transition-all active:scale-95 flex-shrink-0"
                  aria-label="Preview sound"
              >
                  <IconPlay className="w-6 h-6 text-teal-400" />
              </button>
            </div>
          </div>

          {/* Map Theme Setting */}
          <div className="border-t border-gray-700/60 pt-6">
            <label className="block text-lg font-semibold text-gray-200 mb-3">Map Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {mapThemes.map(({ id, label, previewClass }) => (
                <button
                  key={id}
                  onClick={() => setMapTheme(id)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${mapTheme === id ? 'bg-teal-500/20 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                >
                  <div className={`w-full h-12 rounded-md mb-2 ${previewClass}`}></div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-700/60 pt-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Advanced</h3>
            <div className="space-y-4">
              {/* GPS Accuracy Setting */}
              <div className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <label htmlFor="gps-accuracy" className="block font-medium text-gray-200">High Accuracy GPS</label>
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
              <div className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <label htmlFor="keep-screen-on" className="block font-medium text-gray-200">Keep Screen On</label>
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
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
