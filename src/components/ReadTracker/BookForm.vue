<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900">
          {{ editingBook ? 'Edit Book' : 'Add Book' }}
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors p-1 touch-manipulation"
          aria-label="Close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter book title"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
        </div>

        <!-- Author -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Author <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.author"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter author name"
          />
          <p v-if="errors.author" class="mt-1 text-sm text-red-600">{{ errors.author }}</p>
        </div>

        <!-- Cover Image URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Cover Image URL (Optional)
          </label>
          <input
            v-model="formData.coverImage"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com/book-cover.jpg"
          />
          <p class="mt-1 text-xs text-gray-500">You can add a cover image URL or leave it blank</p>
          <div v-if="formData.coverImage" class="mt-3">
            <img
              :src="formData.coverImage"
              alt="Book cover preview"
              class="w-32 h-48 object-cover rounded border border-gray-200"
              @error="formData.coverImage = ''"
            />
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.status"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="wantToRead">Want to Read</option>
            <option value="reading">Currently Reading</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <!-- Start Date (if reading or completed) -->
        <div v-if="formData.status === 'reading' || formData.status === 'completed'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Start Date (Optional)
          </label>
          <input
            v-model="formData.startDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Completed Date (if completed) -->
        <div v-if="formData.status === 'completed'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Completed Date (Optional)
          </label>
          <input
            v-model="formData.completedDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{{ submitError }}</p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {{ loading ? 'Saving...' : (editingBook ? 'Update Book' : 'Add Book') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBooksStore } from '@/stores/books'
import type { Book } from '@/firebase/firestore'
import { Timestamp } from 'firebase/firestore'
import { format } from 'date-fns'

interface Props {
  book?: Book | null
}

const props = withDefaults(defineProps<Props>(), {
  book: null
})

const emit = defineEmits<{
  close: []
  save: []
}>()

const booksStore = useBooksStore()

const loading = ref(false)
const submitError = ref('')
const errors = ref<Record<string, string>>({})

const editingBook = computed(() => props.book)

// Form data
const formData = ref({
  title: '',
  author: '',
  coverImage: '',
  status: 'wantToRead' as 'reading' | 'completed' | 'wantToRead',
  startDate: '',
  completedDate: ''
})

// Initialize form with book data if editing
onMounted(() => {
  if (editingBook.value) {
    const book = editingBook.value
    formData.value.title = book.title
    formData.value.author = book.author
    formData.value.coverImage = book.coverImage || ''
    formData.value.status = book.status
    if (book.startDate) {
      formData.value.startDate = format(book.startDate.toDate(), 'yyyy-MM-dd')
    }
    if (book.completedDate) {
      formData.value.completedDate = format(book.completedDate.toDate(), 'yyyy-MM-dd')
    }
  }
})

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Title is required'
  }

  if (!formData.value.author.trim()) {
    errors.value.author = 'Author is required'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  submitError.value = ''

  try {
    const bookData: Omit<Book, 'id' | 'createdAt'> = {
      title: formData.value.title.trim(),
      author: formData.value.author.trim(),
      status: formData.value.status,
      ...(formData.value.coverImage && { coverImage: formData.value.coverImage.trim() }),
      ...(formData.value.startDate && { startDate: Timestamp.fromDate(new Date(formData.value.startDate)) }),
      ...(formData.value.completedDate && { completedDate: Timestamp.fromDate(new Date(formData.value.completedDate)) })
    }

    if (editingBook.value?.id) {
      await booksStore.updateBookData(editingBook.value.id, bookData)
    } else {
      await booksStore.createBook(bookData)
    }

    emit('save')
  } catch (error) {
    console.error('Error saving book:', error)
    submitError.value = 'Failed to save book. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
