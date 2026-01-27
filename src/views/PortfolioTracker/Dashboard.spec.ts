import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import Dashboard from './Dashboard.vue'

const mockFetchHoldings = vi.fn()
const mockFetchTransactions = vi.fn()
const mockFetchAccount = vi.fn()

vi.mock('@/stores/portfolio', () => ({
  usePortfolioStore: () => ({
    holdings: [],
    holdingsWithPrices: [],
    totalCash: 5000,
    totalPortfolioValue: 5000,
    totalInvested: 0,
    loading: false,
    fetchHoldings: mockFetchHoldings,
    fetchTransactions: mockFetchTransactions,
    fetchAccount: mockFetchAccount,
    updateStockPrice: vi.fn()
  })
}))

vi.mock('@/utils/stockPrice', () => ({
  getMultipleStockPrices: vi.fn().mockResolvedValue([])
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows My Holdings section', async () => {
    const { findByRole } = renderWithProviders(Dashboard)
    const heading = await findByRole('heading', { name: 'My Holdings' })
    expect(heading).toBeDefined()
  })

  it('displays CASH as a row in My Holdings when totalCash > 0 (#43)', async () => {
    const { findByText } = renderWithProviders(Dashboard)
    const cashCell = await findByText('CASH')
    expect(cashCell).toBeDefined()
  })
})
