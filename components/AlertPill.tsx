import React, { useState, useRef, useEffect } from 'react';
import { AlertDistance } from '../types';
import IconX from './icons/IconX';

interface AlertPillProps {
  alert: AlertDistance;
  onUpdate: (id: string, newDistance: number) => void;
  onRemove: (id: string) => void;
  isTracking: boolean;
}

const AlertPill: React.FC<AlertPillProps> = ({ alert, onUpdate, onRemove, isTracking }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(alert.distance.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newDist = parseInt(value, 10);
    if (!isNaN(newDist) && newDist > 0) {
      onUpdate(alert.id, newDist);
    } else {
      setValue(alert.distance.toString()); // Reset if invalid
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(alert.distance.toString());
      setIsEditing(false);
    }
  };

  const handleContainerClick = () => {
    if (!isTracking && !isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div
      className={`bg-teal-500 text-white font-semibold rounded-full flex items-center gap-1 pl-3 pr-1 py-1 text-sm transition-all ${isTracking ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-teal-400'}`}
      onClick={handleContainerClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-white w-14 text-center focus:outline-none"
        />
      ) : (
        <span>{alert.distance}m</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(alert.id); }}
        disabled={isTracking}
        className="bg-teal-700 hover:bg-teal-600 rounded-full w-5 h-5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        aria-label={`Remove ${alert.distance}m alert`}
      >
        <IconX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AlertPill;
