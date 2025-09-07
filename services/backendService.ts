import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged as onFirebaseAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  getDoc,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Announcement, LatLngTuple, AnnouncementType, Waypoint } from '../types';

// --- Auth ---

const formatUser = (user: FirebaseUser): User => ({
  id: user.uid,
  name: user.displayName || user.email || 'Anonymous',
});

export const backendService = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    // Reload user to get the updated profile
    await userCredential.user.reload();
    return formatUser(userCredential.user);
  },

  login: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return formatUser(userCredential.user);
  },

  logout: (): Promise<void> => {
    return signOut(auth);
  },

  onAuthStateChangedListener: (callback: (user: User | null) => void) => {
    return onFirebaseAuthStateChanged(auth, (user) => {
      callback(user ? formatUser(user) : null);
    });
  },

  // --- Announcements ---

  getAnnouncements: async (): Promise<Announcement[]> => {
    const announcementsCol = collection(db, 'announcements');
    // Remove the orderBy clause to avoid needing a composite index.
    // We will sort the results on the client-side.
    const q = query(announcementsCol);
    const snapshot = await getDocs(q);
    const announcements = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        position: [data.position.latitude, data.position.longitude],
        timestamp: (data.timestamp as Timestamp).toMillis(),
      } as Announcement;
    });
    // Sort by timestamp in descending order (newest first)
    return announcements.sort((a, b) => b.timestamp - a.timestamp);
  },

  addAnnouncement: async (message: string, type: AnnouncementType, position: LatLngTuple, user: User): Promise<Announcement> => {
    const newAnnouncementData = {
      userId: user.id,
      userName: user.name,
      position: new GeoPoint(position[0], position[1]),
      message,
      type,
      timestamp: Timestamp.fromDate(new Date()),
      upvotes: 0,
    };
    const docRef = await addDoc(collection(db, 'announcements'), newAnnouncementData);
    return {
      ...newAnnouncementData,
      id: docRef.id,
      position: position,
      timestamp: newAnnouncementData.timestamp.toMillis(),
    };
  },

  deleteAnnouncement: async (announcementId: string, userId: string): Promise<void> => {
    const announcementRef = doc(db, 'announcements', announcementId);
    const announcementSnap = await getDoc(announcementRef);
    if (!announcementSnap.exists() || announcementSnap.data().userId !== userId) {
      throw new Error('Permission denied or announcement not found.');
    }
    await deleteDoc(announcementRef);
  },

  upvoteAnnouncement: async (announcementId: string): Promise<Announcement> => {
    const announcementRef = doc(db, 'announcements', announcementId);
    await updateDoc(announcementRef, {
      upvotes: increment(1),
    });
    const updatedSnap = await getDoc(announcementRef);
    const data = updatedSnap.data();
    if (!data) throw new Error("Document not found after upvote");
    return {
      id: updatedSnap.id,
      ...data,
      position: [data.position.latitude, data.position.longitude],
      timestamp: (data.timestamp as Timestamp).toMillis(),
    } as Announcement;
  },

  // --- Waypoint Management ---

  getWaypointsForUser: async (userId: string): Promise<Waypoint[]> => {
    const waypointsCol = collection(db, 'waypoints');
    const q = query(waypointsCol, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        position: [data.position.latitude, data.position.longitude],
      } as Waypoint;
    });
  },

  addWaypointForUser: async (waypointData: Omit<Waypoint, 'id' | 'userId'>, userId: string): Promise<Waypoint> => {
    const newWaypointData = {
      ...waypointData,
      position: new GeoPoint(waypointData.position[0], waypointData.position[1]),
      userId,
    };
    const docRef = await addDoc(collection(db, 'waypoints'), newWaypointData);
    return {
      ...waypointData,
      id: docRef.id,
      userId,
    };
  },

  deleteWaypointForUser: async (waypointId: string, userId: string): Promise<void> => {
    const waypointRef = doc(db, 'waypoints', waypointId);
    const waypointSnap = await getDoc(waypointRef);
    if (!waypointSnap.exists() || waypointSnap.data().userId !== userId) {
      throw new Error('Permission denied or waypoint not found.');
    }
    await deleteDoc(waypointRef);
  },
};
