import { describe, it, expect, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { render } from '@testing-library/vue'
import { setActivePinia, createPinia } from 'pinia'
import router from '@/router'
import i18n from '@/i18n'
import { usePortfolioStore } from '@/stores/portfolio'
import Dashboard from './Dashboard.vue'

vi.mock('@/utils/stockPrice', () => ({
  getMultipleStockPrices: vi.fn().mockResolvedValue(new Map())
}))

describe('Portfolio Tracker Dashboard', () => {
  it('holdings table shows Average price and Current price columns when holdings exist', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = usePortfolioStore()
    store.holdings = [
      {
        id: '1',
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 150
      }
    ] as typeof store.holdings
    store.loading = false
    store.account = { totalInvested: 1000, cash: 500 }
    vi.spyOn(store, 'fetchHoldings').mockResolvedValue()
    vi.spyOn(store, 'fetchTransactions').mockResolvedValue()
    vi.spyOn(store, 'fetchAccount').mockResolvedValue()

    const { getByRole } = render(Dashboard, {
      global: { plugins: [pinia, router, i18n] }
    })

    await flushPromises()

    expect(getByRole('columnheader', { name: /average price/i })).toBeTruthy()
    expect(getByRole('columnheader', { name: /current price/i })).toBeTruthy()
  })
})
