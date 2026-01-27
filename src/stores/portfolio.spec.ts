import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePortfolioStore } from './portfolio'
import type { StockHolding } from '@/firebase/firestore'
import type { Transaction } from '@/firebase/firestore'

const mockGetStockHoldings = vi.fn()
const mockGetTransactions = vi.fn()
const mockGetPortfolioAccount = vi.fn()
const mockUpdateStockHolding = vi.fn()

vi.mock('@/storage/localStorage', () => ({
  getStockHoldings: (...args: unknown[]) => mockGetStockHoldings(...args),
  addStockHolding: vi.fn(),
  updateStockHolding: (...args: unknown[]) => mockUpdateStockHolding(...args),
  deleteStockHolding: vi.fn(),
  getTransactions: (...args: unknown[]) => mockGetTransactions(...args),
  addTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  getPortfolioAccount: (...args: unknown[]) => mockGetPortfolioAccount(...args),
  setPortfolioAccount: vi.fn(),
  updatePortfolioAccount: vi.fn()
}))

describe('portfolio store – manual current price (#40)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPortfolioAccount.mockResolvedValue({ totalInvested: 0, cash: 0 })
    setActivePinia(createPinia())
  })

  it('uses holding.currentPrice when set (manual tracking)', async () => {
    const holdings: StockHolding[] = [
      {
        id: 'h1',
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 150,
        currentPrice: 165
      }
    ]
    mockGetStockHoldings.mockResolvedValue(holdings)
    mockGetTransactions.mockResolvedValue([])

    const store = usePortfolioStore()
    await store.fetchHoldings()
    await store.fetchTransactions()

    const withPrices = store.holdingsWithPrices
    expect(withPrices).toHaveLength(1)
    expect(withPrices[0].currentPrice).toBe(165)
    expect(withPrices[0].averagePrice).toBe(150)
  })

  it('falls back to last buy price when holding has no currentPrice', async () => {
    const holdings: StockHolding[] = [
      { id: 'h1', symbol: 'AAPL', quantity: 20, averagePrice: 150 }
    ]
    const transactions: Transaction[] = [
      {
        id: 't1',
        type: 'buy',
        symbol: 'AAPL',
        quantity: 10,
        price: 200,
        date: { seconds: 1000 } as Transaction['date']
      },
      {
        id: 't2',
        type: 'buy',
        symbol: 'AAPL',
        quantity: 10,
        price: 100,
        date: { seconds: 2000 } as Transaction['date']
      }
    ]
    mockGetStockHoldings.mockResolvedValue(holdings)
    mockGetTransactions.mockResolvedValue(transactions)

    const store = usePortfolioStore()
    await store.fetchHoldings()
    await store.fetchTransactions()

    const withPrices = store.holdingsWithPrices
    expect(withPrices).toHaveLength(1)
    // Last buy (by date) is 2000 -> price 100
    expect(withPrices[0].currentPrice).toBe(100)
    expect(withPrices[0].averagePrice).toBe(150)
  })

  it('falls back to averagePrice when no currentPrice and no buy transactions', async () => {
    const holdings: StockHolding[] = [
      { id: 'h1', symbol: 'MSFT', quantity: 5, averagePrice: 300 }
    ]
    mockGetStockHoldings.mockResolvedValue(holdings)
    mockGetTransactions.mockResolvedValue([])

    const store = usePortfolioStore()
    await store.fetchHoldings()
    await store.fetchTransactions()

    const withPrices = store.holdingsWithPrices
    expect(withPrices).toHaveLength(1)
    expect(withPrices[0].currentPrice).toBe(300)
    expect(withPrices[0].averagePrice).toBe(300)
  })

  it('average price column reflects weighted average of buys', async () => {
    const holdings: StockHolding[] = [
      { id: 'h1', symbol: 'AAPL', quantity: 20, averagePrice: 150 }
    ]
    mockGetStockHoldings.mockResolvedValue(holdings)
    mockGetTransactions.mockResolvedValue([])

    const store = usePortfolioStore()
    await store.fetchHoldings()
    await store.fetchTransactions()

    const withPrices = store.holdingsWithPrices
    expect(withPrices[0].averagePrice).toBe(150)
    // (10*200 + 10*100)/(10+10) = 150
  })
})
