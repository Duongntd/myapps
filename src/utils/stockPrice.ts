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

// Free stock price API using yahoo finance via a proxy
// Alternative: Use Alpha Vantage, Finnhub, or other free APIs
async function fetchYahooFinanceQuote(symbol: string): Promise<number | null> {
  try {
    // Using yahoo finance API via a public proxy
    // Note: This is a free service and may have rate limits
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}?interval=1d&range=1d`
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice
    }
    
    if (data.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.[0]) {
      const closes = data.chart.result[0].indicators.quote[0].close
      return closes[closes.length - 1]
    }

    return null
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
