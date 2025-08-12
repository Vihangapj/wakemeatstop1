import React, { useEffect } from 'react';
import { alertService } from '../services/alertService';
import { AlertOptions } from '../types';
import IconBell from './icons/IconBell';
import IconVibration from './icons/IconVibration';
import IconSpeaker from './icons/IconSpeaker';

interface AlertModalProps {
  onDismiss: () => void;
  alertOptions: AlertOptions;
  ringtoneUrl: string;
  alertingRadius: number;
}

const AlertModal: React.FC<AlertModalProps> = ({ onDismiss, alertOptions, ringtoneUrl, alertingRadius }) => {
  useEffect(() => {
    alertService.startForeground(alertingRadius, alertOptions, ringtoneUrl);
    return () => {
      alertService.stop();
    };
  }, [alertingRadius, alertOptions, ringtoneUrl]);

  const distanceText = alertingRadius < 1000 ? `${alertingRadius}m` : `${(alertingRadius/1000).toFixed(1)}km`;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center w-full max-w-sm border border-teal-500/30">
        <div className="flex justify-center items-center mb-6 space-x-4">
            {alertOptions.sound && <IconBell className="w-12 h-12 text-teal-400 animate-bounce" />}
            {alertOptions.vibration && <IconVibration className="w-12 h-12 text-teal-400 animate-pulse" />}
            {alertOptions.voice && <IconSpeaker className="w-12 h-12 text-teal-400" />}
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Approaching!</h2>
        <p className="text-gray-300 mb-8">You are within the <span className="font-bold text-teal-400">{distanceText}</span> alert radius.</p>
        <button
          onClick={onDismiss}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default AlertModal;