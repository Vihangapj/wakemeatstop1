import { useState, useEffect } from 'react';

export const useWakeLock = (enabled: boolean) => {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) {
      return;
    }

    let currentWakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        currentWakeLock = await navigator.wakeLock.request('screen');
        currentWakeLock.addEventListener('release', () => {
          // console.log('Screen Wake Lock was released');
        });
        setWakeLock(currentWakeLock);
        // console.log('Screen Wake Lock is active');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (currentWakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (currentWakeLock !== null) {
        currentWakeLock.release();
        setWakeLock(null);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);
};
