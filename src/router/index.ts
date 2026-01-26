import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import ReadTrackerLayout from '@/views/ReadTracker/ReadTrackerLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/read-tracker',
    component: ReadTrackerLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'read-tracker',
        redirect: '/read-tracker/dashboard'
      },
      {
        path: 'dashboard',
        name: 'read-tracker-dashboard',
        component: () => import('@/views/ReadTracker/Dashboard.vue')
      },
      {
        path: 'sessions',
        name: 'read-tracker-sessions',
        component: () => import('@/views/ReadTracker/ReadingSessions.vue')
      },
      {
        path: 'books',
        name: 'read-tracker-books',
        component: () => import('@/views/ReadTracker/Books.vue')
      },
      {
        path: 'goals',
        name: 'read-tracker-goals',
        component: () => import('@/views/ReadTracker/Goals.vue')
      },
      {
        path: 'settings',
        name: 'read-tracker-settings',
        component: () => import('@/views/ReadTracker/Settings.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.loading) {
    // Wait a bit for auth to initialize
    const checkAuth = () => {
      if (!authStore.loading) {
        if (to.meta.requiresAuth && !authStore.isAuthenticated) {
          next({ name: 'home' })
        } else {
          next()
        }
      } else {
        setTimeout(checkAuth, 100)
      }
    }
    checkAuth()
  } else {
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'home' })
    } else {
      next()
    }
  }
})

export default router
