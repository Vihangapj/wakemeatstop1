import React from 'react';

// Using a hosted URL for the provided logo image.
const LOGO_URL = "https://github.com/Vihangapj/wakemeatstop1/blob/35f8adbe83343c28f521a317d6cfa44285309acf/logo.png";

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
