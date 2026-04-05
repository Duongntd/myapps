<template>
  <div>
    <div v-if="store.loading" class="flex items-center justify-center py-16">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else class="flex gap-4 overflow-x-auto pb-4 min-h-[400px] items-start">
      <div
        v-for="col in columns"
        :key="col.status"
        class="flex-shrink-0 w-72 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-2"
      >
        <!-- Column header -->
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="col.dotClass"></span>
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ col.label }}</h3>
            <span class="text-xs text-gray-400 dark:text-gray-600 font-medium tabular-nums">({{ tasksByStatus(col.status).length }})</span>
          </div>
          <button
            v-if="col.status !== 'done'"
            class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-lg leading-none font-light"
            title="Add task"
            @click="addTask(col.status)"
          >+</button>
        </div>

        <!-- Cards -->
        <BoardCard
          v-for="task in tasksByStatus(col.status)"
          :key="task.id"
          :task="task"
          @delete="(id) => store.deleteTask(id)"
          @priorityChange="(id, p) => store.changePriority(id, p)"
          @update="(t) => store.updateTask(t)"
        />

        <!-- Empty state -->
        <div
          v-if="tasksByStatus(col.status).length === 0"
          class="text-xs text-center text-gray-400 dark:text-gray-600 py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
        >
          No tasks
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskListStore } from '@/stores/taskList'
import BoardCard from '@/components/TaskList/BoardCard.vue'
import type { TaskStatus } from './types'

const store = useTaskListStore()

const columns: { status: TaskStatus; label: string; dotClass: string }[] = [
  { status: 'todo', label: 'To Do', dotClass: 'bg-gray-400' },
  { status: 'inprogress', label: 'In Progress', dotClass: 'bg-blue-500' },
  { status: 'onhold', label: 'On Hold', dotClass: 'bg-orange-500' },
  { status: 'done', label: 'Done', dotClass: 'bg-green-500' },
]


function tasksByStatus(status: string) {
  return store.tasksForStatus(status)
}

async function addTask(status: TaskStatus) {
  const task = await store.addTask(store.todayStr())
  await store.changeStatus(task.id, status)
}
</script>
