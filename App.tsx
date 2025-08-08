import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LatLngTuple, MapTheme, AlertOptions, Favorite, Ringtone, Alert, AlertDistance } from './types';
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
  const [panRequest, setPanRequest] = useState<LatLngTuple | null>(null);

  // New state for multiple alerts
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);

  // Persistent settings
  const [showIntro, setShowIntro] = usePersistentState<boolean>('wakeme_showIntro', true);
  const [alertDistances, setAlertDistances] = usePersistentState<AlertDistance[]>('wakeme_alertDistances', [
    { id: '1', distance: 1000 },
    { id: '2', distance: 500 },
  ]);
  const [alertOptions, setAlertOptions] = usePersistentState<AlertOptions>('wakeme_alertOptions', { sound: true, vibration: true, voice: false });
  const [mapTheme, setMapTheme] = usePersistentState<MapTheme>('wakeme_mapTheme', 'dark');
  const [highAccuracyGPS, setHighAccuracyGPS] = usePersistentState<boolean>('wakeme_highAccuracyGPS', true);
  const [keepScreenOn, setKeepScreenOn] = usePersistentState<boolean>('wakeme_keepScreenOn', false);
  const [favorites, setFavorites] = usePersistentState<Favorite[]>('wakeme_favorites', []);
  const [selectedRingtoneId, setSelectedRingtoneId] = usePersistentState<string>('wakeme_ringtoneId', 'alarm-clock');

  // Hooks
  const { position: userPosition, speed, error: geolocationError } = useGeolocation(true, { enableHighAccuracy: highAccuracyGPS });
  useWakeLock(keepScreenOn && isTracking);

  const selectedRingtone = useMemo(() => {
    return ringtones.find(r => r.id === selectedRingtoneId) || ringtones[0];
  }, [selectedRingtoneId]);

  const handleSetDestination = useCallback((pos: LatLngTuple | null) => {
    setDestination(pos);
    setIsTracking(false);
    setActiveAlerts([]);
    setTriggeredAlert(null);
    setIsAlerting(false);
    setDistance(null);
    setEta(null);
  }, []);

  const handleToggleTracking = useCallback(() => {
    if (destination) {
      setIsTracking(prev => {
        const newTrackingState = !prev;
        if (newTrackingState) {
          // Starting tracking: create active alerts from saved distances
          const newAlerts = alertDistances
            .sort((a, b) => b.distance - a.distance) // Process larger distances first
            .map(alert => ({
              id: `${alert.id}-${new Date().getTime()}`,
              distance: alert.distance,
              triggered: false,
            }));
          setActiveAlerts(newAlerts);
        } else {
          // Stopping tracking: clear active alerts
          setActiveAlerts([]);
        }
        return newTrackingState;
      });
    }
  }, [destination, alertDistances]);
  
  const handleToggleSettings = useCallback(() => setIsSettingsOpen(prev => !prev), []);
  const handleToggleAIAssistant = useCallback(() => setIsAIAssistantOpen(prev => !prev), []);
  
  const handleCenterOnUser = useCallback(() => {
    if (userPosition) {
        setPanRequest(userPosition);
    }
  }, [userPosition]);

  const handleAcknowledgeAlert = useCallback(() => {
    if (triggeredAlert) {
      // Mark the acknowledged alert as triggered
      setActiveAlerts(prev => prev.map(a => a.id === triggeredAlert.id ? { ...a, triggered: true } : a));
    }
    setIsAlerting(false);
    setTriggeredAlert(null);
  }, [triggeredAlert]);
  
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
    // Don't do anything if not tracking, or an alert is already active
    if (!isTracking || !userPosition || !destination || isAlerting) {
      if (!isTracking) {
        setDistance(null);
        setEta(null);
      }
      return;
    }

    const dist = calculateDistance(userPosition[0], userPosition[1], destination[0], destination[1]);
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

    // Find the next untriggered alert whose radius has been entered.
    // We sort by distance to ensure we trigger the outermost alert first if multiple are crossed at once.
    const alertToFire = activeAlerts
        .filter(alert => !alert.triggered && dist <= alert.distance)
        .sort((a,b) => b.distance - a.distance)[0];


    if (alertToFire) {
      setTriggeredAlert(alertToFire);
      setIsAlerting(true);
      // Don't stop tracking, just alert and wait for acknowledgement
    }
  }, [isTracking, userPosition, destination, speed, activeAlerts, isAlerting]);


  if (showIntro) {
    return <IntroductionModal onDismiss={() => setShowIntro(false)} />;
  }

  return (
    <div className="h-screen w-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Header />
      <main className="relative h-full w-full">
        <MapComponent
            userPosition={userPosition}
            destination={destination}
            setDestination={handleSetDestination}
            alertDistances={alertDistances}
            isTracking={isTracking}
            mapTheme={mapTheme}
            panRequest={panRequest}
            setPanRequest={setPanRequest}
            onToggleSettings={handleToggleSettings}
            onCenterOnUser={handleCenterOnUser}
            isUserLocationAvailable={!!userPosition}
        />
      </main>
      <Controls
        alertDistances={alertDistances}
        setAlertDistances={setAlertDistances}
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
      {isAlerting && triggeredAlert && (
        <AlertModal 
            onAcknowledge={handleAcknowledgeAlert} 
            alertOptions={alertOptions} 
            ringtoneUrl={selectedRingtone.url}
            triggeredDistance={triggeredAlert.distance}
        />
      )}
      
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
            onSelectFavorite={(pos) => {
              handleSetDestination(pos);
              setIsSettingsOpen(false);
            }}
            onDeleteFavorite={handleDeleteFavorite}
            selectedRingtoneId={selectedRingtoneId}
            setSelectedRingtoneId={setSelectedRingtoneId}
          />
      )}
      
      {isAIAssistantOpen && (
        <AIAssistantModal 
            onClose={handleToggleAIAssistant}
            onDestinationFound={(pos) => {
                handleSetDestination(pos);
                setIsAIAssistantOpen(false);
            }}
        />
      )}
    </div>
  );
};

export default App;