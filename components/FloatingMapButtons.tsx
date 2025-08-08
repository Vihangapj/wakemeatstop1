import React, { useRef, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import IconSettings from './icons/IconSettings';
import IconCrosshairs from './icons/IconCrosshairs';
import IconPlus from './icons/IconPlus';
import IconMinus from './icons/IconMinus';

interface FloatingMapButtonsProps {
    onCenterOnUser: () => void;
    onToggleSettings: () => void;
    isUserLocationAvailable: boolean;
}

const FloatingButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    'aria-label': string;
    className?: string;
}> = ({ onClick, disabled, children, 'aria-label': ariaLabel, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`bg-gray-800/80 backdrop-blur-md text-white rounded-full p-3 shadow-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={ariaLabel}
    >
        {children}
    </button>
);

const FloatingMapButtons: React.FC<FloatingMapButtonsProps> = ({ onCenterOnUser, onToggleSettings, isUserLocationAvailable }) => {
    const map = useMap();
    const topControlsRef = useRef<HTMLDivElement>(null);
    const bottomControlsRef = useRef<HTMLDivElement>(null);

    // Prevent map click events when interacting with the floating buttons
    useEffect(() => {
        if (topControlsRef.current) {
            L.DomEvent.disableClickPropagation(topControlsRef.current);
        }
        if (bottomControlsRef.current) {
            L.DomEvent.disableClickPropagation(bottomControlsRef.current);
        }
    }, []);

    const zoomIn = () => map.zoomIn();
    const zoomOut = () => map.zoomOut();

    return (
        <>
            <div className="leaflet-top leaflet-right">
                <div ref={topControlsRef} className="leaflet-control mt-20 mr-2 flex flex-col gap-2">
                    <FloatingButton onClick={onToggleSettings} aria-label="Open settings">
                        <IconSettings className="w-6 h-6" />
                    </FloatingButton>
                    <FloatingButton onClick={onCenterOnUser} disabled={!isUserLocationAvailable} aria-label="Center on my location">
                        <IconCrosshairs className="w-6 h-6" />
                    </FloatingButton>
                </div>
            </div>
            <div className="leaflet-bottom leaflet-right">
                 <div ref={bottomControlsRef} className="leaflet-control mb-4 mr-2 flex flex-col gap-2">
                    <FloatingButton onClick={zoomIn} aria-label="Zoom in">
                       <IconPlus className="w-6 h-6" />
                    </FloatingButton>
                    <FloatingButton onClick={zoomOut} aria-label="Zoom out">
                       <IconMinus className="w-6 h-6" />
                    </FloatingButton>
                 </div>
            </div>
        </>
    );
};

export default FloatingMapButtons;
