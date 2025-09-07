import { UserCredentials, Announcement, LatLngTuple, User, AnnouncementType, Waypoint } from '../types';

// --- SIMULATED BACKEND ---
// This service mimics a real-world API by managing data in localStorage
// with user-specific ownership rules.

const DB_KEY = 'wakemeatstop_db';

interface Database {
  users: UserCredentials[];
  announcements: Announcement[];
  waypoints: Waypoint[];
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
  // Initialize with an empty structure
  return {
    users: [],
    announcements: [],
    waypoints: [],
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
    const sorted = [...db.announcements].sort((a, b) => b.timestamp - a.timestamp);
    return simulateApi(sorted, 800);
  },

  addAnnouncement: async (message: string, type: AnnouncementType, position: LatLngTuple, user: User): Promise<Announcement> => {
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
    db.announcements.unshift(newAnnouncement);
    saveDb(db);
    return simulateApi(newAnnouncement, 800);
  },

  deleteAnnouncement: async (announcementId: string, userId: string): Promise<void> => {
    const db = getDb();
    const announcementIndex = db.announcements.findIndex(a => a.id === announcementId);
    if (announcementIndex === -1) {
        return simulateApiError('Announcement not found.');
    }
    if (db.announcements[announcementIndex].userId !== userId) {
        return simulateApiError('You are not authorized to delete this announcement.');
    }
    db.announcements.splice(announcementIndex, 1);
    saveDb(db);
    return simulateApi(undefined, 400);
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
  },
  
  // --- Waypoint Management ---
  getWaypointsForUser: async (userId: string): Promise<Waypoint[]> => {
    const db = getDb();
    const userWaypoints = db.waypoints.filter(wp => wp.userId === userId);
    return simulateApi(userWaypoints, 600);
  },
  
  addWaypointForUser: async (waypointData: Omit<Waypoint, 'id' | 'userId'>, userId: string): Promise<Waypoint> => {
    const db = getDb();
    const newWaypoint: Waypoint = {
        ...waypointData,
        id: `wp-${Date.now()}`,
        userId: userId,
    };
    db.waypoints.push(newWaypoint);
    saveDb(db);
    return simulateApi(newWaypoint);
  },
  
  deleteWaypointForUser: async (waypointId: string, userId: string): Promise<void> => {
    const db = getDb();
    const waypointIndex = db.waypoints.findIndex(wp => wp.id === waypointId);
    if (waypointIndex === -1) {
        return simulateApiError('Waypoint not found.');
    }
    if (db.waypoints[waypointIndex].userId !== userId) {
        return simulateApiError('You are not authorized to delete this waypoint.');
    }
    db.waypoints.splice(waypointIndex, 1);
    saveDb(db);
    return simulateApi(undefined, 400);
  }
};