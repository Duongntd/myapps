import { test, expect } from '@playwright/test'

test.describe('Read Tracker functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('Sessions: shows title, Add Session button, and list or empty state', async ({ page }) => {
    await page.goto('/read-tracker/sessions')
    await expect(page.getByText(/Reading Sessions/)).toBeVisible()
    await expect(page.getByRole('button', { name: /add session/i })).toBeVisible()
    await expect(
      page.getByText(/Session History|No reading sessions yet|Today's Reading Time/i)
    ).toBeVisible()
  })

  test('Books: shows title, Add Book button, and list or empty state', async ({ page }) => {
    await page.goto('/read-tracker/books')
    await expect(page.getByText(/My Books/)).toBeVisible()
    await expect(page.getByRole('button', { name: /add book/i })).toBeVisible()
    await expect(
      page.getByText(/All|Reading|Completed|Want to Read|No books/i)
    ).toBeVisible()
  })

  test('Goals: shows title, Add Goal / Create Goal, and goals section', async ({ page }) => {
    await page.goto('/read-tracker/goals')
    await expect(page.getByText(/Reading Goals/)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /add goal|create goal|create your first goal/i })
    ).toBeVisible()
    await expect(
      page.getByText(/Active Goals|No active goals|Set a reading goal/i)
    ).toBeVisible()
  })

  test('Dashboard: shows dashboard content and period selector', async ({ page }) => {
    await page.goto('/read-tracker/dashboard')
    await expect(page.getByText(/Track your reading time/)).toBeVisible()
    await expect(
      page.getByText(/Today|Week|Month|Streak|Reading time|sessions/i)
    ).toBeVisible()
  })
})
