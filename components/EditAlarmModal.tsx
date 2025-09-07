import React, { useState } from 'react';
import { TransitAlarm } from '../types';
import IconBell from './icons/IconBell';
import IconX from './icons/IconX';

interface EditAlarmModalProps {
  onClose: () => void;
  onSave: (alarm: Omit<TransitAlarm, 'id'> | TransitAlarm) => void;
  alarm: Partial<TransitAlarm>;
}

const EditAlarmModal: React.FC<EditAlarmModalProps> = ({ onClose, onSave, alarm }) => {
  const [time, setTime] = useState(alarm.time || '08:00');
  const [label, setLabel] = useState(alarm.label || '');
  const [leadTime, setLeadTime] = useState(alarm.leadTime || 5);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!label.trim()) {
      setError('Please enter a label for the alarm.');
      return;
    }
    if ('id' in alarm) {
        onSave({ id: alarm.id, time, label, leadTime, enabled: alarm.enabled ?? true });
    } else {
        onSave({ time, label, leadTime, enabled: true });
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconBell className="w-6 h-6 text-teal-400"/>
            {alarm.id ? 'Edit Alarm' : 'New Transit Alarm'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close"><IconX className="w-6 h-6" /></button>
        </header>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="alarm-time" className="block text-sm font-medium text-gray-300 mb-1">Time</label>
              <input
                id="alarm-time" type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label htmlFor="alarm-lead-time" className="block text-sm font-medium text-gray-300 mb-1">Notify Before</label>
              <div className="flex items-center">
                 <input
                    id="alarm-lead-time" type="number" min="1" max="60" value={leadTime} onChange={(e) => setLeadTime(parseInt(e.target.value, 10))}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
                 />
                 <span className="ml-3 text-gray-400">min</span>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="alarm-label" className="block text-sm font-medium text-gray-300 mb-1">Label</label>
            <input
              id="alarm-label" type="text" value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g., "Morning Train to City"'
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            onClick={handleSave}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Save Alarm
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAlarmModal;
