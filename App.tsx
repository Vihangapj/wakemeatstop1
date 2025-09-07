import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LatLngTuple, MapTheme, AlertOptions, Waypoint, Ringtone, WeatherData, TransitAlarm } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { calculateDistance } from './utils/geo';
import { ringtones } from './data/ringtones';
import { getWeather } from './services/weatherService';
import Header from './components/Header';
import Controls from './components/Controls';
import AlertModal from './components/AlertModal';
import MapComponent from './components/MapComponent';
import SettingsPage from './components/SettingsPage';
import FindDestinationModal from './components/AIAssistantModal';
import IntroductionModal from './components/IntroductionModal';
import EditWaypointModal from './components/EditWaypointModal';
import TransitAlarmModal from './components/TransitAlarmModal';
import { usePersistentState } from './hooks/usePersistentState';
import { useWakeLock } from './hooks/useWakeLock';
import { alertService } from './services/alertService';
import LocationPermissionModal from './components/LocationPermissionModal';
import Preloader from './components/Preloader';

const App: React.FC = () => {
  // App state
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [alertingRadius, setAlertingRadius] = useState<number | null>(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState<number[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFindDestinationOpen, setIsFindDestinationOpen] = useState<boolean>(false);
  const [isLocationPermissionModalOpen, setLocationPermissionModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [triggeredAlarm, setTriggeredAlarm] = useState<TransitAlarm | null>(null);

  // Waypoint state
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [waypointToEdit, setWaypointToEdit] = useState<(Partial<Waypoint> & { position: LatLngTuple }) | null>(null);
  
  // Persistent settings
  const [showIntro, setShowIntro] = usePersistentState<boolean>('wakeme_showIntro', true);
  const [alertRadiuses, setAlertRadiuses] = usePersistentState<number[]>('wakeme_alertRadiuses', [1000]);
  const [alertOptions, setAlertOptions] = usePersistentState<AlertOptions>('wakeme_alertOptions', { sound: true, vibration: true, voice: false });
  const [mapTheme, setMapTheme] = usePersistentState<MapTheme>('wakeme_mapTheme', 'dark');
  const [highAccuracyGPS, setHighAccuracyGPS] = usePersistentState<boolean>('wakeme_highAccuracyGPS', true);
  const [keepScreenOn, setKeepScreenOn] = usePersistentState<boolean>('wakeme_keepScreenOn', false);
  const [waypoints, setWaypoints] = usePersistentState<Waypoint[]>('wakeme_waypoints', []);
  const [selectedRingtoneId, setSelectedRingtoneId] = usePersistentState<string>('wakeme_ringtoneId', 'alarm-clock');
  const [alarms, setAlarms] = usePersistentState<TransitAlarm[]>('wakeme_alarms', []);

  // Hooks
  const { position: userPosition, speed, error: geolocationError } = useGeolocation(true, { enableHighAccuracy: highAccuracyGPS });
  useWakeLock(keepScreenOn && isTracking);

  useEffect(() => {
    // Simulate app loading time to show the preloader
    const timer = setTimeout(() => setIsInitializing(false), 2500);
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch weather when active waypoint changes
  useEffect(() => {
    if (activeWaypoint) {
      getWeather(activeWaypoint.position[0], activeWaypoint.position[1]).then(setWeatherData);
    } else {
      setWeatherData(null);
    }
  }, [activeWaypoint]);

  // Check for transit alarms
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      for (const alarm of alarms) {
        if (alarm.enabled) {
          const [hours, minutes] = alarm.time.split(':').map(Number);
          const alarmTime = new Date();
          alarmTime.setHours(hours, minutes, 0, 0);

          if (alarmTime < now) continue; // Don't trigger past alarms for today

          const triggerTime = new Date(alarmTime.getTime() - alarm.leadTime * 60000);

          if (now >= triggerTime) {
            setTriggeredAlarm(alarm);
            // Disable alarm to prevent re-triggering
            setAlarms(currentAlarms =>
              currentAlarms.map(a =>
                a.id === alarm.id ? { ...a, enabled: false } : a
              )
            );
            return; // Only trigger one alarm per check
          }
        }
      }
    };
    const interval = setInterval(checkAlarms, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [alarms, setAlarms]);

  const selectedRingtone = useMemo(() => {
    return ringtones.find(r => r.id === selectedRingtoneId) || ringtones[0];
  }, [selectedRingtoneId]);
  
  const handleSelectWaypoint = useCallback((waypoint: Waypoint | null) => {
    setActiveWaypoint(waypoint);
    setTriggeredAlerts([]);
    if (isTracking) setIsTracking(false);
  }, [isTracking]);

  const handleToggleTracking = useCallback(() => {
    if (activeWaypoint) {
      setIsTracking(prev => {
        if (!prev === false) setTriggeredAlerts([]);
        return !prev;
      });
    }
  }, [activeWaypoint]);

  const handleDismissAlert = useCallback(() => setAlertingRadius(null), []);
  
  const handleSaveWaypoint = useCallback((waypoint: Omit<Waypoint, 'id'>) => {
    const newWaypoint: Waypoint = { ...waypoint, id: new Date().toISOString() };
    setWaypoints(prev => [...prev, newWaypoint]);
    handleSelectWaypoint(newWaypoint);
    setWaypointToEdit(null);
  }, [setWaypoints, handleSelectWaypoint]);

  const handleDeleteWaypoint = useCallback((id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id));
    if(activeWaypoint?.id === id) handleSelectWaypoint(null);
  }, [setWaypoints, activeWaypoint, handleSelectWaypoint]);

  useEffect(() => {
    if (isTracking && userPosition && activeWaypoint) {
      const dist = calculateDistance(userPosition[0], userPosition[1], activeWaypoint.position[0], activeWaypoint.position[1]);
      setDistance(dist);
      
      if (speed && speed > 1) {
        const timeInSeconds = dist / speed;
        const minutes = Math.round(timeInSeconds / 60);
        const hours = Math.floor(minutes / 60);
        setEta(hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`);
      } else {
        setEta(null);
      }
      
      const sortedRadiuses = [...alertRadiuses].sort((a, b) => a - b);
      for (const radius of sortedRadiuses) {
        if (dist <= radius && !triggeredAlerts.includes(radius)) {
          setTriggeredAlerts(prev => [...prev, radius]);
          if (document.visibilityState === 'visible') {
            setAlertingRadius(radius);
          } else {
            alertService.notifyInBackground(radius, alertOptions, selectedRingtone);
          }
          break; // Only trigger one alert per check
        }
      }
    } else if (!isTracking) {
        setDistance(null);
        setEta(null);
    }
  }, [isTracking, userPosition, activeWaypoint, alertRadiuses, speed, triggeredAlerts, alertOptions, selectedRingtone]);

  if (isInitializing) return <Preloader />;
  if (showIntro) return <IntroductionModal onDismiss={() => setShowIntro(false)} />;

  return (
    <div className="h-screen w-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Header onToggleSettings={() => setIsSettingsOpen(true)} />
      <main className="relative h-full w-full">
        <MapComponent
            userPosition={userPosition}
            activeWaypoint={activeWaypoint}
            waypoints={waypoints}
            onMapClick={(pos) => setWaypointToEdit({ position: pos })}
            onWaypointClick={handleSelectWaypoint}
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
        activeWaypoint={activeWaypoint}
        onClearActiveWaypoint={() => handleSelectWaypoint(null)}
        geolocationError={geolocationError}
        weatherData={weatherData}
        onOpenFindDestination={() => setIsFindDestinationOpen(true)}
        onOpenLocationPermissionInfo={() => setLocationPermissionModalOpen(true)}
      />
      {alertingRadius !== null && <AlertModal onDismiss={handleDismissAlert} alertOptions={alertOptions} ringtoneUrl={selectedRingtone.url} alertingRadius={alertingRadius} waypoint={activeWaypoint} />}
      
      {isSettingsOpen && (
          <SettingsPage 
            onClose={() => setIsSettingsOpen(false)}
            mapTheme={mapTheme} setMapTheme={setMapTheme}
            highAccuracyGPS={highAccuracyGPS} setHighAccuracyGPS={setHighAccuracyGPS}
            keepScreenOn={keepScreenOn} setKeepScreenOn={setKeepScreenOn}
            waypoints={waypoints}
            onSelectWaypoint={(wp) => {
              handleSelectWaypoint(wp);
              setIsSettingsOpen(false);
            }}
            onDeleteWaypoint={handleDeleteWaypoint}
            selectedRingtoneId={selectedRingtoneId} setSelectedRingtoneId={setSelectedRingtoneId}
            alarms={alarms} setAlarms={setAlarms}
          />
      )}
      
      {isFindDestinationOpen && (
        <FindDestinationModal 
            onClose={() => setIsFindDestinationOpen(false)}
            onDestinationFound={(pos) => {
                setWaypointToEdit({ position: pos });
                setIsFindDestinationOpen(false);
            }}
        />
      )}

      {waypointToEdit && (
        <EditWaypointModal
          waypoint={waypointToEdit}
          onClose={() => setWaypointToEdit(null)}
          onSave={handleSaveWaypoint}
        />
      )}
      
      {triggeredAlarm && (
        <TransitAlarmModal
          alarm={triggeredAlarm}
          ringtoneUrl={selectedRingtone.url}
          onDismiss={() => setTriggeredAlarm(null)}
        />
      )}

      {isLocationPermissionModalOpen && (
        <LocationPermissionModal onAcknowledge={() => setLocationPermissionModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
