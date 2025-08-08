export type LatLngTuple = [number, number];

export type AlertOptions = {
  sound: boolean;
  vibration: boolean;
  voice: boolean;
};

export type Alert = {
  id: string;
  distance: number;
  triggered: boolean;
};

export type AlertDistance = {
  id: string;
  distance: number;
};

export type MapTheme = 'dark' | 'light' | 'satellite';

export type Favorite = {
  id:string;
  name: string;
  position: LatLngTuple;
};

export type Ringtone = {
  id: string;
  name: string;
  url: string;
};