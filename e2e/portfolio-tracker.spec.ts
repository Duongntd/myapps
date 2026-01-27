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

  test('Transactions: add transaction with source and filter by source', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.getByRole('button', { name: /open app/i }).nth(1).click()
    await expect(page).toHaveURL(/\/portfolio-tracker/)
    await page.goto('/portfolio-tracker/transactions')
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
    await page.getByRole('button', { name: /add transaction/i }).click()

    await expect(page.getByRole('heading', { name: /add transaction/i })).toBeVisible()
    await page.getByLabel(/symbol/i).fill('AAPL')
    await page.getByLabel(/quantity/i).fill('10')
    await page.getByLabel(/price per share/i).fill('150')
    const sourceInput = page.getByLabel(/source|broker/i)
    await sourceInput.fill('Trading 212')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText('Trading 212')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('AAPL')).toBeVisible()

    const filterSelect = page.getByRole('combobox', { name: /filter by source/i })
    await expect(filterSelect).toBeVisible()
    await filterSelect.selectOption('Trading 212')
    await expect(page.getByText('Trading 212')).toBeVisible()
    await expect(page.getByText('AAPL')).toBeVisible()
  })
})
