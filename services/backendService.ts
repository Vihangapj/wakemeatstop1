import { UserCredentials, Announcement, LatLngTuple, User, AnnouncementType } from '../types';

// --- SIMULATED BACKEND ---
// In a real app, this would be an API client.
// Here, we use localStorage to simulate a persistent database.

const DB_KEY = 'wakemeatstop_db';

interface Database {
  users: UserCredentials[];
  announcements: Announcement[];
}

const getDb = (): Database => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    if (dbString) {
      return JSON.parse(dbString);
    }
  } catch (e) {
    console.error("Failed to read DB from localStorage", e);
  }
  // Default data if DB is empty or corrupt
  return {
    users: [],
    announcements: [
        {
            id: 'anno-1',
            userId: 'user-1',
            userName: 'TransitFan',
            position: [51.515, -0.09],
            message: "Heads up! The Northern line is experiencing minor delays at Bank station.",
            type: 'delay',
            timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
            upvotes: 5,
        },
        {
            id: 'anno-2',
            userId: 'user-2',
            userName: 'CityExplorer',
            position: [51.505, -0.07],
            message: "Ticket inspectors are active on buses around London Bridge.",
            type: 'info',
            timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
            upvotes: 12,
        }
    ],
  };
};

const saveDb = (db: Database) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save DB to localStorage", e);
  }
};

// Simulate API call latency
const simulateApi = <T>(data: T, delay = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
}
const simulateApiError = (message: string, delay = 500): Promise<any> => {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}


export const backendService = {
  register: async (name: string, password: string): Promise<User> => {
    const db = getDb();
    if (db.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
        return simulateApiError('Username is already taken.');
    }
    const newUser: UserCredentials = {
      id: `user-${Date.now()}`,
      name,
      password, // In a real app, hash this!
    };
    db.users.push(newUser);
    saveDb(db);
    const { password: _, ...user } = newUser;
    return simulateApi(user);
  },

  login: async (name: string, password: string): Promise<User> => {
    const db = getDb();
    const user = db.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
    if (!user) {
        return simulateApiError('Invalid username or password.');
    }
    const { password: _, ...userInfo } = user;
    return simulateApi(userInfo);
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const db = getDb();
    // Sort by most recent
    const sorted = [...db.announcements].sort((a, b) => b.timestamp - a.timestamp);
    return simulateApi(sorted);
  },

  addAnnouncement: async (
    message: string, 
    type: AnnouncementType,
    position: LatLngTuple, 
    user: User
  ): Promise<Announcement> => {
    const db = getDb();
    const newAnnouncement: Announcement = {
        id: `anno-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        position,
        message,
        type,
        timestamp: Date.now(),
        upvotes: 0,
    };
    db.announcements.unshift(newAnnouncement); // Add to beginning
    saveDb(db);
    return simulateApi(newAnnouncement, 800);
  },

  upvoteAnnouncement: async (announcementId: string): Promise<Announcement> => {
    const db = getDb();
    const announcement = db.announcements.find(a => a.id === announcementId);
    if (!announcement) {
        return simulateApiError('Announcement not found.');
    }
    announcement.upvotes += 1;
    saveDb(db);
    return simulateApi(announcement, 300);
  }
};
