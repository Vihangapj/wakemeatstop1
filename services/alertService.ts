import { AlertOptions } from '../types';

let audio: HTMLAudioElement | null = null;
let vibrationInterval: number | null = null;

const playSound = (url: string) => {
  // If the audio object doesn't exist or the source is different, create a new one.
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

const playVoiceAlert = () => {
  if ('speechSynthesis' in window) {
    // Cancel any previous utterances
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("You have arrived at your destination.");
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

export const alertService = {
  start: (options: AlertOptions, ringtoneUrl: string) => {
    if (options.sound) {
      playSound(ringtoneUrl);
    }
    if (options.vibration) {
      playVibration();
    }
    if (options.voice) {
        playVoiceAlert();
    }
  },
  stop: () => {
    stopSound();
    stopVibration();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};