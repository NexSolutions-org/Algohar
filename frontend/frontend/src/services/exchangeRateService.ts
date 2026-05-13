// Exchange rate service with caching and fallback to default rates

export type Currency = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "SAR" | "CAD" | "AUD";

interface ExchangeRates {
  [key: string]: number; // Rates from PKR to other currencies
  timestamp: number;
}

// Default exchange rates (PKR as base, approximate rates)
// These are fallback rates if API fails
const DEFAULT_RATES: Record<Currency, number> = {
  PKR: 1, // Base currency
  USD: 0.0036, // 1 PKR = 0.0036 USD (approximately 278 PKR = 1 USD)
  EUR: 0.0033, // 1 PKR = 0.0033 EUR (approximately 300 PKR = 1 EUR)
  GBP: 0.0028, // 1 PKR = 0.0028 GBP (approximately 355 PKR = 1 GBP)
  AED: 0.013, // 1 PKR = 0.013 AED (approximately 76 PKR = 1 AED)
  SAR: 0.013, // 1 PKR = 0.013 SAR (approximately 74 PKR = 1 SAR)
  CAD: 0.0049, // 1 PKR = 0.0049 CAD (approximately 204 PKR = 1 CAD)
  AUD: 0.0055, // 1 PKR = 0.0055 AUD (approximately 182 PKR = 1 AUD)
};

const CACHE_KEY = "algohar-exchange-rates";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Free exchange rate API endpoint (using exchangerate-api.com free tier)
const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/PKR";

/**
 * Fetch exchange rates from API
 */
async function fetchExchangeRates(): Promise<Record<Currency, number> | null> {
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }
    
    const data = await response.json();
    
    // Convert API response to our format
    const rates: Record<Currency, number> = {
      PKR: 1,
      USD: data.rates?.USD || DEFAULT_RATES.USD,
      EUR: data.rates?.EUR || DEFAULT_RATES.EUR,
      GBP: data.rates?.GBP || DEFAULT_RATES.GBP,
      AED: data.rates?.AED || DEFAULT_RATES.AED,
      SAR: data.rates?.SAR || DEFAULT_RATES.SAR,
      CAD: data.rates?.CAD || DEFAULT_RATES.CAD,
      AUD: data.rates?.AUD || DEFAULT_RATES.AUD,
    };
    
    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}

/**
 * Get cached exchange rates
 */
function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const rates: ExchangeRates = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - rates.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return rates;
  } catch (error) {
    console.error("Error reading cached exchange rates:", error);
    return null;
  }
}

/**
 * Cache exchange rates
 */
function cacheRates(rates: Record<Currency, number>): void {
  try {
    const exchangeRates: ExchangeRates = {
      ...rates,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(exchangeRates));
  } catch (error) {
    console.error("Error caching exchange rates:", error);
  }
}

/**
 * Get exchange rates (with caching and fallback)
 */
export async function getExchangeRates(): Promise<Record<Currency, number>> {
  // Check cache first
  const cached = getCachedRates();
  if (cached) {
    // Remove timestamp before returning
    const { timestamp, ...rates } = cached;
    return rates as Record<Currency, number>;
  }
  
  // Fetch from API
  const rates = await fetchExchangeRates();
  if (rates) {
    cacheRates(rates);
    return rates;
  }
  
  // Fallback to default rates
  console.warn("Using default exchange rates");
  return DEFAULT_RATES;
}

/**
 * Get exchange rate for a specific currency pair
 */
export async function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  const rates = await getExchangeRates();
  
  // If converting from PKR, use direct rate
  if (fromCurrency === "PKR") {
    return rates[toCurrency] || 1;
  }
  
  // If converting to PKR, use inverse rate
  if (toCurrency === "PKR") {
    return 1 / (rates[fromCurrency] || 1);
  }
  
  // Convert from one currency to another via PKR
  // Rate = (1 PKR in toCurrency) / (1 PKR in fromCurrency)
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return toRate / fromRate;
}

/**
 * Initialize exchange rates on app load (optional, can be called in background)
 */
export async function initializeExchangeRates(): Promise<void> {
  // Fetch rates in background to populate cache
  await getExchangeRates();
}

