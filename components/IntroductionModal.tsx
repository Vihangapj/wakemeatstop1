import React from 'react';
import IconMapPin from './icons/IconMapPin';
import IconPlayCircle from './icons/IconPlayCircle';
import IconBellRing from './icons/IconBellRing';

interface IntroductionModalProps {
  onDismiss: () => void;
}

const IntroductionModal: React.FC<IntroductionModalProps> = ({ onDismiss }) => {
  const introSteps = [
    {
      icon: IconMapPin,
      title: 'Set Your Destination',
      description: 'Tap the map, use the AI Assistant, or pick a favorite place.',
    },
    {
      icon: IconPlayCircle,
      title: 'Start Tracking',
      description: 'Hit the "Start Tracking" button to monitor your location.',
    },
    {
      icon: IconBellRing,
      title: 'Get Notified',
      description: 'Receive an alert when you get close to your destination.',
    },
  ];

  return (
    <div className="fixed inset-0 z-[4000] bg-gray-900/95 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
      <div className="text-center text-white max-w-md">
        <h1 className="text-4xl font-bold mb-4 tracking-wider">Welcome to <span className="text-teal-400">WakeMe@Stop</span></h1>
        <p className="text-gray-300 text-lg mb-12">Never miss your stop again.</p>
        
        <div className="space-y-8 mb-16">
          {introSteps.map((step, index) => (
            <div key={index} className="flex items-start text-left gap-4">
              <div className="flex-shrink-0 bg-teal-500/10 p-3 rounded-full border border-teal-500/20">
                <step.icon className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{step.title}</h2>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={onDismiss}
          className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 text-lg"
        >
          Let's Go
        </button>
      </div>
    </div>
  );
};

export default IntroductionModal;