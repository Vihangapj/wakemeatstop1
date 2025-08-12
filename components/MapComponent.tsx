import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { LatLngTuple, MapTheme } from '../types';
import IconTarget from './icons/IconTarget';
import IconUserLocation from './icons/IconUserLocation';
import { renderToStaticMarkup } from 'react-dom/server';
import MapAnimator from './MapAnimator';
import IconCrosshairs from './icons/IconCrosshairs';

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
  destination: LatLngTuple | null;
  setDestination: (position: LatLngTuple) => void;
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

const destinationIconSvg = renderToStaticMarkup(<IconTarget className="w-8 h-8 text-red-500 drop-shadow-lg" />);
const destinationIcon = new L.DivIcon({
    html: destinationIconSvg,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const MapClickHandler: React.FC<{ setDestination: (pos: LatLngTuple) => void, isTracking: boolean }> = ({ setDestination, isTracking }) => {
  useMapEvents({
    click(e) {
      if (!isTracking) {
        setDestination([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const ChangeZoomControlPosition: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        if (map.zoomControl) {
            map.zoomControl.setPosition('topright');
        }
    }, [map]);
    return null;
}

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


const MapComponent: React.FC<MapComponentProps> = ({ userPosition, destination, setDestination, alertRadiuses, isTracking, mapTheme }) => {
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
      <MapClickHandler setDestination={setDestination} isTracking={isTracking} />
      <MapAnimator destination={destination} userPosition={userPosition} isTracking={isTracking} />
      
      {userPosition && (
        <Marker position={userPosition} icon={userIcon} />
      )}

      {destination && (
        <>
          <Marker position={destination} icon={destinationIcon} />
          {alertRadiuses.map(radius => (
            <Circle
              key={radius}
              center={destination}
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

      {userPosition && destination && (
        <Polyline
            pathOptions={{ color: 'rgba(255, 255, 255, 0.5)', weight: 3, dashArray: '5, 10' }}
            positions={[userPosition, destination]}
        />
      )}
      <MyLocationButton userPosition={userPosition} />
    </MapContainer>
  );
};

export default MapComponent;