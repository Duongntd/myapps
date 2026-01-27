// Stock price fetching utility
// Uses free APIs to get stock prices

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  lastUpdated: Date
}

const PRICE_CACHE = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute cache

const YAHOO_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'

// Yahoo Finance does not send CORS headers, so browser requests must go through a proxy.
// Use VITE_STOCK_PRICE_PROXY to point at your own backend (e.g. Cloud Function); otherwise
// use a public CORS proxy when in browser.
function getYahooChartUrl(symbol: string): string {
  const target = `${YAHOO_CHART_BASE}/${symbol.toUpperCase()}?interval=1d&range=1d`
  const proxyBase = typeof import.meta !== 'undefined' && import.meta.env?.VITE_STOCK_PRICE_PROXY
    ? import.meta.env.VITE_STOCK_PRICE_PROXY.replace(/\/?$/, '')
    : null
  if (proxyBase) {
    return `${proxyBase}?symbol=${encodeURIComponent(symbol.toUpperCase())}`
  }
  if (typeof window !== 'undefined') {
    return `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`
  }
  return target
}

interface YahooChartMeta {
  regularMarketPrice?: number
  chartPreviousClose?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: YahooChartMeta
      indicators?: {
        quote?: Array<{ close?: number[] }>
        adjclose?: Array<{ adjclose?: number[] }>
      }
    }>
  }
}

type YahooChartResult = NonNullable<YahooChartResponse['chart']>['result'] extends (infer R)[] | undefined ? R : never

/** Extract best-available price from Yahoo chart result (handles mutual funds / stale symbols). */
function extractPriceFromChartResult(result: YahooChartResult): number | null {
  const meta = result?.meta
  const quote = result?.indicators?.quote?.[0]
  const adjclose = result?.indicators?.adjclose?.[0]

  if (meta?.regularMarketPrice != null && meta.regularMarketPrice > 0) {
    return meta.regularMarketPrice
  }
  const closes = quote?.close?.filter((n: number | undefined): n is number => typeof n === 'number' && n > 0)
  if (closes && closes.length > 0) {
    return closes[closes.length - 1]
  }
  const adjs = adjclose?.adjclose?.filter((n: number | undefined): n is number => typeof n === 'number' && n > 0)
  if (adjs && adjs.length > 0) {
    return adjs[adjs.length - 1]
  }
  if (meta?.chartPreviousClose != null && meta.chartPreviousClose > 0) {
    return meta.chartPreviousClose
  }
  // Mutual funds / stale symbols often only have fiftyTwoWeekHigh/Low (e.g. AMZ)
  const high = meta?.fiftyTwoWeekHigh
  const low = meta?.fiftyTwoWeekLow
  if (high != null && high > 0) return high
  if (low != null && low > 0) return low
  if (high != null && low != null) {
    const avg = (high + low) / 2
    if (avg > 0) return avg
  }
  return null
}

// Free stock price API using Yahoo Finance (yfinance-style data).
// In the browser we use a CORS proxy; set VITE_STOCK_PRICE_PROXY for a custom backend.
async function fetchYahooFinanceQuote(symbol: string): Promise<number | null> {
  try {
    const url = getYahooChartUrl(symbol)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const raw = await response.json()
    // AllOrigins /get returns { contents: "<yahoo json string>" }; direct/proxy returns chart object
    const data: YahooChartResponse =
      typeof raw?.contents === 'string' ? JSON.parse(raw.contents) : raw

    const result = data.chart?.result?.[0]
    return result ? extractPriceFromChartResult(result) : null
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

// Alternative: Use Alpha Vantage API (requires API key)
async function fetchAlphaVantageQuote(symbol: string, apiKey?: string): Promise<number | null> {
  if (!apiKey) return null

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data['Global Quote']?.['05. price']) {
      return parseFloat(data['Global Quote']['05. price'])
    }

    return null
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

export async function getStockPrice(symbol: string, apiKey?: string): Promise<number | null> {
  const upperSymbol = symbol.toUpperCase()
  const now = Date.now()
  
  // Check cache first
  const cached = PRICE_CACHE.get(upperSymbol)
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.price
  }

  // Try Alpha Vantage first if API key is provided
  if (apiKey) {
    const price = await fetchAlphaVantageQuote(upperSymbol, apiKey)
    if (price !== null) {
      PRICE_CACHE.set(upperSymbol, { price, timestamp: now })
      return price
    }
  }

  // Fallback to Yahoo Finance
  const price = await fetchYahooFinanceQuote(upperSymbol)
  if (price !== null) {
    PRICE_CACHE.set(upperSymbol, { price, timestamp: now })
    return price
  }

  return null
}

export async function getStockQuote(symbol: string, apiKey?: string): Promise<StockQuote | null> {
  const price = await getStockPrice(symbol, apiKey)
  if (price === null) return null

  // For now, we only return price. Change and changePercent would require additional API calls
  return {
    symbol: symbol.toUpperCase(),
    price,
    change: 0, // Would need previous close price
    changePercent: 0, // Would need previous close price
    lastUpdated: new Date()
  }
}

export async function getMultipleStockPrices(symbols: string[], apiKey?: string): Promise<Map<string, number>> {
  const prices = new Map<string, number>()
  
  // Fetch prices with a small delay between requests to avoid rate limiting
  for (const symbol of symbols) {
    const price = await getStockPrice(symbol, apiKey)
    if (price !== null) {
      prices.set(symbol.toUpperCase(), price)
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  return prices
}

export function clearPriceCache(): void {
  PRICE_CACHE.clear()
}
