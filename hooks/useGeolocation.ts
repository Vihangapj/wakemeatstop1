import { useState, useEffect } from 'react';
import { LatLngTuple } from '../types';

interface GeolocationState {
  position: LatLngTuple | null;
  speed: number | null; // in meters/second
  error: string | null;
}

interface GeolocationOptions {
  enableHighAccuracy: boolean;
}

export const useGeolocation = (enabled: boolean, options: GeolocationOptions): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    speed: null,
    error: null,
  });

  useEffect(() => {
    // Clear state if disabled
    if (!enabled) {
      // Don't clear position immediately to avoid map jumping, but clear errors and speed.
      setState(s => ({ ...s, speed: null, error: null }));
      return;
    }

    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: [pos.coords.latitude, pos.coords.longitude],
          speed: pos.coords.speed,
          error: null,
        });
      },
      (err) => {
        let errorMessage = 'Unable to retrieve your location.';
        if (err.code === 1) {
            errorMessage = 'Location access was denied. Please enable it in your browser settings.';
        }
        setState(s => ({ ...s, error: errorMessage }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [enabled, options.enableHighAccuracy]);

  return state;
};