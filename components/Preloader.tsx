import React from 'react';
import Logo from './Logo';

const Preloader: React.FC = () => {
  // The custom SVG background is no longer needed as the logo image contains the background.
  return (
    <div className="fixed inset-0 z-[5000] bg-gray-900 flex flex-col items-center justify-center animate-fade-in">
      <div className="animate-pulse">
        <Logo />
      </div>
      <div className="absolute bottom-12 text-gray-500 text-sm tracking-widest animate-pulse">
        LOADING...
      </div>
    </div>
  );
};

export default Preloader;
