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
import AIAssistantModal from './components/AIAssistantModal';
import IntroductionModal from './components/IntroductionModal';
import { usePersistentState } from './hooks/usePersistentState';
import { useWakeLock } from './hooks/useWakeLock';

const App: React.FC = () => {
  // App state
  const [isTracking, setIsTracking] = useState(false);
  const [destination, setDestination] = useState<LatLngTuple | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [isAlerting, setIsAlerting] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  // Persistent settings
  const [showIntro, setShowIntro] = usePersistentState<boolean>('wakeme_showIntro', true);
  const [radius, setRadius] = usePersistentState<number>('wakeme_radius', 1000);
  const [alertOptions, setAlertOptions] = usePersistentState<AlertOptions>('wakeme_alertOptions', { sound: true, vibration: true, voice: false });
  const [mapTheme, setMapTheme] = usePersistentState<MapTheme>('wakeme_mapTheme', 'dark');
  const [highAccuracyGPS, setHighAccuracyGPS] = usePersistentState<boolean>('wakeme_highAccuracyGPS', true);
  const [keepScreenOn, setKeepScreenOn] = usePersistentState<boolean>('wakeme_keepScreenOn', false);
  const [favorites, setFavorites] = usePersistentState<Favorite[]>('wakeme_favorites', []);
  const [selectedRingtoneId, setSelectedRingtoneId] = usePersistentState<string>('wakeme_ringtoneId', 'alarm-clock');

  // Hooks
  const { position: userPosition, speed, error: geolocationError } = useGeolocation(isTracking, { enableHighAccuracy: highAccuracyGPS });
  useWakeLock(keepScreenOn && isTracking);

  const selectedRingtone = useMemo(() => {
    return ringtones.find(r => r.id === selectedRingtoneId) || ringtones[0];
  }, [selectedRingtoneId]);

  const handleToggleTracking = useCallback(() => {
    if (destination) {
      setIsTracking(prev => !prev);
    }
  }, [destination]);
  
  const handleToggleSettings = useCallback(() => setIsSettingsOpen(prev => !prev), []);
  const handleToggleAIAssistant = useCallback(() => setIsAIAssistantOpen(prev => !prev), []);

  const handleDismissAlert = useCallback(() => {
    setIsAlerting(false);
    setDestination(null);
    setDistance(null);
    setIsTracking(false);
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
      
      // Calculate ETA
      if (speed && speed > 1) { // speed is in m/s
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
      
      if (dist <= radius) {
        setIsAlerting(true);
        setIsTracking(false);
      }
    } else if (!isTracking) {
        setDistance(null);
        setEta(null);
    }
  }, [isTracking, userPosition, destination, radius, speed]);


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
            setDestination={setDestination}
            radius={radius}
            isTracking={isTracking}
            mapTheme={mapTheme}
        />
      </main>
      <Controls
        radius={radius}
        setRadius={setRadius}
        alertOptions={alertOptions}
        setAlertOptions={setAlertOptions}
        isTracking={isTracking}
        onToggleTracking={handleToggleTracking}
        distance={distance}
        eta={eta}
        hasDestination={!!destination}
        geolocationError={geolocationError}
        onOpenAIAssistant={handleToggleAIAssistant}
        onSaveFavorite={handleSaveFavorite}
        isFavorite={isCurrentDestinationFavorite}
      />
      {isAlerting && <AlertModal onDismiss={handleDismissAlert} alertOptions={alertOptions} ringtoneUrl={selectedRingtone.url} />}
      
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
            onSelectFavorite={setDestination}
            onDeleteFavorite={handleDeleteFavorite}
            selectedRingtoneId={selectedRingtoneId}
            setSelectedRingtoneId={setSelectedRingtoneId}
          />
      )}
      
      {isAIAssistantOpen && (
        <AIAssistantModal 
            onClose={handleToggleAIAssistant}
            onDestinationFound={(pos) => {
                setDestination(pos);
                setIsAIAssistantOpen(false);
            }}
        />
      )}
    </div>
  );
};

export default App;