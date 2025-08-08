import React from 'react';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="bg-gray-900/50 backdrop-blur-md rounded-xl shadow-lg flex justify-between items-center p-3">
            <div className="w-8"></div> {/* Spacer */}
            <h1 className="text-xl font-bold text-white text-center tracking-wider">
                WakeMe@Stop
            </h1>
            <div className="w-8"></div> {/* Spacer for symmetry */}
        </div>
    </div>
  );
};

export default Header;
