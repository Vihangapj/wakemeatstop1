import React, { useState, useEffect } from 'react';
import { Announcement, AnnouncementType, LatLngTuple, User } from '../types';
import { backendService } from '../services/backendService';
import { calculateDistance } from '../utils/geo';
import IconMegaphone from './icons/IconMegaphone';
import IconX from './icons/IconX';
import IconThumbsUp from './icons/IconThumbsUp';
import IconPlus from './icons/IconPlus';
import IconTrash from './icons/IconTrash';

interface AnnouncementsFeedProps {
  onClose: () => void;
  currentUser: User | null;
  userPosition: LatLngTuple | null;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

const AnnouncementItem: React.FC<{ 
    announcement: Announcement, 
    userPosition: LatLngTuple | null, 
    currentUser: User | null,
    onUpvote: (id: string) => void,
    onDelete: (id: string) => void,
}> = ({ announcement, userPosition, currentUser, onUpvote, onDelete }) => {
    const distance = userPosition ? calculateDistance(userPosition[0], userPosition[1], announcement.position[0], announcement.position[1]) : null;
    
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    }

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
                <span>{timeAgo(announcement.timestamp)}</span>
                <div className="flex items-center gap-4">
                    {distance !== null && <span className="font-medium">{(distance / 1000).toFixed(1)} km away</span>}
                    <button onClick={() => onUpvote(announcement.id)} className="flex items-center gap-1.5 hover:text-teal-400 transition-colors">
                        <IconThumbsUp className="w-4 h-4" />
                        <span className="font-bold">{announcement.upvotes}</span>
                    </button>
                     {currentUser?.id === announcement.userId && (
                        <button onClick={() => onDelete(announcement.id)} className="flex items-center gap-1.5 hover:text-red-400 transition-colors" title="Delete announcement">
                            <IconTrash className="w-4 h-4" />
                        </button>
                     )}
                </div>
            </div>
        </div>
    );
};

const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({ onClose, currentUser, userPosition, announcements, setAnnouncements, onAddAnnouncement, onDeleteAnnouncement }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newMessageType, setNewMessageType] = useState<AnnouncementType>('info');

  useEffect(() => {
    // Data is now fetched in App.tsx to avoid re-fetches
    if (announcements.length === 0) {
        setIsLoading(true);
        backendService.getAnnouncements()
            .then(data => {
                setAnnouncements(data);
                setIsLoading(false);
            })
            .catch(() => {
                setError("Could not load announcements.");
                setIsLoading(false);
            });
    }
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
    setIsPosting(true);
    try {
        const newAnnouncement = await backendService.addAnnouncement(newMessage, newMessageType, userPosition, currentUser);
        onAddAnnouncement(newAnnouncement);
        setNewMessage('');
    } catch (e) {
        console.error("Failed to post announcement", e);
    } finally {
        setIsPosting(false);
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
                <AnnouncementItem 
                    key={announcement.id} 
                    announcement={announcement} 
                    userPosition={userPosition} 
                    currentUser={currentUser}
                    onUpvote={handleUpvote}
                    onDelete={onDeleteAnnouncement}
                />
            ))}
             {!isLoading && announcements.length === 0 && <p className="text-center text-gray-500 pt-8">No community alerts right now. Be the first!</p>}
        </div>

        {currentUser && userPosition && (
            <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-900/50">
                <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Share an update with the community..."
                    rows={3}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-teal-500 transition-colors mb-3"
                    disabled={isPosting}
                ></textarea>
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        {(['info', 'delay', 'accident'] as AnnouncementType[]).map(type => (
                             <button key={type} onClick={() => setNewMessageType(type)} className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${newMessageType === type ? 'bg-teal-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`} disabled={isPosting}>
                                 {type}
                             </button>
                        ))}
                    </div>
                    <button onClick={handlePost} disabled={!newMessage.trim() || isPosting} className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition-transform active:scale-95 disabled:bg-gray-500 disabled:cursor-wait w-24">
                        {isPosting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <IconPlus className="w-5 h-5"/> Post
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsFeed;