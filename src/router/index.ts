import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import ReadTrackerLayout from '@/views/ReadTracker/ReadTrackerLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/read-tracker',
    component: ReadTrackerLayout,
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

export default router
