import React from 'react';
import IconSettings from './icons/IconSettings';

interface HeaderProps {
    onToggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSettings }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-lg flex justify-between items-center p-3 border-b border-teal-400/20">
            <div className="w-8"></div> {/* Spacer */}
            <h1 className="text-xl font-bold text-white text-center tracking-wider">
                WakeMe@Stop
            </h1>
            <button 
                onClick={onToggleSettings} 
                className="text-white hover:text-teal-300 transition-colors"
                aria-label="Open settings"
            >
                <IconSettings className="w-6 h-6"/>
            </button>
        </div>
    </div>
  );
};

export default Header;