import { Currency } from "@/contexts/CurrencyContext";
import { getExchangeRate, getExchangeRates } from "@/services/exchangeRateService";
import { CURRENCIES } from "@/contexts/CurrencyContext";

/**
 * Convert amount from one currency to another
 */
export async function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (fromCurrency === toCurrency || amount === 0) {
    return amount;
  }
  
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Convert amount synchronously using cached rates
 * This is for immediate display when rates are already cached
 */
export function convertAmountSync(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<Currency, number>
): number {
  if (fromCurrency === toCurrency || amount === 0) {
    return amount;
  }
  
  if (fromCurrency === "PKR") {
    return amount * (rates[toCurrency] || 1);
  }
  
  if (toCurrency === "PKR") {
    return amount / (rates[fromCurrency] || 1);
  }
  
  // Convert via PKR
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  return (amount / fromRate) * toRate;
}

/**
 * Format currency amount with symbol and locale formatting
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = CURRENCIES[currency];
  const symbol = currencyInfo.symbol;
  
  // Round to 2 decimal places for most currencies
  let formattedAmount: string;
  
  if (currency === "PKR") {
    // PKR typically doesn't use decimals for whole amounts
    formattedAmount = Math.round(amount).toLocaleString("en-PK");
  } else {
    // Other currencies use 2 decimal places, but remove trailing zeros for whole numbers
    const rounded = Math.round(amount * 100) / 100;
    if (rounded % 1 === 0) {
      formattedAmount = rounded.toLocaleString("en-US");
    } else {
      formattedAmount = rounded.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
  
  // Format based on currency symbol position
  if (symbol === "Rs." || symbol === "$" || symbol === "€" || symbol === "£") {
    // Symbol before amount
    return `${symbol} ${formattedAmount}`;
  } else {
    // Symbol after amount (for AED, SAR, etc.)
    return `${formattedAmount} ${symbol}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency].symbol;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  return CURRENCIES[currency].name;
}

/**
 * Format amount with currency (short format for compact displays)
 */
export function formatCurrencyCompact(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `${symbol}${millions.toFixed(2)}M`;
  } else if (amount >= 1000) {
    const thousands = amount / 1000;
    return `${symbol}${thousands.toFixed(2)}K`;
  }
  
  return formatCurrency(amount, currency);
}

/**
 * Hook-like function to get cached rates for synchronous conversion
 * This should be used with the currency context
 */
export async function getCachedRatesForConversion(): Promise<Record<Currency, number>> {
  return await getExchangeRates();
}

