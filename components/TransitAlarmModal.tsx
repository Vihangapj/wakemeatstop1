import React, { useEffect } from 'react';
import { TransitAlarm } from '../types';
import IconBell from './icons/IconBell';

interface TransitAlarmModalProps {
  alarm: TransitAlarm;
  ringtoneUrl: string;
  onDismiss: () => void;
}

let audio: HTMLAudioElement | null = null;

const TransitAlarmModal: React.FC<TransitAlarmModalProps> = ({ alarm, ringtoneUrl, onDismiss }) => {

  useEffect(() => {
    // Play sound
    if (!audio || audio.src !== ringtoneUrl) {
      if (audio) audio.pause();
      audio = new Audio(ringtoneUrl);
      audio.loop = true;
    }
    audio.play().catch(error => console.error("Alarm audio play failed:", error));
    
    // Vibrate
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 200, 400, 200, 400]);
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    };
  }, [ringtoneUrl]);


  return (
    <div className="fixed inset-0 z-[4000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center w-full max-w-sm border border-yellow-500/30">
        <IconBell className="w-16 h-16 text-yellow-400 animate-bounce mx-auto mb-4" />
        
        <h2 className="text-3xl font-bold text-white mb-2">{alarm.label}</h2>
        <p className="text-2xl font-semibold text-yellow-300 mb-3">{alarm.time}</p>
        
        <p className="text-gray-300 mb-8">
          Reminder set for {alarm.leadTime} minute{alarm.leadTime > 1 ? 's' : ''} before departure.
        </p>

        <button
          onClick={onDismiss}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default TransitAlarmModal;
