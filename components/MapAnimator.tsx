import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngTuple, Waypoint } from '../types';

interface MapAnimatorProps {
  activeWaypoint: Waypoint | null;
  userPosition: LatLngTuple | null;
  isTracking: boolean;
}

const MapAnimator: React.FC<MapAnimatorProps> = ({ activeWaypoint, userPosition, isTracking }) => {
  const map = useMap();

  useEffect(() => {
    // Animate to destination when it's set or changed
    if (activeWaypoint) {
      map.flyTo(activeWaypoint.position, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [activeWaypoint, map]);

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
