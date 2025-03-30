import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { User, Site, Scan, Log } from './types';

// Métodos para usuários
export const createUser = async (uid: string, userData: Omit<User, 'uid' | 'createdAt'>) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...userData,
    uid,
    createdAt: serverTimestamp(),
  });
};

export const getUser = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  
  return null;
};

export const updateUserProfile = async (uid: string, userData: Partial<Omit<User, 'uid' | 'createdAt'>>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, userData);
};

// Métodos para sites
export const addSite = async (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
  const sitesRef = collection(db, 'sites');
  const timestamp = serverTimestamp();
  
  const docRef = await addDoc(sitesRef, {
    ...siteData,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  
  return docRef.id;
};

export const getSite = async (siteId: string) => {
  const siteRef = doc(db, 'sites', siteId);
  const siteSnap = await getDoc(siteRef);
  
  if (siteSnap.exists()) {
    return siteSnap.data() as Site;
  }
  
  return null;
};

export const getUserSites = async (userId: string) => {
  const sitesRef = collection(db, 'sites');
  const q = query(sitesRef, where('ownerId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const sites: Site[] = [];
  querySnapshot.forEach((doc) => {
    sites.push({ id: doc.id, ...doc.data() } as Site);
  });
  
  return sites;
};

export const updateSite = async (siteId: string, siteData: Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const siteRef = doc(db, 'sites', siteId);
  await updateDoc(siteRef, {
    ...siteData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSite = async (siteId: string) => {
  const siteRef = doc(db, 'sites', siteId);
  await deleteDoc(siteRef);
};

// Métodos para scans
export const addScan = async (scanData: Omit<Scan, 'id' | 'timestamp'>) => {
  const scansRef = collection(db, 'scans');
  
  const docRef = await addDoc(scansRef, {
    ...scanData,
    timestamp: serverTimestamp(),
  });
  
  return docRef.id;
};

export const getScan = async (scanId: string) => {
  const scanRef = doc(db, 'scans', scanId);
  const scanSnap = await getDoc(scanRef);
  
  if (scanSnap.exists()) {
    return scanSnap.data() as Scan;
  }
  
  return null;
};

export const getSiteScanHistory = async (siteId: string) => {
  const scansRef = collection(db, 'scans');
  const q = query(scansRef, where('siteId', '==', siteId));
  const querySnapshot = await getDocs(q);
  
  const scans: Scan[] = [];
  querySnapshot.forEach((doc) => {
    scans.push({ id: doc.id, ...doc.data() } as Scan);
  });
  
  return scans;
};

// Métodos para logs
export const addLog = async (logData: Omit<Log, 'id' | 'timestamp'>) => {
  const logsRef = collection(db, 'logs');
  
  const docRef = await addDoc(logsRef, {
    ...logData,
    timestamp: serverTimestamp(),
  });
  
  return docRef.id;
}; 