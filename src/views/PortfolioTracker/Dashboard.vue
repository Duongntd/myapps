<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      <!-- Total Invested -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <h3 class="text-xs sm:text-sm font-medium text-gray-600">{{ $t('portfolioTracker.totalInvested') }}</h3>
          <span class="text-xl sm:text-2xl">💵</span>
        </div>
        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{{ formatCurrency(portfolioStore.totalInvested) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ $t('portfolioTracker.deposits') }}</p>
      </div>

      <!-- Total Cash -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <h3 class="text-xs sm:text-sm font-medium text-gray-600">{{ $t('portfolioTracker.totalCash') }}</h3>
          <span class="text-xl sm:text-2xl">💳</span>
        </div>
        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{{ formatCurrency(portfolioStore.totalCash) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ $t('portfolioTracker.available') }}</p>
      </div>

      <!-- Total Stock Value -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <h3 class="text-xs sm:text-sm font-medium text-gray-600">{{ $t('portfolioTracker.totalStockValue') }}</h3>
          <span class="text-xl sm:text-2xl">📊</span>
        </div>
        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{{ formatCurrency(portfolioStore.totalStockValue) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ portfolioStore.holdings.length }} {{ $t('portfolioTracker.holdings') }}</p>
      </div>

      <!-- Total Portfolio Value -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <h3 class="text-xs sm:text-sm font-medium text-gray-600">{{ $t('portfolioTracker.totalPortfolioValue') }}</h3>
          <span class="text-xl sm:text-2xl">💰</span>
        </div>
        <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{{ formatCurrency(portfolioStore.totalPortfolioValue) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ $t('portfolioTracker.cashPlusStocks') }}</p>
      </div>
    </div>

    <!-- Additional Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
      <!-- Total NAV -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div class="flex items-center justify-between mb-1 sm:mb-2">
          <h3 class="text-xs sm:text-sm font-medium text-gray-600">{{ $t('portfolioTracker.totalNAV') }}</h3>
          <span class="text-xl sm:text-2xl">📈</span>
        </div>
        <p 
          class="text-xl sm:text-2xl lg:text-3xl font-bold"
          :class="portfolioStore.totalNAV >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ formatCurrency(portfolioStore.totalNAV) }}
        </p>
        <p 
          class="text-xs mt-1"
          :class="portfolioStore.totalNAV >= 0 ? 'text-green-600' : 'text-red-600'"
        >
          {{ formatPercent(portfolioStore.totalNAVPercent) }}
        </p>
      </div>

      <!-- Refresh Button -->
      <div class="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <button
          @click="refreshPrices"
          :disabled="refreshing"
          class="w-full bg-primary-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
        >
          <span v-if="refreshing">{{ $t('portfolioTracker.refreshing') }}</span>
          <span v-else>{{ $t('portfolioTracker.refreshPrices') }}</span>
        </button>
      </div>
    </div>

    <!-- Holdings Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">{{ $t('portfolioTracker.myHoldings') }}</h2>
      </div>

      <div v-if="portfolioStore.loading && portfolioStore.holdings.length === 0" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-sm text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="portfolioStore.holdings.length === 0" class="p-8 text-center">
        <p class="text-gray-600 mb-4">{{ $t('portfolioTracker.noHoldings') }}</p>
        <router-link
          to="/portfolio-tracker/transactions"
          class="inline-block bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm sm:text-base"
        >
          {{ $t('portfolioTracker.addFirstTransaction') }}
        </router-link>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.symbol') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.quantity') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.avgPrice') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.currentPrice') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.currentValue') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.nav') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('portfolioTracker.navPercent') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="holding in portfolioStore.holdingsWithPrices"
              :key="holding.id"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm font-semibold text-gray-900">{{ holding.symbol }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ holding.quantity }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ formatCurrency(holding.averagePrice) }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div v-if="editingPrice === holding.id" class="flex items-center gap-2">
                  <input
                    v-model.number="editPriceValue"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    @keyup.enter="savePrice(holding.symbol)"
                    @keyup.esc="cancelEditPrice"
                  />
                  <button
                    @click="savePrice(holding.symbol)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    ✓
                  </button>
                  <button
                    @click="cancelEditPrice"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    ✕
                  </button>
                </div>
                <div v-else class="flex items-center gap-2">
                  <span v-if="holding.currentPrice > 0" class="text-sm text-gray-900">{{ formatCurrency(holding.currentPrice) }}</span>
                  <span v-else class="text-sm text-gray-400">{{ $t('portfolioTracker.loading') }}</span>
                  <button
                    @click="startEditPrice(holding.id!, holding.currentPrice)"
                    class="text-primary-600 hover:text-primary-800 text-xs"
                    :title="$t('portfolioTracker.editPrice')"
                  >
                    ✏️
                  </button>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span v-if="holding.currentPrice > 0" class="text-sm text-gray-900">{{ formatCurrency(holding.currentValue) }}</span>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  v-if="holding.currentPrice > 0"
                  class="text-sm font-medium"
                  :class="holding.nav >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ formatCurrency(holding.nav) }}
                </span>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span
                  v-if="holding.currentPrice > 0"
                  class="text-sm font-medium"
                  :class="holding.navPercent >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ formatPercent(holding.navPercent) }}
                </span>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { getMultipleStockPrices } from '@/utils/stockPrice'
import { useI18n } from 'vue-i18n'

const portfolioStore = usePortfolioStore()
const { t } = useI18n()
const refreshing = ref(false)
const editingPrice = ref<string | null>(null)
const editPriceValue = ref<number>(0)

onMounted(async () => {
  await portfolioStore.fetchHoldings()
  await portfolioStore.fetchTransactions()
  await portfolioStore.fetchAccount()
  await refreshPrices()
})

const startEditPrice = (holdingId: string, currentPrice: number) => {
  editingPrice.value = holdingId
  editPriceValue.value = currentPrice > 0 ? currentPrice : 0
}

const cancelEditPrice = () => {
  editingPrice.value = null
  editPriceValue.value = 0
}

const savePrice = (symbol: string) => {
  if (editPriceValue.value > 0) {
    portfolioStore.updateStockPrice(symbol, editPriceValue.value)
  }
  cancelEditPrice()
}

const refreshPrices = async () => {
  if (refreshing.value) return
  
  refreshing.value = true
  try {
    const symbols = portfolioStore.holdings.map(h => h.symbol)
    if (symbols.length === 0) return

    const prices = await getMultipleStockPrices(symbols)
    prices.forEach((price, symbol) => {
      portfolioStore.updateStockPrice(symbol, price)
    })
  } catch (error) {
    console.error('Error refreshing prices:', error)
  } finally {
    refreshing.value = false
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
</script>
