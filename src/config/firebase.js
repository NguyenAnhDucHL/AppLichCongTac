// Firebase configuration file
// Config từ Web App trong Firebase Console

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7G9QsF3y0ENHZGCbBKPeSjWdO_wYQ69Q",
  authDomain: "applichcongtac.firebaseapp.com",
  projectId: "applichcongtac",
  storageBucket: "applichcongtac.firebasestorage.app",
  messagingSenderId: "994548367594",
  appId: "1:994548367594:web:423fbd3beae1cd9b095793",
  measurementId: "G-WKZE34VXVB" // Optional: chỉ cần nếu dùng Analytics
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export default app;
