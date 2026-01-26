import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { getBooks, addBook, updateBook, deleteBook, type Book } from '@/firebase/firestore'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export const useBooksStore = defineStore('books', () => {
  const books: Ref<Book[]> = ref([])
  const loading: Ref<boolean> = ref(false)

  const fetchBooks = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    try {
      books.value = await getBooks(authStore.user.uid)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      loading.value = false
    }
  }

  const createBook = async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      const docRef = await addBook(authStore.user.uid, bookData)
      await fetchBooks() // Refresh list
      return docRef
    } catch (error) {
      console.error('Error creating book:', error)
      throw error
    }
  }

  const updateBookData = async (bookId: string, updates: Partial<Book>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      await updateBook(authStore.user.uid, bookId, updates)
      await fetchBooks() // Refresh list
    } catch (error) {
      console.error('Error updating book:', error)
      throw error
    }
  }

  const removeBook = async (bookId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      await deleteBook(authStore.user.uid, bookId)
      await fetchBooks() // Refresh list
    } catch (error) {
      console.error('Error deleting book:', error)
      throw error
    }
  }

  return {
    books,
    loading,
    fetchBooks,
    createBook,
    updateBookData,
    removeBook
  }
})
