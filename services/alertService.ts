import { AlertOptions, Ringtone } from '../types';

let audio: HTMLAudioElement | null = null;
let vibrationInterval: number | null = null;

const playSound = (url: string) => {
  if (!audio || audio.src !== url) {
    if (audio) {
      audio.pause();
    }
    audio = new Audio(url);
    audio.loop = true;
  }
  audio.play().catch(error => console.error("Audio play failed:", error));
};

const stopSound = () => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

const playVibration = () => {
  if ('vibrate' in navigator) {
    stopVibration();
    vibrationInterval = window.setInterval(() => {
      navigator.vibrate([400, 200, 400]);
    }, 1000);
  }
};

const stopVibration = () => {
  if (vibrationInterval !== null) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
};

const playVoiceAlert = (distance: number) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const distanceText = distance < 1000 ? `${distance} meters` : `${(distance/1000).toFixed(1)} kilometers`;
    const utterance = new SpeechSynthesisUtterance(`You have reached the ${distanceText} alert radius.`);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

const notifyInBackground = (distance: number, options: AlertOptions, ringtone: Ringtone) => {
    const showNotification = () => {
        const distanceText = distance < 1000 ? `${distance}m` : `${(distance/1000).toFixed(1)}km`;
        const title = `WakeMe@Stop: ${distanceText} Alert!`;
        const body = `You are approaching your destination.`;
        const notificationOptions: NotificationOptions = {
            body,
            icon: 'https://cdn.glitch.global/6a80426c-3c8c-4158-9488-87d2a5a5146d/icon.png?v=1689889981881', // A generic icon
            silent: !options.sound, // Will use default notification sound if sound is on
        };
        
        // The 'vibrate' property is part of the Notification standard but might be missing
        // from some TypeScript DOM library versions. We add it dynamically to avoid type errors.
        if (options.vibration) {
            (notificationOptions as any).vibrate = [400, 200, 400];
        }
        
        try {
            const notification = new Notification(title, notificationOptions);
            notification.onclick = () => {
                window.parent.focus();
            }
        } catch (e) {
            console.error("Failed to show notification:", e);
        }

        if(options.voice) {
            playVoiceAlert(distance);
        }
    };

    if (!('Notification' in window)) {
        console.error('This browser does not support desktop notification');
        return;
    }
    
    if (Notification.permission === 'granted') {
        showNotification();
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                showNotification();
            }
        });
    }
}

export const alertService = {
  startForeground: (distance: number, options: AlertOptions, ringtoneUrl: string) => {
    if (options.sound) {
      playSound(ringtoneUrl);
    }
    if (options.vibration) {
      playVibration();
    }
    if (options.voice) {
      playVoiceAlert(distance);
    }
  },
  stop: () => {
    stopSound();
    stopVibration();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
  notifyInBackground,
};