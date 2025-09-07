import React, { useState, useEffect } from 'react';
import { Announcement, AnnouncementType, LatLngTuple, User } from '../types';
import { backendService } from '../services/backendService';
import { calculateDistance } from '../utils/geo';
import IconMegaphone from './icons/IconMegaphone';
import IconX from './icons/IconX';
import IconThumbsUp from './icons/IconThumbsUp';
import IconPlus from './icons/IconPlus';

interface AnnouncementsFeedProps {
  onClose: () => void;
  currentUser: User | null;
  userPosition: LatLngTuple | null;
}

const AnnouncementItem: React.FC<{ announcement: Announcement, userPosition: LatLngTuple | null, onUpvote: (id: string) => void }> = ({ announcement, userPosition, onUpvote }) => {
    const distance = userPosition ? calculateDistance(userPosition[0], userPosition[1], announcement.position[0], announcement.position[1]) : null;
    const timeAgo = new Date(announcement.timestamp).toLocaleString();

    const typeClasses: Record<AnnouncementType, {bg: string, text: string, border: string}> = {
        delay: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30' },
        accident: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30' },
        info: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30' },
    }
    const classes = typeClasses[announcement.type] || typeClasses.info;

    return (
        <div className={`bg-gray-800/50 p-4 rounded-lg border ${classes.border}`}>
            <div className="flex justify-between items-start text-sm mb-2">
                <div className="font-bold text-white">{announcement.userName}</div>
                <div className={`font-semibold px-2 py-0.5 rounded-full text-xs ${classes.bg} ${classes.text}`}>{announcement.type}</div>
            </div>
            <p className="text-gray-200 mb-3">{announcement.message}</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{timeAgo}</span>
                <div className="flex items-center gap-4">
                    {distance !== null && <span className="font-medium">{(distance / 1000).toFixed(1)} km away</span>}
                    <button onClick={() => onUpvote(announcement.id)} className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
                        <IconThumbsUp className="w-4 h-4" />
                        <span className="font-bold">{announcement.upvotes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({ onClose, currentUser, userPosition }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newMessageType, setNewMessageType] = useState<AnnouncementType>('info');

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await backendService.getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      setError('Could not load announcements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleUpvote = async (id: string) => {
    try {
      const updated = await backendService.upvoteAnnouncement(id);
      setAnnouncements(announcements.map(a => a.id === id ? updated : a));
    } catch (e) {
      console.error("Upvote failed", e);
    }
  };

  const handlePost = async () => {
    if (!newMessage.trim() || !currentUser || !userPosition) return;
    try {
        const newAnnouncement = await backendService.addAnnouncement(newMessage, newMessageType, userPosition, currentUser);
        setAnnouncements([newAnnouncement, ...announcements]);
        setNewMessage('');
    } catch (e) {
        console.error("Failed to post announcement", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-gray-900 animate-slide-in-from-right flex flex-col">
      <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl w-full flex flex-col h-full">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="flex items-center gap-3 text-xl font-bold text-white">
            <IconMegaphone className="w-6 h-6 text-yellow-400" />
            Community Alerts
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 -m-2" aria-label="Close"><IconX className="w-6 h-6" /></button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto flex-grow">
            {isLoading && <p className="text-center text-gray-400">Loading alerts...</p>}
            {error && <p className="text-center text-red-400">{error}</p>}
            {!isLoading && announcements.map(announcement => (
                <AnnouncementItem key={announcement.id} announcement={announcement} userPosition={userPosition} onUpvote={handleUpvote}/>
            ))}
             {!isLoading && announcements.length === 0 && <p className="text-center text-gray-500 pt-8">No community alerts right now.</p>}
        </div>

        {currentUser && userPosition && (
            <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-900/50">
                <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Share an update with the community..."
                    rows={3}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors mb-3"
                ></textarea>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {(['info', 'delay', 'accident'] as AnnouncementType[]).map(type => (
                             <button key={type} onClick={() => setNewMessageType(type)} className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${newMessageType === type ? 'bg-teal-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}>
                                 {type}
                             </button>
                        ))}
                    </div>
                    <button onClick={handlePost} disabled={!newMessage.trim()} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition-transform active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <IconPlus className="w-5 h-5"/> Post
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsFeed;
