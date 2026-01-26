import { db } from './config'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
  type CollectionReference,
  type DocumentReference,
  type UpdateData
} from 'firebase/firestore'

// Types
export interface ReadingSession {
  id?: string
  date: Timestamp
  startTime: Timestamp
  endTime: Timestamp
  duration: number // minutes
  bookId?: string
  createdAt?: Timestamp
}

export interface Book {
  id?: string
  title: string
  author: string
  coverImage?: string
  status: 'reading' | 'completed' | 'wantToRead'
  startDate?: Timestamp
  completedDate?: Timestamp
  createdAt?: Timestamp
}

export interface Goal {
  id?: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  targetMinutes: number
  year?: number
  month?: number
  week?: number
}

export interface UserSettings {
  reminderEnabled: boolean
  reminderTime: string // HH:mm format
  notificationPermission?: 'granted' | 'denied' | 'default'
}

// Helper to get user's collection path
const getUserCollection = (userId: string, collectionName: string): CollectionReference<DocumentData> => {
  return collection(db, `users/${userId}/${collectionName}`)
}

// Reading Sessions
export const getReadingSessions = async (userId: string): Promise<ReadingSession[]> => {
  const sessionsRef = getUserCollection(userId, 'readingSessions')
  const q = query(sessionsRef, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingSession))
}

export const addReadingSession = async (userId: string, sessionData: Omit<ReadingSession, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
  const sessionsRef = getUserCollection(userId, 'readingSessions')
  return await addDoc(sessionsRef, {
    ...sessionData,
    createdAt: Timestamp.now()
  })
}

export const updateReadingSession = async (userId: string, sessionId: string, updates: UpdateData<ReadingSession>): Promise<void> => {
  const sessionRef = doc(db, `users/${userId}/readingSessions/${sessionId}`)
  return await updateDoc(sessionRef, updates)
}

export const deleteReadingSession = async (userId: string, sessionId: string): Promise<void> => {
  const sessionRef = doc(db, `users/${userId}/readingSessions/${sessionId}`)
  return await deleteDoc(sessionRef)
}

// Books
export const getBooks = async (userId: string): Promise<Book[]> => {
  const booksRef = getUserCollection(userId, 'books')
  const q = query(booksRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book))
}

export const addBook = async (userId: string, bookData: Omit<Book, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
  const booksRef = getUserCollection(userId, 'books')
  return await addDoc(booksRef, {
    ...bookData,
    createdAt: Timestamp.now()
  })
}

export const updateBook = async (userId: string, bookId: string, updates: UpdateData<Book>): Promise<void> => {
  const bookRef = doc(db, `users/${userId}/books/${bookId}`)
  return await updateDoc(bookRef, updates)
}

export const deleteBook = async (userId: string, bookId: string): Promise<void> => {
  const bookRef = doc(db, `users/${userId}/books/${bookId}`)
  return await deleteDoc(bookRef)
}

// Goals
export const getGoals = async (userId: string): Promise<Goal[]> => {
  const goalsRef = getUserCollection(userId, 'goals')
  const snapshot = await getDocs(goalsRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal))
}

export const addGoal = async (userId: string, goalData: Omit<Goal, 'id'>): Promise<DocumentReference<DocumentData>> => {
  const goalsRef = getUserCollection(userId, 'goals')
  return await addDoc(goalsRef, goalData)
}

export const updateGoal = async (userId: string, goalId: string, updates: UpdateData<Goal>): Promise<void> => {
  const goalRef = doc(db, `users/${userId}/goals/${goalId}`)
  return await updateDoc(goalRef, updates)
}

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  const goalRef = doc(db, `users/${userId}/goals/${goalId}`)
  return await deleteDoc(goalRef)
}

// Settings
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const settingsRef = doc(db, `users/${userId}/settings/user`)
  const snapshot = await getDoc(settingsRef)
  if (snapshot.exists()) {
    return snapshot.data() as UserSettings
  }
  return null
}

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>): Promise<void> => {
  const settingsRef = doc(db, `users/${userId}/settings/user`)
  return await updateDoc(settingsRef, settings)
}
