import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// TODO: Replace with your Firebase config
// Get this from Firebase Console > Project Settings > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyDU4QDnMs8zGjuKggLQB832Md5zc1_-j-E",
  authDomain: "myapps-b31ea.firebaseapp.com",
  projectId: "myapps-b31ea",
  storageBucket: "myapps-b31ea.firebasestorage.app",
  messagingSenderId: "80930027719",
  appId: "1:80930027719:web:4cb2b93280d6f8737126e2",
  measurementId: "G-9YXBF1WJY3"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)

export default app
