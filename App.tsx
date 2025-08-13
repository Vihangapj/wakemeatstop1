import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LatLngTuple, MapTheme, AlertOptions, Favorite, Ringtone } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { calculateDistance } from './utils/geo';
import { ringtones } from './data/ringtones';
import Header from './components/Header';
import Controls from './components/Controls';
import AlertModal from './components/AlertModal';
import MapComponent from './components/MapComponent';
import SettingsPage from './components/SettingsPage';
import FindDestinationModal from './components/AIAssistantModal';
import IntroductionModal from './components/IntroductionModal';
import { usePersistentState } from './hooks/usePersistentState';
import { useWakeLock } from './hooks/useWakeLock';
import { alertService } from './services/alertService';
import LocationPermissionModal from './components/LocationPermissionModal';
import Preloader from './components/Preloader';

const App: React.FC = () => {
  // App state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [destination, setDestination] = useState<LatLngTuple | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [alertingRadius, setAlertingRadius] = useState<number | null>(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState<number[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFindDestinationOpen, setIsFindDestinationOpen] = useState<boolean>(false);
  const [isLocationPermissionModalOpen, setLocationPermissionModalOpen] = useState(false);

  // Persistent settings
  const [showIntro, setShowIntro] = usePersistentState<boolean>('wakeme_showIntro', true);
  const [alertRadiuses, setAlertRadiuses] = usePersistentState<number[]>('wakeme_alertRadiuses', [1000]);
  const [alertOptions, setAlertOptions] = usePersistentState<AlertOptions>('wakeme_alertOptions', { sound: true, vibration: true, voice: false });
  const [mapTheme, setMapTheme] = usePersistentState<MapTheme>('wakeme_mapTheme', 'dark');
  const [highAccuracyGPS, setHighAccuracyGPS] = usePersistentState<boolean>('wakeme_highAccuracyGPS', true);
  const [keepScreenOn, setKeepScreenOn] = usePersistentState<boolean>('wakeme_keepScreenOn', false);
  const [favorites, setFavorites] = usePersistentState<Favorite[]>('wakeme_favorites', []);
  const [selectedRingtoneId, setSelectedRingtoneId] = usePersistentState<string>('wakeme_ringtoneId', 'alarm-clock');

  // Hooks
  const { position: userPosition, speed, error: geolocationError } = useGeolocation(true, { enableHighAccuracy: highAccuracyGPS });
  useWakeLock(keepScreenOn && isTracking);

  useEffect(() => {
    // Simulate app loading time to show the preloader
    const timer = setTimeout(() => {
        setIsInitializing(false);
    }, 2500); // Show preloader for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const selectedRingtone = useMemo(() => {
    return ringtones.find(r => r.id === selectedRingtoneId) || ringtones[0];
  }, [selectedRingtoneId]);
  
  const handleSetDestination = useCallback((pos: LatLngTuple | null) => {
    setDestination(pos);
    setTriggeredAlerts([]); // Reset triggered alerts for new destination
    if (isTracking) {
        setIsTracking(false);
    }
  }, [setDestination, isTracking]);

  const handleToggleTracking = useCallback(() => {
    if (destination) {
      setIsTracking(prev => {
        if (!prev === false) { // a click to STOP tracking
          setTriggeredAlerts([]);
        }
        return !prev;
      });
    }
  }, [destination]);
  
  const handleToggleSettings = useCallback(() => setIsSettingsOpen(prev => !prev), []);
  const handleToggleFindDestination = useCallback(() => setIsFindDestinationOpen(prev => !prev), []);

  const handleDismissAlert = useCallback(() => {
    setAlertingRadius(null);
    // Do not stop tracking or clear destination, allow for subsequent alerts
  }, []);
  
  const handleSaveFavorite = useCallback(() => {
    if (!destination) return;
    const name = prompt("Enter a name for this favorite place:");
    if (name && name.trim()) {
        const newFavorite: Favorite = {
            id: new Date().toISOString(),
            name: name.trim(),
            position: destination,
        };
        setFavorites(prev => [...prev, newFavorite]);
    }
  }, [destination, setFavorites]);

  const handleDeleteFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  }, [setFavorites]);

  const isCurrentDestinationFavorite = useMemo(() => {
    if (!destination) return false;
    return favorites.some(fav => fav.position[0] === destination[0] && fav.position[1] === destination[1]);
  }, [destination, favorites]);

  useEffect(() => {
    if (isTracking && userPosition && destination) {
      const dist = calculateDistance(
        userPosition[0],
        userPosition[1],
        destination[0],
        destination[1]
      );
      setDistance(dist);
      
      if (speed && speed > 1) {
        const timeInSeconds = dist / speed;
        const minutes = Math.floor(timeInSeconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            setEta(`${hours}h ${minutes % 60}m`);
        } else {
            setEta(`${minutes}m`);
        }
      } else {
        setEta(null);
      }
      
      // Check for alerts
      const sortedRadiuses = [...alertRadiuses].sort((a, b) => a - b);
      for (const radius of sortedRadiuses) {
        if (dist <= radius && !triggeredAlerts.includes(radius)) {
          setTriggeredAlerts(prev => [...prev, radius]);
          if (document.visibilityState === 'visible') {
            setAlertingRadius(radius);
          } else {
            alertService.notifyInBackground(radius, alertOptions, selectedRingtone);
          }
          // Only trigger one alert per check
          break;
        }
      }
    } else if (!isTracking) {
        setDistance(null);
        setEta(null);
    }
  }, [isTracking, userPosition, destination, alertRadiuses, speed, triggeredAlerts, alertOptions, selectedRingtone]);

  if (isInitializing) {
    return <Preloader />;
  }

  if (showIntro) {
    return <IntroductionModal onDismiss={() => setShowIntro(false)} />;
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Header onToggleSettings={handleToggleSettings} />
      <main className="relative h-full w-full">
        <MapComponent
            userPosition={userPosition}
            destination={destination}
            setDestination={handleSetDestination}
            alertRadiuses={alertRadiuses}
            isTracking={isTracking}
            mapTheme={mapTheme}
        />
      </main>
      <Controls
        alertRadiuses={alertRadiuses}
        setAlertRadiuses={setAlertRadiuses}
        alertOptions={alertOptions}
        setAlertOptions={setAlertOptions}
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        distance={distance}
        eta={eta}
        hasDestination={!!destination}
        geolocationError={geolocationError}
        onOpenFindDestination={handleToggleFindDestination}
        onOpenLocationPermissionInfo={() => setLocationPermissionModalOpen(true)}
        onSaveFavorite={handleSaveFavorite}
        isFavorite={isCurrentDestinationFavorite}
      />
      {alertingRadius !== null && <AlertModal onDismiss={handleDismissAlert} alertOptions={alertOptions} ringtoneUrl={selectedRingtone.url} alertingRadius={alertingRadius} />}
      
      {isSettingsOpen && (
          <SettingsPage 
            onClose={handleToggleSettings}
            mapTheme={mapTheme}
            setMapTheme={setMapTheme}
            highAccuracyGPS={highAccuracyGPS}
            setHighAccuracyGPS={setHighAccuracyGPS}
            keepScreenOn={keepScreenOn}
            setKeepScreenOn={setKeepScreenOn}
            favorites={favorites}
            onSelectFavorite={handleSetDestination}
            onDeleteFavorite={handleDeleteFavorite}
            selectedRingtoneId={selectedRingtoneId}
            setSelectedRingtoneId={setSelectedRingtoneId}
          />
      )}
      
      {isFindDestinationOpen && (
        <FindDestinationModal 
            onClose={handleToggleFindDestination}
            onDestinationFound={(pos) => {
                handleSetDestination(pos);
                setIsFindDestinationOpen(false);
            }}
        />
      )}

      {isLocationPermissionModalOpen && (
        <LocationPermissionModal onAcknowledge={() => setLocationPermissionModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
