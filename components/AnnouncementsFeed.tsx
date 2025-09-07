import React, { useState, useMemo } from 'react';
import { Announcement, AnnouncementType, User, LatLngTuple } from '../types';
import IconX from './icons/IconX';
import IconMegaphone from './icons/IconMegaphone';
import IconPlus from './icons/IconPlus';
import IconThumbsUp from './icons/IconThumbsUp';
import IconClock from './icons/IconClock';
import IconAccident from './icons/IconAccident';
import IconInfo from './icons/IconInfo';

interface AnnouncementsFeedProps {
  onClose: () => void;
  announcements: Announcement[];
  currentUser: User | null;
  onLoginRequest: () => void;
  onCreateAnnouncement: (announcement: Omit<Announcement, 'id' | 'userId' | 'userName' | 'timestamp' | 'upvotes'>) => void;
  onUpvote: (id: string) => void;
  userPosition: LatLngTuple | null;
}

const announcementTypes: { id: AnnouncementType; label: string, icon: React.FC<any> }[] = [
    { id: 'delay', label: 'Delay', icon: IconClock },
    { id: 'accident', label: 'Accident', icon: IconAccident },
    { id: 'info', label: 'Info', icon: IconInfo },
];

const TimeAgo: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    if (seconds < 60) return <span>{seconds}s ago</span>;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return <span>{minutes}m ago</span>;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return <span>{hours}h ago</span>;
    const days = Math.floor(hours / 24);
    return <span>{days}d ago</span>;
}

const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({
  onClose, announcements, currentUser, onLoginRequest, onCreateAnnouncement, onUpvote, userPosition
}) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AnnouncementType>('info');
  const [error, setError] = useState<string | null>(null);
  
  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a, b) => b.timestamp - a.timestamp);
  }, [announcements]);

  const handleCreateClick = () => {
    if (!currentUser) {
      onLoginRequest();
    } else {
      setView('create');
    }
  };

  const handleSubmit = () => {
    if (!message.trim()) {
        setError('Please enter a message for your announcement.');
        return;
    }
    if (!userPosition) {
        setError('Could not determine your current location. Please try again.');
        return;
    }
    onCreateAnnouncement({ message: message.trim(), type, position: userPosition });
    setMessage('');
    setType('info');
    setError(null);
    setView('list');
  }

  const getIconForType = (type: AnnouncementType) => {
    const config = announcementTypes.find(t => t.id === type);
    return config ? <config.icon className="w-5 h-5" /> : <IconInfo className="w-5 h-5"/>;
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900 animate-slide-in-from-right flex flex-col">
      <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl w-full flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconMegaphone className="w-6 h-6 text-yellow-400"/>
            Community Alerts
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 -m-2" aria-label="Close">
            <IconX className="w-6 h-6" />
          </button>
        </header>

        {view === 'list' ? (
          <>
            <div className="p-4 flex-grow overflow-y-auto">
              {sortedAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {sortedAnnouncements.map(ann => (
                    <div key={ann.id} className="bg-gray-700/60 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                          {getIconForType(ann.type)}
                          <span>{ann.userName}</span>
                        </div>
                        <span className="text-xs text-gray-400"><TimeAgo timestamp={ann.timestamp} /></span>
                      </div>
                      <p className="my-3 text-gray-100">{ann.message}</p>
                      <div className="flex items-center">
                        <button onClick={() => onUpvote(ann.id)} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                          <IconThumbsUp className="w-4 h-4" />
                          <span>{ann.upvotes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4">
                  <p className="text-gray-400">No community alerts in this area yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Be the first to post one!</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <button onClick={handleCreateClick} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                <IconPlus className="w-6 h-6" />
                New Announcement
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 space-y-6">
            <div>
                <label htmlFor="announcement-message" className="block text-sm font-medium text-gray-300 mb-2">Your Announcement</label>
                <textarea
                    id="announcement-message"
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="e.g., 'Bus #42 is running 15 mins late...'"
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500"
                ></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                    {announcementTypes.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setType(id)} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${type === id ? 'bg-teal-500/20 border-teal-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}>
                            <Icon className="w-6 h-6" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex gap-3">
                <button onClick={() => setView('list')} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
                <button onClick={handleSubmit} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Post
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsFeed;
