import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LatLngTuple, MapTheme, Waypoint, WaypointType } from '../types';
import IconTarget from './icons/IconTarget';
import IconUserLocation from './icons/IconUserLocation';
import { renderToStaticMarkup } from 'react-dom/server';
import MapAnimator from './MapAnimator';
import IconCrosshairs from './icons/IconCrosshairs';
import IconMapPin from './icons/IconMapPin';

interface MapThemeConfig {
  url: string;
  attribution: string;
}

const mapThemes: Record<MapTheme, MapThemeConfig> = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
}

interface MapComponentProps {
  userPosition: LatLngTuple | null;
  activeWaypoint: Waypoint | null;
  waypoints: Waypoint[];
  onMapClick: (position: LatLngTuple) => void;
  onWaypointClick: (waypoint: Waypoint) => void;
  alertRadiuses: number[];
  isTracking: boolean;
  mapTheme: MapTheme;
}

const userIconSvg = renderToStaticMarkup(<div className="relative flex items-center justify-center"><div className="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div><IconUserLocation className="relative w-8 h-8 text-blue-400 drop-shadow-lg" /></div>);
const userIcon = new L.DivIcon({
  html: userIconSvg,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const activeWaypointIconSvg = renderToStaticMarkup(<IconTarget className="w-10 h-10 text-red-500 drop-shadow-lg animate-pulse" />);
const activeWaypointIcon = new L.DivIcon({
    html: activeWaypointIconSvg,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const getWaypointIcon = (type: WaypointType) => {
    const colors: Record<WaypointType, string> = {
        stop: 'text-blue-400',
        shop: 'text-green-400',
        poi: 'text-purple-400',
    }
    const color = colors[type] || 'text-gray-400';
    const svg = renderToStaticMarkup(<IconMapPin className={`w-8 h-8 ${color} drop-shadow-md waypoint-icon`} />);
    return new L.DivIcon({
        html: svg,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
}


const MapClickHandler: React.FC<{ onMapClick: (pos: LatLngTuple) => void, isTracking: boolean }> = ({ onMapClick, isTracking }) => {
  useMapEvents({
    click(e) {
      if (!isTracking) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const MyLocationButton: React.FC<{ userPosition: LatLngTuple | null }> = ({ userPosition }) => {
    const map = useMap();

    const handleCenterView = () => {
        if (userPosition) {
            map.flyTo(userPosition, Math.max(map.getZoom(), 15));
        }
    };

    return (
        <div className="leaflet-control my-location-control">
            <button
                onClick={handleCenterView}
                disabled={!userPosition}
                className="my-location-button flex items-center justify-center"
                title="My Location"
                aria-label="Center map on your location"
            >
                <IconCrosshairs className="w-6 h-6" />
            </button>
        </div>
    );
};


const MapComponent: React.FC<MapComponentProps> = ({ userPosition, activeWaypoint, waypoints, onMapClick, onWaypointClick, alertRadiuses, isTracking, mapTheme }) => {
  const defaultCenter: LatLngTuple = [51.505, -0.09];
  const center = userPosition || defaultCenter;
  const themeConfig = mapThemes[mapTheme];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} zoomControl={false}>
      <ZoomControl position="topright" />
      <TileLayer
        key={mapTheme} // Add key to force re-render on theme change
        url={themeConfig.url}
        attribution={themeConfig.attribution}
      />
      <MapClickHandler onMapClick={onMapClick} isTracking={isTracking} />
      <MapAnimator activeWaypoint={activeWaypoint} userPosition={userPosition} isTracking={isTracking} />
      
      {userPosition && (
        <Marker position={userPosition} icon={userIcon} />
      )}

      {waypoints.map(waypoint => waypoint.id !== activeWaypoint?.id && (
        <Marker 
          key={waypoint.id} 
          position={waypoint.position} 
          icon={getWaypointIcon(waypoint.type)}
          eventHandlers={{ click: () => onWaypointClick(waypoint) }}
        />
      ))}

      {activeWaypoint && (
        <>
          <Marker position={activeWaypoint.position} icon={activeWaypointIcon} zIndexOffset={1000} />
          {alertRadiuses.map(radius => (
            <Circle
              key={radius}
              center={activeWaypoint.position}
              pathOptions={{
                color: isTracking ? '#0d9488' : '#f43f5e',
                fillColor: isTracking ? '#14b8a6' : '#ef4444',
                fillOpacity: 0.15,
              }}
              radius={radius}
            />
          ))}
        </>
      )}

      {userPosition && activeWaypoint && (
        <Polyline
            pathOptions={{ color: 'rgba(255, 255, 255, 0.5)', weight: 3, dashArray: '5, 10' }}
            positions={[userPosition, activeWaypoint.position]}
        />
      )}
      <MyLocationButton userPosition={userPosition} />
    </MapContainer>
  );
};

export default MapComponent;
