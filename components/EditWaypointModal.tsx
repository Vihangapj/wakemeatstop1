import React, { useState, useEffect } from 'react';
import { Waypoint, WaypointType, LatLngTuple } from '../types';
import IconMapPin from './icons/IconMapPin';
import IconX from './icons/IconX';

interface EditWaypointModalProps {
  onClose: () => void;
  onSave: (waypoint: Omit<Waypoint, 'id' | 'userId'>) => void;
  waypoint: Partial<Waypoint> & { position: LatLngTuple };
}

const waypointTypes: { id: WaypointType; label: string }[] = [
    { id: 'stop', label: 'Stop' },
    { id: 'shop', label: 'Shop' },
    { id: 'poi', label: 'POI' },
];

const EditWaypointModal: React.FC<EditWaypointModalProps> = ({ onClose, onSave, waypoint }) => {
  const [name, setName] = useState(waypoint.name || '');
  const [type, setType] = useState<WaypointType>(waypoint.type || 'stop');
  const [reminder, setReminder] = useState(waypoint.reminder || '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a name for this place.');
      return;
    }
    onSave({
      name: name.trim(),
      position: waypoint.position,
      type,
      reminder: reminder.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconMapPin className="w-6 h-6 text-teal-400"/>
            {waypoint.id ? 'Edit Place' : 'Save New Place'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <IconX className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-5">
          <div>
            <label htmlFor="waypoint-name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              id="waypoint-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g., "Central Station" or "Grocery Store"'
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <div className="grid grid-cols-3 gap-3">
              {waypointTypes.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${type === id ? 'bg-teal-500/20 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
           <div>
            <label htmlFor="waypoint-reminder" className="block text-sm font-medium text-gray-300 mb-1">Reminder (Optional)</label>
            <input
              id="waypoint-reminder"
              type="text"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              placeholder='e.g., "Buy milk" or "Platform 5"'
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleSave}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            Save Place
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditWaypointModal;