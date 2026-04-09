<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow">
    <!-- Header: priority dot + title + delete -->
    <div class="flex items-start gap-1.5">
      <span
        class="w-2 h-2 rounded-full flex-shrink-0 mt-1 cursor-pointer hover:scale-125 transition-transform"
        :class="getPriorityDotClass(task.priority)"
        :title="'Priority: ' + task.priority"
        @click="cyclePriority"
      ></span>
      <span
        ref="titleEl"
        class="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug cursor-text rounded px-1 -mx-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-2 focus:outline-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-colors"
        :class="{ 'line-through opacity-60': task.status === 'done' }"
        contenteditable="true"
        spellcheck="false"
        v-text="task.title"
        @blur="onTitleBlur"
        @keydown.enter.prevent="($event.target as HTMLElement).blur()"
        @keydown.escape="onTitleEscape"
      ></span>
      <button
        class="text-transparent hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none -mt-0.5 ml-1"
        title="Delete"
        @click="emit('delete', task.id)"
      >&times;</button>
    </div>

    <!-- Description -->
    <div
      v-if="task.description || editingDesc"
      ref="descEl"
      class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-text rounded px-1 -mx-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-2 focus:outline-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-colors leading-relaxed"
      contenteditable="true"
      spellcheck="false"
      v-text="task.description"
      @blur="onDescBlur"
      @keydown.enter.prevent="($event.target as HTMLElement).blur()"
      @keydown.escape="onDescEscape"
      @focus="editingDesc = true"
    ></div>
    <button
      v-else
      class="mt-1 text-xs text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
      @click="focusDesc"
    >+ add note</button>

    <!-- Footer -->
    <div class="mt-2 flex items-center justify-between gap-1 flex-wrap">
      <!-- Source badge -->
      <span
        v-if="task.source"
        class="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold"
        :class="getSourceBadgeClass(task.source!)"
      >{{ task.source }}</span>

      <!-- Category badge -->
      <span
        v-if="task.category"
        class="inline-flex rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
      >{{ task.category }}</span>

      <!-- Date -->
      <span class="ml-auto text-[0.6rem] text-gray-400 dark:text-gray-600 tabular-nums">{{ task.date }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Task, TaskPriority } from '@/views/TaskList/types'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{
  delete: [taskId: string]
  priorityChange: [taskId: string, priority: TaskPriority]
  update: [task: Task]
}>()

const titleEl = ref<HTMLElement>()
const descEl = ref<HTMLElement>()
const editingDesc = ref(false)

const priorityDotClass: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-gray-300 dark:bg-gray-600',
}

const sourceBadgeClass: Record<string, string> = {
  evelynn: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  duong: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
}

function getSourceBadgeClass(source: string): string {
  return sourceBadgeClass[source] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}

function getPriorityDotClass(priority: string): string {
  return priorityDotClass[priority] ?? 'bg-gray-300'
}

function cyclePriority() {
  const order: TaskPriority[] = ['low', 'medium', 'high']
  const idx = order.indexOf(props.task.priority)
  emit('priorityChange', props.task.id, order[(idx + 1) % order.length])
}

function onTitleBlur(e: FocusEvent) {
  const el = e.target as HTMLElement
  const newTitle = el.textContent?.trim() || ''
  if (newTitle !== props.task.title) {
    emit('update', { ...props.task, title: newTitle })
  }
}

function onTitleEscape(e: KeyboardEvent) {
  const el = e.target as HTMLElement
  el.textContent = props.task.title
  el.blur()
}

function onDescBlur(e: FocusEvent) {
  editingDesc.value = false
  const el = e.target as HTMLElement
  const newDesc = el.textContent?.trim() || ''
  if (newDesc !== props.task.description) {
    emit('update', { ...props.task, description: newDesc })
  }
}

function onDescEscape(e: KeyboardEvent) {
  editingDesc.value = false
  const el = e.target as HTMLElement
  el.textContent = props.task.description
  el.blur()
}

function focusDesc() {
  editingDesc.value = true
  setTimeout(() => descEl.value?.focus(), 0)
}
</script>
