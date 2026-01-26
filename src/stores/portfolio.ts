import { defineStore } from 'pinia'
import { ref, computed, type Ref } from 'vue'
import { 
  getStockHoldings as getHoldingsFirebase, 
  addStockHolding as addHoldingFirebase, 
  updateStockHolding as updateHoldingFirebase, 
  deleteStockHolding as deleteHoldingFirebase,
  getTransactions as getTransactionsFirebase,
  addTransaction as addTransactionFirebase,
  deleteTransaction as deleteTransactionFirebase,
  getPortfolioAccount as getAccountFirebase,
  setPortfolioAccount as setAccountFirebase,
  updatePortfolioAccount as updateAccountFirebase,
  type StockHolding,
  type Transaction,
  type PortfolioAccount
} from '@/firebase/firestore'
import { 
  getStockHoldings as getHoldingsLocal, 
  addStockHolding as addHoldingLocal, 
  updateStockHolding as updateHoldingLocal, 
  deleteStockHolding as deleteHoldingLocal,
  getTransactions as getTransactionsLocal,
  addTransaction as addTransactionLocal,
  deleteTransaction as deleteTransactionLocal,
  getPortfolioAccount as getAccountLocal,
  updatePortfolioAccount as updateAccountLocal
} from '@/storage/localStorage'
import { useAuthStore } from './auth'
import type { DocumentReference, DocumentData } from 'firebase/firestore'

export interface StockPrice {
  symbol: string
  price: number
  lastUpdated: Date
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const holdings: Ref<StockHolding[]> = ref([])
  const transactions: Ref<Transaction[]> = ref([])
  const stockPrices: Ref<Map<string, StockPrice>> = ref(new Map())
  const account: Ref<PortfolioAccount | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  // Computed: Total cash available
  const totalCash = computed<number>(() => {
    return account.value?.cash || 0
  })

  // Computed: Total invested money (deposits)
  const totalInvested = computed<number>(() => {
    return account.value?.totalInvested || 0
  })

  // Computed: Get holdings with current prices
  const holdingsWithPrices = computed(() => {
    return holdings.value.map(holding => {
      const priceData = stockPrices.value.get(holding.symbol.toUpperCase())
      const currentPrice = priceData?.price || 0
      const currentValue = currentPrice * holding.quantity
      const costBasis = holding.averagePrice * holding.quantity
      const nav = currentValue - costBasis

      return {
        ...holding,
        currentPrice,
        currentValue,
        costBasis,
        nav,
        navPercent: 0 // Will be calculated after portfolio value is known
      }
    })
  })

  // Computed: Total stock value (sum of all holdings' current value)
  const totalStockValue = computed<number>(() => {
    return holdingsWithPrices.value.reduce((sum: number, holding) => sum + holding.currentValue, 0)
  })

  // Computed: Total portfolio value = cash + stock value
  const totalPortfolioValue = computed<number>(() => {
    return totalCash.value + totalStockValue.value
  })

  // Computed: Holdings with NAV% calculated (needs portfolio value)
  const holdingsWithNAVPercent = computed(() => {
    const portfolioValue = totalPortfolioValue.value
    return holdingsWithPrices.value.map(holding => ({
      ...holding,
      // NAV% = (stock value / total portfolio value) * 100
      navPercent: portfolioValue > 0 ? (holding.currentValue / portfolioValue) * 100 : 0
    }))
  })

  // Computed: Total cost basis
  const totalCostBasis = computed<number>(() => {
    return holdings.value.reduce((sum: number, holding) => sum + (holding.averagePrice * holding.quantity), 0)
  })

  // Computed: Total NAV (stock value - cost basis)
  const totalNAV = computed<number>(() => {
    return totalStockValue.value - totalCostBasis.value
  })

  // Computed: NAV percentage = (stock value / total portfolio value) * 100
  const totalNAVPercent = computed<number>(() => {
    return totalPortfolioValue.value > 0 ? (totalStockValue.value / totalPortfolioValue.value) * 100 : 0
  })

  const fetchHoldings = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    loading.value = true
    error.value = null
    try {
      if (authStore.localMode) {
        holdings.value = await getHoldingsLocal()
      } else if (authStore.user) {
        holdings.value = await getHoldingsFirebase(authStore.user.uid)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load holdings'
      error.value = errorMessage
      console.error('Error fetching holdings:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTransactions = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    loading.value = true
    error.value = null
    try {
      if (authStore.localMode) {
        transactions.value = await getTransactionsLocal()
      } else if (authStore.user) {
        transactions.value = await getTransactionsFirebase(authStore.user.uid)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions'
      error.value = errorMessage
      console.error('Error fetching transactions:', err)
    } finally {
      loading.value = false
    }
  }

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<DocumentReference<DocumentData> | { id: string }> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('User not authenticated')

    error.value = null
    try {
      let docRef: DocumentReference<DocumentData> | { id: string }
      if (authStore.localMode) {
        docRef = await addTransactionLocal(transactionData)
      } else if (authStore.user) {
        docRef = await addTransactionFirebase(authStore.user.uid, transactionData)
      } else {
        throw new Error('User not authenticated')
      }

      // Update holdings based on transaction
      await processTransaction(transactionData)
      
      await fetchTransactions()
      await fetchHoldings()
      return docRef
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction'
      error.value = errorMessage
      console.error('Error creating transaction:', err)
      throw err
    }
  }

  const processTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('User not authenticated')

    const symbol = transactionData.symbol.toUpperCase()
    const existingHolding = holdings.value.find(h => h.symbol.toUpperCase() === symbol)

    if (transactionData.type === 'buy') {
      if (existingHolding) {
        // Update existing holding: recalculate average price
        const totalQuantity = existingHolding.quantity + transactionData.quantity
        const totalCost = (existingHolding.averagePrice * existingHolding.quantity) + (transactionData.price * transactionData.quantity)
        const newAveragePrice = totalCost / totalQuantity

        if (authStore.localMode) {
          await updateHoldingLocal(existingHolding.id!, {
            quantity: totalQuantity,
            averagePrice: newAveragePrice
          })
        } else if (authStore.user) {
          await updateHoldingFirebase(authStore.user.uid, existingHolding.id!, {
            quantity: totalQuantity,
            averagePrice: newAveragePrice
          })
        }
      } else {
        // Create new holding
        const newHolding: Omit<StockHolding, 'id' | 'createdAt' | 'updatedAt'> = {
          symbol: symbol,
          quantity: transactionData.quantity,
          averagePrice: transactionData.price
        }

        if (authStore.localMode) {
          await addHoldingLocal(newHolding)
        } else if (authStore.user) {
          await addHoldingFirebase(authStore.user.uid, newHolding)
        }
      }
    } else if (transactionData.type === 'sell') {
      if (!existingHolding) {
        throw new Error(`Cannot sell ${symbol}: No holdings found`)
      }
      if (existingHolding.quantity < transactionData.quantity) {
        throw new Error(`Cannot sell ${transactionData.quantity} shares: Only ${existingHolding.quantity} shares owned`)
      }

      const newQuantity = existingHolding.quantity - transactionData.quantity
      if (newQuantity === 0) {
        // Delete holding if quantity reaches zero
        if (authStore.localMode) {
          await deleteHoldingLocal(existingHolding.id!)
        } else if (authStore.user) {
          await deleteHoldingFirebase(authStore.user.uid, existingHolding.id!)
        }
      } else {
        // Update quantity (average price stays the same)
        if (authStore.localMode) {
          await updateHoldingLocal(existingHolding.id!, { quantity: newQuantity })
        } else if (authStore.user) {
          await updateHoldingFirebase(authStore.user.uid, existingHolding.id!, { quantity: newQuantity })
        }
      }
    }
  }

  const removeTransaction = async (transactionId: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('User not authenticated')

    error.value = null
    try {
      // Find transaction to reverse
      const transaction = transactions.value.find(t => t.id === transactionId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // Delete transaction
      if (authStore.localMode) {
        await deleteTransactionLocal(transactionId)
      } else if (authStore.user) {
        await deleteTransactionFirebase(authStore.user.uid, transactionId)
      }

      // Rebuild holdings from remaining transactions (excluding the deleted one)
      await rebuildHoldingsFromTransactions(transactionId)

      await fetchTransactions()
      await fetchHoldings()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction'
      error.value = errorMessage
      console.error('Error deleting transaction:', err)
      throw err
    }
  }

  const rebuildHoldingsFromTransactions = async (excludeTransactionId?: string): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    // Get all transactions except the excluded one
    const remainingTransactions = transactions.value.filter(t => t.id && t.id !== excludeTransactionId)

    // Clear all holdings
    for (const holding of holdings.value) {
      if (authStore.localMode) {
        await deleteHoldingLocal(holding.id!)
      } else if (authStore.user) {
        await deleteHoldingFirebase(authStore.user.uid, holding.id!)
      }
    }

    // Rebuild holdings from transactions
    const holdingsMap = new Map<string, { quantity: number; totalCost: number }>()
    
    for (const transaction of remainingTransactions) {
      const symbol = transaction.symbol.toUpperCase()
      const existing = holdingsMap.get(symbol) || { quantity: 0, totalCost: 0 }

      if (transaction.type === 'buy') {
        existing.quantity += transaction.quantity
        existing.totalCost += transaction.price * transaction.quantity
      } else {
        existing.quantity -= transaction.quantity
        // For sells, we reduce cost proportionally
        const avgPrice = existing.totalCost / (existing.quantity + transaction.quantity)
        existing.totalCost -= avgPrice * transaction.quantity
      }

      if (existing.quantity > 0) {
        holdingsMap.set(symbol, existing)
      } else {
        holdingsMap.delete(symbol)
      }
    }

    // Create holdings from map
    for (const [symbol, data] of holdingsMap.entries()) {
      const newHolding: Omit<StockHolding, 'id' | 'createdAt' | 'updatedAt'> = {
        symbol,
        quantity: data.quantity,
        averagePrice: data.totalCost / data.quantity
      }

      if (authStore.localMode) {
        await addHoldingLocal(newHolding)
      } else if (authStore.user) {
        await addHoldingFirebase(authStore.user.uid, newHolding)
      }
    }
  }

  const updateStockPrice = (symbol: string, price: number): void => {
    const upperSymbol = symbol.toUpperCase()
    stockPrices.value.set(upperSymbol, {
      symbol: upperSymbol,
      price,
      lastUpdated: new Date()
    })
  }

  const getStockPrice = (symbol: string): number | null => {
    const priceData = stockPrices.value.get(symbol.toUpperCase())
    return priceData?.price || null
  }

  const fetchAccount = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    loading.value = true
    error.value = null
    try {
      if (authStore.localMode) {
        account.value = await getAccountLocal()
      } else if (authStore.user) {
        account.value = await getAccountFirebase(authStore.user.uid)
      }
      
      // Initialize with defaults if account doesn't exist
      if (!account.value) {
        account.value = {
          totalInvested: 0,
          cash: 0
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load account'
      error.value = errorMessage
      console.error('Error fetching account:', err)
    } finally {
      loading.value = false
    }
  }

  const updateAccount = async (updates: Partial<PortfolioAccount>): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('User not authenticated')

    error.value = null
    try {
      const updatedAccount = {
        ...(account.value || { totalInvested: 0, cash: 0 }),
        ...updates
      }

      if (authStore.localMode) {
        await updateAccountLocal(updatedAccount)
      } else if (authStore.user) {
        // Check if account exists
        const existing = await getAccountFirebase(authStore.user.uid)
        if (existing) {
          await updateAccountFirebase(authStore.user.uid, updatedAccount)
        } else {
          await setAccountFirebase(authStore.user.uid, updatedAccount)
        }
      } else {
        throw new Error('User not authenticated')
      }

      await fetchAccount()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update account'
      error.value = errorMessage
      console.error('Error updating account:', err)
      throw err
    }
  }

  return {
    holdings,
    transactions,
    stockPrices,
    account,
    loading,
    error,
    holdingsWithPrices: holdingsWithNAVPercent,
    totalStockValue,
    totalCash,
    totalInvested,
    totalPortfolioValue,
    totalCostBasis,
    totalNAV,
    totalNAVPercent,
    fetchHoldings,
    fetchTransactions,
    fetchAccount,
    createTransaction,
    removeTransaction,
    updateStockPrice,
    getStockPrice,
    updateAccount
  }
})
