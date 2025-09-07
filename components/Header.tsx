import React from 'react';
import IconSettings from './icons/IconSettings';
import IconUser from './icons/IconUser';
import { User } from '../types';

interface HeaderProps {
    onToggleSettings: () => void;
    onToggleAuth: () => void;
    currentUser: User | null;
}

const Header: React.FC<HeaderProps> = ({ onToggleSettings, onToggleAuth, currentUser }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-lg flex justify-between items-center p-3 border-b border-teal-400/20">
            <button 
                onClick={onToggleAuth} 
                className="text-white hover:text-teal-300 transition-colors relative"
                aria-label={currentUser ? `Logged in as ${currentUser.name}` : 'Open login panel'}
            >
                <IconUser className="w-6 h-6"/>
                {currentUser && <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-teal-400 ring-2 ring-gray-800"></span>}
            </button>
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
