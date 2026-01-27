import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import ReadTrackerLayout from '@/views/ReadTracker/ReadTrackerLayout.vue'
import PortfolioTrackerLayout from '@/views/PortfolioTracker/PortfolioTrackerLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
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
  },
  {
    path: '/portfolio-tracker',
    component: PortfolioTrackerLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'portfolio-tracker',
        redirect: '/portfolio-tracker/dashboard'
      },
      {
        path: 'dashboard',
        name: 'portfolio-tracker-dashboard',
        component: () => import('@/views/PortfolioTracker/Dashboard.vue')
      },
      {
        path: 'transactions',
        name: 'portfolio-tracker-transactions',
        component: () => import('@/views/PortfolioTracker/Transactions.vue')
      },
      {
        path: 'settings',
        name: 'portfolio-tracker-settings',
        component: () => import('@/views/PortfolioTracker/Settings.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.loading) {
    // Wait a bit for auth to initialize
    const checkAuth = () => {
      if (!authStore.loading) {
        // Allow access if authenticated OR in local mode
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
    // Allow access if authenticated OR in local mode
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'home' })
    } else {
      next()
    }
  }
})

export default router
