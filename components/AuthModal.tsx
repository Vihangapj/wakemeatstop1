import React, { useState } from 'react';
import { User } from '../types';
import IconUser from './icons/IconUser';
import IconX from './icons/IconX';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (name: string) => void;
  onLogout: () => void;
  currentUser: User | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onLogout, currentUser }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    onLogin(name.trim());
  };
  
  const handleLogout = () => {
    onLogout();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconUser className="w-6 h-6 text-teal-400"/>
            {currentUser ? 'Your Profile' : 'Join the Community'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close"><IconX className="w-6 h-6" /></button>
        </header>

        <div className="p-6">
          {currentUser ? (
            <div className="text-center">
                <p className="text-gray-300">You are logged in as:</p>
                <p className="text-2xl font-bold text-white my-4">{currentUser.name}</p>
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Log Out
                </button>
            </div>
          ) : (
            <div className="space-y-4">
                <p className="text-center text-gray-300 text-sm">Create a profile to post alerts and help others.</p>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Choose a display name</label>
                    <input
                        id="username"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Your Name"
                        className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
                    />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    onClick={handleLogin}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Continue
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
