import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngTuple } from '../types';

interface MapAnimatorProps {
  destination: LatLngTuple | null;
  userPosition: LatLngTuple | null;
  isTracking: boolean;
  panRequest: LatLngTuple | null;
  setPanRequest: (position: LatLngTuple | null) => void;
}

const MapAnimator: React.FC<MapAnimatorProps> = ({ destination, userPosition, isTracking, panRequest, setPanRequest }) => {
  const map = useMap();

  useEffect(() => {
    // Animate to a specific position when requested
    if (panRequest) {
      map.flyTo(panRequest, map.getZoom(), {
        animate: true,
        duration: 1.0,
      });
      setPanRequest(null);
    }
  }, [panRequest, setPanRequest, map]);

  useEffect(() => {
    // Animate to destination when it's set or changed, but only if not currently tracking
    if (destination && !isTracking) {
      map.flyTo(destination, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [destination, isTracking, map]);

  useEffect(() => {
    // Animate to user's position when tracking is active
    if (isTracking && userPosition) {
        // When tracking starts, zoom in closer for a better view
        const targetZoom = map.getZoom() < 14 ? 16 : map.getZoom();
        map.flyTo(userPosition, targetZoom, {
            animate: true,
            duration: 1
        });
    }
  }, [isTracking, userPosition, map]);

  return null;
};

export default MapAnimator;
