import React, { useState, useEffect, useCallback } from 'react';
import { LatLngTuple, Waypoint, AlertOptions, MapTheme, WeatherData, TransitAlarm, User, Announcement } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { usePersistentState } from './hooks/usePersistentState';
import { calculateDistance } from './utils/geo';
import { alertService } from './services/alertService';
import { useWakeLock } from './hooks/useWakeLock';
import { ringtones } from './data/ringtones';
import { getWeather } from './services/weatherService';
import { backendService } from './services/backendService';

import MapComponent from './components/MapComponent';
import Controls from './components/Controls';
import Header from './components/Header';
import AlertModal from './components/AlertModal';
import SettingsPage from './components/SettingsPage';
import FindDestinationModal from './components/AIAssistantModal';
import EditWaypointModal from './components/EditWaypointModal';
import IntroductionModal from './components/IntroductionModal';
import Preloader from './components/Preloader';
import LocationPermissionModal from './components/LocationPermissionModal';
import TransitAlarmModal from './components/TransitAlarmModal';
import AuthModal from './components/AuthModal';
import AnnouncementsFeed from './components/AnnouncementsFeed';

function App() {
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = usePersistentState('showIntro', true);
  
  // App State - User Agnostic
  const [alertRadiuses, setAlertRadiuses] = usePersistentState<number[]>('alertRadiuses', [500, 1000]);
  const [alertOptions, setAlertOptions] = usePersistentState<AlertOptions>('alertOptions', { sound: true, vibration: true, voice: false });
  const [selectedRingtoneId, setSelectedRingtoneId] = usePersistentState('selectedRingtoneId', ringtones[0].id);
  const [mapTheme, setMapTheme] = usePersistentState<MapTheme>('mapTheme', 'dark');
  const [highAccuracyGPS, setHighAccuracyGPS] = usePersistentState('highAccuracyGPS', true);
  const [keepScreenOn, setKeepScreenOn] = usePersistentState('keepScreenOn', true);
  const [alarms, setAlarms] = usePersistentState<TransitAlarm[]>('alarms', []);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // App State - User Specific
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Live Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // UI State
  const [alertingRadius, setAlertingRadius] = useState<number | null>(null);
  const [triggeredAlarms, setTriggeredAlarms] = useState<string[]>([]); // Don't re-trigger dismissed alarms
  const [triggeredTransitAlarm, setTriggeredTransitAlarm] = useState<TransitAlarm | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isLocationInfoOpen, setIsLocationInfoOpen] = useState(false);
  const [waypointToEdit, setWaypointToEdit] = useState<(Partial<Waypoint> & { position: LatLngTuple }) | null>(null);

  // Hooks
  const { position: userPosition, speed, error: geolocationError } = useGeolocation(isTracking || showIntro === false, { enableHighAccuracy: highAccuracyGPS });
  useWakeLock(isTracking && keepScreenOn);
  
  const selectedRingtone = ringtones.find(r => r.id === selectedRingtoneId) || ringtones[0];

  const saveWaypointsToLocal = useCallback((waypointsToSave: Waypoint[]) => {
    if (currentUser) {
        const waypointsKey = `waypoints_${currentUser.id}`;
        try {
            window.localStorage.setItem(waypointsKey, JSON.stringify(waypointsToSave));
        } catch (e) {
            console.error("Failed to save waypoints to local storage", e);
        }
    }
  }, [currentUser]);

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    backendService.getAnnouncements().then(setAnnouncements).catch(console.error);
    return () => clearTimeout(timer);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = backendService.onAuthStateChangedListener((user) => {
        setCurrentUser(user);
    });
    return unsubscribe; // Cleanup subscription on component unmount
  }, []);


  // Sync and fetch user-specific waypoints when user logs in or on initial load
  useEffect(() => {
    const waypointsKey = `waypoints_${currentUser?.id || 'guest'}`;

    const syncAndFetchWaypoints = async (user: User) => {
      // 1. Load local waypoints for the current user to provide an instant UI update
      let localWaypoints: Waypoint[] = [];
      try {
        const storedValue = window.localStorage.getItem(waypointsKey);
        localWaypoints = storedValue ? JSON.parse(storedValue) : [];
        setWaypoints(localWaypoints);
      } catch (error) {
        console.error(`Error reading localStorage key “${waypointsKey}”:`, error);
      }

      // 2. Identify and sync any waypoints created offline
      const unsyncedWaypoints = localWaypoints.filter(wp => wp.id.startsWith('temp_'));
      if (unsyncedWaypoints.length > 0) {
        console.log(`Syncing ${unsyncedWaypoints.length} offline waypoints...`);
        for (const wp of unsyncedWaypoints) {
          const { id, userId, ...dataToSave } = wp;
          try {
            await backendService.addWaypointForUser(dataToSave, user.id);
          } catch (syncError) {
            console.error(`Failed to sync waypoint ${wp.name}:`, syncError);
          }
        }
      }
    
      // 3. Fetch the canonical, up-to-date list from Firestore.
      try {
        const remoteWaypoints = await backendService.getWaypointsForUser(user.id);
        setWaypoints(remoteWaypoints);
        // 4. Save the canonical list back to local storage, completing the sync.
        window.localStorage.setItem(waypointsKey, JSON.stringify(remoteWaypoints));
      } catch (error) {
        console.error("Failed to fetch waypoints from backend:", error);
      }
    };

    if (currentUser) {
      syncAndFetchWaypoints(currentUser);
    } else {
      // User logged out. Clear all user-specific data.
      setWaypoints([]);
      setActiveWaypoint(null);
      setIsTracking(false);
      window.localStorage.removeItem(waypointsKey);
    }
  }, [currentUser]);

  // Main tracking logic
  useEffect(() => {
    if (isTracking && userPosition && activeWaypoint) {
      const dist = calculateDistance(userPosition[0], userPosition[1], activeWaypoint.position[0], activeWaypoint.position[1]);
      setDistance(dist);
      const triggeredRadius = alertRadiuses.find(radius => dist <= radius);
      if (triggeredRadius && !triggeredAlarms.includes(`${activeWaypoint.id}-${triggeredRadius}`)) {
        setAlertingRadius(triggeredRadius);
        setTriggeredAlarms(prev => [...prev, `${activeWaypoint.id}-${triggeredRadius}`]);
        if (document.hidden) {
            alertService.notifyInBackground(triggeredRadius, alertOptions, selectedRingtone);
        }
      }
      if (speed && speed > 1) {
        const timeSeconds = dist / speed;
        const etaDate = new Date(Date.now() + timeSeconds * 1000);
        setEta(etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setEta(null);
      }
    } else {
      setDistance(null);
      setEta(null);
    }
  }, [isTracking, userPosition, activeWaypoint, alertRadiuses, speed, triggeredAlarms, alertOptions, selectedRingtone]);

  // Fetch weather when active waypoint changes
  useEffect(() => {
    if (activeWaypoint) {
      getWeather(activeWaypoint.position[0], activeWaypoint.position[1])
        .then(setWeatherData)
        .catch(console.error);
    } else {
      setWeatherData(null);
    }
  }, [activeWaypoint]);

  // Check for transit alarms
  useEffect(() => {
    const intervalId = setInterval(() => {
        const now = new Date();
        for (const alarm of alarms) {
            if (alarm.enabled && !triggeredTransitAlarm) {
                const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
                const alarmTime = new Date();
                alarmTime.setHours(alarmHour, alarmMinute, 0, 0);
                const leadTimeMs = alarm.leadTime * 60 * 1000;
                const notifyTime = new Date(alarmTime.getTime() - leadTimeMs);
                if (now >= notifyTime && now < alarmTime) {
                    setTriggeredTransitAlarm(alarm);
                    break;
                }
            }
        }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [alarms, triggeredTransitAlarm]);

  // --- Handlers ---
  const handleToggleTracking = () => {
    setIsTracking(prev => !prev);
    if (isTracking) {
      alertService.stop();
      setAlertingRadius(null);
    }
  };

  const handleMapClick = (position: LatLngTuple) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setWaypointToEdit({ position });
  };

  const handleSaveWaypoint = async (waypointData: Omit<Waypoint, 'id' | 'userId'>) => {
    if (!currentUser) {
        setIsAuthOpen(true);
        return;
    }
    
    // Create a temporary waypoint for an immediate optimistic UI update.
    const tempId = `temp_${Date.now()}`;
    const newWaypoint: Waypoint = {
        ...waypointData,
        id: tempId,
        userId: currentUser.id,
    };

    // Update state and local storage instantly.
    const updatedWaypoints = [...waypoints, newWaypoint];
    setWaypoints(updatedWaypoints);
    saveWaypointsToLocal(updatedWaypoints);
    
    setActiveWaypoint(newWaypoint);
    setWaypointToEdit(null);

    // Asynchronously upload to the backend.
    try {
        const savedWaypoint = await backendService.addWaypointForUser(waypointData, currentUser.id);
        
        // After successful upload, update the state with the permanent ID from the server.
        setWaypoints(prev => {
            const finalWaypoints = prev.map(wp => 
                wp.id === tempId ? savedWaypoint : wp
            );
            saveWaypointsToLocal(finalWaypoints); // Persist the updated list with the permanent ID.
            return finalWaypoints;
        });
        
        // Also update the active waypoint if it's the one we just saved.
        if (activeWaypoint?.id === tempId) {
            setActiveWaypoint(savedWaypoint);
        }

    } catch (error) {
        console.error("Failed to sync waypoint:", error);
        // If sync fails, the waypoint remains with a temporary ID and will be retried on the next app load/login.
    }
  };

  const handleDeleteWaypoint = async (id: string) => {
    if (!currentUser) return;

    const originalWaypoints = [...waypoints];
    
    // Optimistically update UI and local storage.
    const updatedWaypoints = waypoints.filter(wp => wp.id !== id);
    setWaypoints(updatedWaypoints);
    if (activeWaypoint?.id === id) setActiveWaypoint(null);
    saveWaypointsToLocal(updatedWaypoints);

    try {
        // If the waypoint has a temporary ID, it only exists locally, so no need to call the backend.
        if (!id.startsWith('temp_')) {
            await backendService.deleteWaypointForUser(id, currentUser.id);
        }
    } catch (error) {
        console.error("Failed to delete waypoint from backend:", error);
        // If deletion fails, revert the change and restore the waypoint.
        setWaypoints(originalWaypoints);
        saveWaypointsToLocal(originalWaypoints);
        // Optionally, inform the user about the failure.
    }
  };
  
  const handleSelectWaypoint = (waypoint: Waypoint) => {
      setActiveWaypoint(waypoint);
      setIsSettingsOpen(false);
  }
  
  const handleClearActiveWaypoint = () => {
    setActiveWaypoint(null);
    setIsTracking(false);
    setTriggeredAlarms([]);
  };
  
  const handleLoginSuccess = (user: User) => {
    // The auth listener will handle setting the user state.
    // This function now just closes the modal.
    setIsAuthOpen(false);
  }

  const handleLogout = async () => {
    try {
        await backendService.logout();
        // The auth listener will set currentUser to null, triggering data cleanup.
        setIsAuthOpen(false);
    } catch (error) {
        console.error("Logout failed:", error);
    }
  };
  
  const handleAddAnnouncement = (announcement: Announcement) => {
    setAnnouncements(prev => [announcement, ...prev]);
  };
  
  const handleDeleteAnnouncement = async (id: string) => {
    if (!currentUser) return;
    try {
      await backendService.deleteAnnouncement(id, currentUser.id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  if (loading) return <Preloader />;
  if (showIntro) return <IntroductionModal onDismiss={() => setShowIntro(false)} />;
  
  return (
    <div className="h-screen w-screen bg-gray-900 text-white font-sans">
      <MapComponent
        userPosition={userPosition}
        activeWaypoint={activeWaypoint}
        waypoints={waypoints}
        announcements={announcements}
        onMapClick={handleMapClick}
        onWaypointClick={handleSelectWaypoint}
        alertRadiuses={alertRadiuses}
        isTracking={isTracking}
        mapTheme={mapTheme}
      />
      <Header 
        onToggleSettings={() => setIsSettingsOpen(true)} 
        onToggleAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
      />
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
        onClearActiveWaypoint={handleClearActiveWaypoint}
        geolocationError={geolocationError}
        weatherData={weatherData}
        onOpenFindDestination={() => setIsAIAssistantOpen(true)}
        onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
        onOpenLocationPermissionInfo={() => setIsLocationInfoOpen(true)}
      />
      
      {alertingRadius !== null && (
        <AlertModal onDismiss={() => { alertService.stop(); setAlertingRadius(null); }} alertOptions={alertOptions} ringtoneUrl={selectedRingtone.url} alertingRadius={alertingRadius} waypoint={activeWaypoint}/>
      )}
      {isSettingsOpen && (
        <SettingsPage onClose={() => setIsSettingsOpen(false)} mapTheme={mapTheme} setMapTheme={setMapTheme} highAccuracyGPS={highAccuracyGPS} setHighAccuracyGPS={setHighAccuracyGPS} keepScreenOn={keepScreenOn} setKeepScreenOn={setKeepScreenOn} waypoints={waypoints} onSelectWaypoint={handleSelectWaypoint} onDeleteWaypoint={handleDeleteWaypoint} selectedRingtoneId={selectedRingtoneId} setSelectedRingtoneId={setSelectedRingtoneId} alarms={alarms} setAlarms={setAlarms}/>
      )}
      {isAIAssistantOpen && (
        <FindDestinationModal onClose={() => setIsAIAssistantOpen(false)} onDestinationFound={(pos) => { setIsAIAssistantOpen(false); handleMapClick(pos); }} />
      )}
      {waypointToEdit && (
        <EditWaypointModal onClose={() => setWaypointToEdit(null)} onSave={handleSaveWaypoint} waypoint={waypointToEdit} />
      )}
      {isLocationInfoOpen && (
          <LocationPermissionModal onAcknowledge={() => setIsLocationInfoOpen(false)} />
      )}
      {triggeredTransitAlarm && (
          <TransitAlarmModal alarm={triggeredTransitAlarm} ringtoneUrl={selectedRingtone.url} onDismiss={() => setTriggeredTransitAlarm(null)} />
      )}
      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} currentUser={currentUser} />
      )}
      {isAnnouncementsOpen && (
        <AnnouncementsFeed onClose={() => setIsAnnouncementsOpen(false)} currentUser={currentUser} userPosition={userPosition} announcements={announcements} setAnnouncements={setAnnouncements} onAddAnnouncement={handleAddAnnouncement} onDeleteAnnouncement={handleDeleteAnnouncement}/>
      )}
    </div>
  );
}

export default App;
