import { db } from './config'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
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

export interface StockHolding {
  id?: string
  symbol: string
  quantity: number
  averagePrice: number // Average purchase price per share (weighted average of buys)
  currentPrice?: number // Manual/last-known price per share; default is last buy price
  /** Broker/source where the holding was bought (e.g. Trading 212, Interactive Broker). Empty = legacy/unset. */
  source?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Transaction {
  id?: string
  type: 'buy' | 'sell'
  symbol: string
  quantity: number
  price: number // Price per share at transaction time
  date: Timestamp
  /** Broker/source where the transaction was made (e.g. Trading 212, Interactive Broker). Empty = legacy/unset. */
  source?: string
  createdAt?: Timestamp
}

export interface PortfolioAccount {
  id?: string
  totalInvested: number // Total money deposited/invested
  cash: number // Available cash
  updatedAt?: Timestamp
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

// Stock Holdings
export const getStockHoldings = async (userId: string): Promise<StockHolding[]> => {
  const holdingsRef = getUserCollection(userId, 'stockHoldings')
  const snapshot = await getDocs(holdingsRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockHolding))
}

export const addStockHolding = async (userId: string, holdingData: Omit<StockHolding, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentReference<DocumentData>> => {
  const holdingsRef = getUserCollection(userId, 'stockHoldings')
  return await addDoc(holdingsRef, {
    ...holdingData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
}

export const updateStockHolding = async (userId: string, holdingId: string, updates: UpdateData<StockHolding>): Promise<void> => {
  const holdingRef = doc(db, `users/${userId}/stockHoldings/${holdingId}`)
  return await updateDoc(holdingRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

export const deleteStockHolding = async (userId: string, holdingId: string): Promise<void> => {
  const holdingRef = doc(db, `users/${userId}/stockHoldings/${holdingId}`)
  return await deleteDoc(holdingRef)
}

// Transactions
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const transactionsRef = getUserCollection(userId, 'transactions')
  const q = query(transactionsRef, orderBy('date', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
}

export const addTransaction = async (userId: string, transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
  const transactionsRef = getUserCollection(userId, 'transactions')
  return await addDoc(transactionsRef, {
    ...transactionData,
    createdAt: Timestamp.now()
  })
}

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`)
  return await deleteDoc(transactionRef)
}

// Portfolio Account
export const getPortfolioAccount = async (userId: string): Promise<PortfolioAccount | null> => {
  const accountRef = doc(db, `users/${userId}/portfolioAccount/account`)
  const accountSnap = await getDoc(accountRef)
  if (accountSnap.exists()) {
    return { id: accountSnap.id, ...accountSnap.data() } as PortfolioAccount
  }
  return null
}

export const setPortfolioAccount = async (userId: string, accountData: Omit<PortfolioAccount, 'id' | 'updatedAt'>): Promise<void> => {
  const accountRef = doc(db, `users/${userId}/portfolioAccount/account`)
  await setDoc(accountRef, {
    ...accountData,
    updatedAt: Timestamp.now()
  }, { merge: true })
}

export const updatePortfolioAccount = async (userId: string, updates: UpdateData<PortfolioAccount>): Promise<void> => {
  const accountRef = doc(db, `users/${userId}/portfolioAccount/account`)
  return await updateDoc(accountRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}
