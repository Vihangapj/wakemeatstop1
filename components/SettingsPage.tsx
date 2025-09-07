import React, { useState } from 'react';
import { MapTheme, Waypoint, LatLngTuple, TransitAlarm } from '../types';
import { ringtones } from '../data/ringtones';
import IconTrash from './icons/IconTrash';
import IconTarget from './icons/IconTarget';
import IconPlay from './icons/IconPlay';
import IconStar from './icons/IconStar';
import IconPlus from './icons/IconPlus';
import IconEdit from './icons/IconEdit';
import EditAlarmModal from './EditAlarmModal';
import IconX from './icons/IconX';

interface SettingsPageProps {
  onClose: () => void;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
  highAccuracyGPS: boolean;
  setHighAccuracyGPS: (enabled: boolean) => void;
  keepScreenOn: boolean;
  setKeepScreenOn: (enabled: boolean) => void;
  waypoints: Waypoint[];
  onSelectWaypoint: (waypoint: Waypoint) => void;
  onDeleteWaypoint: (id: string) => void;
  selectedRingtoneId: string;
  setSelectedRingtoneId: (id: string) => void;
  alarms: TransitAlarm[];
  setAlarms: React.Dispatch<React.SetStateAction<TransitAlarm[]>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onClose,
  mapTheme,
  setMapTheme,
  highAccuracyGPS,
  setHighAccuracyGPS,
  keepScreenOn,
  setKeepScreenOn,
  waypoints,
  onSelectWaypoint,
  onDeleteWaypoint,
  selectedRingtoneId,
  setSelectedRingtoneId,
  alarms,
  setAlarms,
}) => {
  const [alarmToEdit, setAlarmToEdit] = useState<TransitAlarm | Partial<TransitAlarm> | null>(null);

  const mapThemes: { id: MapTheme; label: string, previewClass: string }[] = [
    { id: 'dark', label: 'Dark', previewClass: 'bg-gray-800 border-2 border-gray-600' },
    { id: 'light', label: 'Light', previewClass: 'bg-gray-200 border-2 border-gray-400' },
    { id: 'satellite', label: 'Satellite', previewClass: 'bg-cover bg-center border-2 border-gray-500 bg-[url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/4/8/6)]' },
  ];

  const handlePreviewSound = () => {
    const ringtone = ringtones.find(r => r.id === selectedRingtoneId);
    if (ringtone) {
        const audio = new Audio(ringtone.url);
        audio.play().catch(e => console.error("Preview audio failed", e));
    }
  };

  const handleSaveAlarm = (alarmData: Omit<TransitAlarm, 'id'> | TransitAlarm) => {
    if ('id' in alarmData) { // Editing existing alarm
        setAlarms(alarms.map(a => a.id === alarmData.id ? alarmData : a));
    } else { // Adding new alarm
        const newAlarm: TransitAlarm = { ...alarmData, id: new Date().toISOString() };
        setAlarms([...alarms, newAlarm]);
    }
    setAlarmToEdit(null);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? {...a, enabled: !a.enabled} : a));
  };

  return (
    <>
    <div className="fixed inset-0 z-[3000] bg-gray-900 animate-slide-in-from-right flex flex-col">
      <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl w-full flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
            aria-label="Close settings"
          >
            <IconX className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-8 overflow-y-auto flex-grow">
          {/* Saved Places Setting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Saved Places</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {waypoints.length > 0 ? (
                waypoints.map(wp => (
                  <div key={wp.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-teal-500/10 transition-colors">
                    <span className="font-medium text-white truncate mr-4">{wp.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => onSelectWaypoint(wp)} className="text-teal-400 hover:text-teal-300 p-1 transition-transform active:scale-90" title="Set as destination"><IconTarget className="w-6 h-6"/></button>
                      <button onClick={() => onDeleteWaypoint(wp.id)} className="text-red-500 hover:text-red-400 p-1 transition-transform active:scale-90" title="Delete place"><IconTrash className="w-6 h-6"/></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 px-4 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">No saved places yet.</p>
                    <p className="text-xs text-gray-500 mt-1">Tap the map to create a new place.</p>
                </div>
              )}
            </div>
          </div>
        
          {/* Transit Alarms Setting */}
           <div className="border-t border-gray-700/60 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-200">Transit Alarms</h3>
              <button onClick={() => setAlarmToEdit({})} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition-transform active:scale-95">
                <IconPlus className="w-5 h-5"/> Add
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {alarms.length > 0 ? (
                alarms.map(alarm => (
                  <div key={alarm.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAlarm(alarm.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${alarm.enabled ? 'bg-teal-500' : 'bg-gray-600'}`}
                        role="switch" aria-checked={alarm.enabled}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${alarm.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <div>
                        <span className={`font-bold text-lg ${alarm.enabled ? 'text-white' : 'text-gray-400'}`}>{alarm.time}</span>
                        <p className={`text-sm truncate ${alarm.enabled ? 'text-gray-300' : 'text-gray-500'}`}>{alarm.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setAlarmToEdit(alarm)} className="text-gray-400 hover:text-white p-1 transition-transform active:scale-90" title="Edit alarm"><IconEdit className="w-6 h-6"/></button>
                      <button onClick={() => handleDeleteAlarm(alarm.id)} className="text-red-500 hover:text-red-400 p-1 transition-transform active:scale-90" title="Delete alarm"><IconTrash className="w-6 h-6"/></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 px-4 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-400">No transit alarms set.</p>
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
                  <p className="text-xs text-gray-400">Prevents screen from sleeping while tracking.</p>
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
    {alarmToEdit && (
        <EditAlarmModal
            alarm={alarmToEdit}
            onClose={() => setAlarmToEdit(null)}
            onSave={handleSaveAlarm}
        />
    )}
    </>
  );
};

export default SettingsPage;
