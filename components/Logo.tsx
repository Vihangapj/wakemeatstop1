import React from 'react';

// Using a hosted URL for the provided logo image.
const LOGO_URL = "https://cdn.glitch.global/6a80426c-3c8c-4158-9488-87d2a5a5146d/preloader-logo.png";

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={className}>
      <img 
        src={LOGO_URL} 
        alt="WakeMe@Stop Logo" 
        className="w-48 h-48 object-cover rounded-3xl shadow-2xl" 
      />
    </div>
);

export default Logo;
