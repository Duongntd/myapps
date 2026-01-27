import { test, expect } from '@playwright/test'

test.describe('Portfolio Tracker functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('Dashboard: shows portfolio dashboard and holdings section', async ({ page }) => {
    await page.goto('/portfolio-tracker/dashboard')
    await expect(page.getByText(/Manage your stock portfolio/)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'My Holdings' })).toBeVisible()
  })

  test('Transactions: shows title, Add Transaction, and list or empty state', async ({ page }) => {
    await page.goto('/portfolio-tracker/transactions')
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
    await expect(page.getByRole('button', { name: /add transaction/i })).toBeVisible()
    await expect(page.getByText(/No transactions|Transaction Type|Buy|Sell/i).first()).toBeVisible()
  })
})
