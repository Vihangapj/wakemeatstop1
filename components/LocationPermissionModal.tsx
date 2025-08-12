import React from 'react';

interface LocationPermissionModalProps {
  onAcknowledge: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onAcknowledge }) => {
  return (
    <div className="fixed inset-0 z-[4000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center w-full max-w-sm border border-red-500/30">
        <h2 className="text-2xl font-bold text-white mb-3">Location Access Required</h2>
        <p className="text-gray-300 mb-6">
          WakeMe@Stop needs access to your location to track your position and alert you when you're near your destination.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Please enable location services for this website in your browser's settings.
        </p>
        <button
          onClick={onAcknowledge}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
