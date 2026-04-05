import { test, expect } from '@playwright/test'

const LOCAL_STORAGE_KEY = 'taskList_tasks'

function todayStr(): string {
  const d = new Date()
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

test.describe('Task List — local mode', () => {
  test.beforeEach(async ({ page }) => {
    // Seed empty task list in local storage and navigate
    await page.addInitScript(({ key }) => {
      localStorage.setItem(key, JSON.stringify([]))
    }, { key: LOCAL_STORAGE_KEY })

    await page.goto('/task-list/dashboard')
    await expect(page.locator('.day-column').first()).toBeVisible({ timeout: 10000 })
  })

  test('adds a task to today\'s column', async ({ page }) => {
    // Find today's column by data-date attribute
    const today = todayStr()
    const todayColumn = page.locator(`.day-column[data-date="${today}"]`)
    await expect(todayColumn).toBeVisible()

    // Click the "+ Add" button in today's column
    await todayColumn.getByText('+ Add').click()

    // A new task card should appear with default title "New task"
    await expect(todayColumn.locator('.task-card')).toBeVisible({ timeout: 5000 })
    await expect(todayColumn.locator('.task-card').first()).toContainText('New task')
  })

  test('edits a task title inline', async ({ page }) => {
    const today = todayStr()
    const todayColumn = page.locator(`.day-column[data-date="${today}"]`)

    // Add a task
    await todayColumn.getByText('+ Add').click()
    const taskCard = todayColumn.locator('.task-card').first()
    await expect(taskCard).toBeVisible({ timeout: 5000 })

    // Click the title to edit it
    const titleEl = taskCard.locator('[contenteditable="true"]').first()
    await titleEl.click()
    await titleEl.selectText()
    await titleEl.fill('My edited task')
    await titleEl.press('Enter')

    // Verify new title appears
    await expect(taskCard).toContainText('My edited task')
  })

  test('changes status to In Progress', async ({ page }) => {
    const today = todayStr()
    const todayColumn = page.locator(`.day-column[data-date="${today}"]`)

    // Add a task
    await todayColumn.getByText('+ Add').click()
    const taskCard = todayColumn.locator('.task-card').first()
    await expect(taskCard).toBeVisible({ timeout: 5000 })

    // Click the status badge (shows "To Do" by default)
    await taskCard.locator('button').filter({ hasText: /to do/i }).click()

    // Click "In Progress" in the dropdown
    await page.locator('.task-card .absolute').filter({ hasText: /in progress/i }).getByText(/in progress/i).click()

    // Status badge should now show "In Progress"
    await expect(taskCard.locator('button').filter({ hasText: /in progress/i })).toBeVisible()
  })

  test('deletes a task and undo toast appears, then undoes deletion', async ({ page }) => {
    const today = todayStr()
    const todayColumn = page.locator(`.day-column[data-date="${today}"]`)

    // Add a task
    await todayColumn.getByText('+ Add').click()
    const taskCard = todayColumn.locator('.task-card').first()
    await expect(taskCard).toBeVisible({ timeout: 5000 })

    // Hover to reveal delete button, then click it
    await taskCard.hover()
    await taskCard.locator('button[title="Delete"]').click()

    // Undo toast should appear
    const undoToast = page.locator('body').locator('div').filter({ hasText: /deleted/i }).filter({ hasText: /undo/i }).first()
    await expect(undoToast).toBeVisible({ timeout: 3000 })

    // Click Undo
    await undoToast.getByRole('button', { name: /undo/i }).click()

    // Toast should disappear
    await expect(undoToast).not.toBeVisible({ timeout: 3000 })

    // Task should be restored
    await expect(todayColumn.locator('.task-card').first()).toBeVisible()
  })
})
