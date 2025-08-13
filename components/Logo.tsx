import React from 'react';

// Using a hosted URL for the provided logo image.
const LOGO_URL = "https://lh3.googleusercontent.com/d/1Q7VkkaZYNQbe0f97xtef0XAVoufn4cdo";

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
