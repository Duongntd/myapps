import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { getBooks, addBook, updateBook, deleteBook, type Book } from '@/firebase/firestore'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export const useBooksStore = defineStore('books', () => {
  const books: Ref<Book[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchBooks = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    loading.value = true
    error.value = null
    try {
      books.value = await getBooks(authStore.user.uid)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load books'
      error.value = errorMessage
      console.error('Error fetching books:', err)
    } finally {
      loading.value = false
    }
  }

  const createBook = async (bookData: Omit<Book, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData>> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      const docRef = await addBook(authStore.user.uid, bookData)
      await fetchBooks() // Refresh list
      return docRef
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create book'
      error.value = errorMessage
      console.error('Error creating book:', err)
      throw err
    }
  }

  const updateBookData = async (bookId: string, updates: Partial<Book>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      await updateBook(authStore.user.uid, bookId, updates)
      await fetchBooks() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update book'
      error.value = errorMessage
      console.error('Error updating book:', err)
      throw err
    }
  }

  const removeBook = async (bookId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('User not authenticated')

    error.value = null
    try {
      await deleteBook(authStore.user.uid, bookId)
      await fetchBooks() // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete book'
      error.value = errorMessage
      console.error('Error deleting book:', err)
      throw err
    }
  }

  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBookData,
    removeBook
  }
})
