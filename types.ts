export type LatLngTuple = [number, number];

export type AlertOptions = {
  sound: boolean;
  vibration: boolean;
  voice: boolean;
};

export type MapTheme = 'dark' | 'light' | 'satellite';

export type Favorite = {
  id: string;
  name: string;
  position: LatLngTuple;
};

export type Ringtone = {
  id: string;
  name: string;
  url: string;
};