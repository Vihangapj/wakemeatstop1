import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngTuple } from '../types';

interface MapAnimatorProps {
  destination: LatLngTuple | null;
  userPosition: LatLngTuple | null;
  isTracking: boolean;
}

const MapAnimator: React.FC<MapAnimatorProps> = ({ destination, userPosition, isTracking }) => {
  const map = useMap();

  useEffect(() => {
    // Animate to destination when it's set or changed
    if (destination) {
      map.flyTo(destination, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [destination, map]);

  useEffect(() => {
    // Animate to user's position when tracking starts or position is found
    if (isTracking && userPosition) {
        map.flyTo(userPosition, map.getZoom(), {
            animate: true,
            duration: 1
        });
    }
  }, [isTracking, userPosition, map]);

  return null;
};

export default MapAnimator;