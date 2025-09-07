export type LatLngTuple = [number, number];

export type AlertOptions = {
  sound: boolean;
  vibration: boolean;
  voice: boolean;
};

export type MapTheme = 'dark' | 'light' | 'satellite';

export type WaypointType = 'stop' | 'shop' | 'poi';

export type Waypoint = {
  id: string;
  name: string;
  position: LatLngTuple;
  type: WaypointType;
  reminder?: string;
};

export type Ringtone = {
  id: string;
  name: string;
  url: string;
};

export type WeatherData = {
    temp: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    cloudiness: number;
    rainVolume?: number; // Rain volume for the last 1 hour
};

export type TransitAlarm = {
    id: string;
    time: string; // "HH:MM"
    label: string;
    leadTime: number; // minutes
    enabled: boolean;
};

export type User = {
  id: string;
  name: string;
};

// Represents a user account stored in the simulated database
export type UserCredentials = User & {
  password: string;
};

export type AnnouncementType = 'delay' | 'accident' | 'info';

export type Announcement = {
  id:string;
  userId: string;
  userName: string;
  position: LatLngTuple;
  message: string;
  type: AnnouncementType;
  timestamp: number; // Unix timestamp
  upvotes: number;
};
