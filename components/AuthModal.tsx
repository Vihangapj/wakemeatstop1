import React, { useState } from 'react';
import { User } from '../types';
import { backendService } from '../services/backendService';
import IconUser from './icons/IconUser';
import IconX from './icons/IconX';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  currentUser: User | null;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess, onLogout, currentUser }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLoginView && !name.trim())) {
      setError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const user = isLoginView
        ? await backendService.login(email, password)
        : await backendService.register(name, email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      if (err.code) {
          switch (err.code) {
              case 'auth/invalid-email':
                  friendlyMessage = 'Please enter a valid email address.';
                  break;
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  friendlyMessage = 'Invalid email or password.';
                  break;
              case 'auth/email-already-in-use':
                  friendlyMessage = 'An account with this email already exists.';
                  break;
              case 'auth/weak-password':
                  friendlyMessage = 'Password should be at least 6 characters.';
                  break;
              default:
                  friendlyMessage = 'Authentication failed. Please try again.';
          }
      } else if (err.message) {
          friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="fixed inset-0 z-[3000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <IconUser className="w-6 h-6 text-teal-400" />
              Profile
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close"><IconX className="w-6 h-6" /></button>
          </header>
          <div className="p-6 text-center">
            <p className="text-gray-300 mb-6">Logged in as <span className="font-bold text-white">{currentUser.name}</span></p>
            <button
              onClick={onLogout}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconUser className="w-6 h-6 text-teal-400" />
            {isLoginView ? 'Login' : 'Register'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close"><IconX className="w-6 h-6" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isLoginView && (
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., TransitFan"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
                disabled={isLoading}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
              disabled={isLoading}
              autoComplete={isLoginView ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit" disabled={isLoading}
            className="w-full flex justify-center items-center bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-wait"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (isLoginView ? 'Login' : 'Create Account')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
              className="text-sm text-teal-400 hover:text-teal-300"
            >
              {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;