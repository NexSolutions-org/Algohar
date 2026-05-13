import { useState, useEffect } from "react";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { convertAmountSync, formatCurrency, getCachedRatesForConversion } from "@/lib/currencyUtils";
import { getExchangeRates } from "@/services/exchangeRateService";

/**
 * Hook to convert and format amounts from PKR to selected currency
 */
export function useCurrencyConversion() {
  const { currency } = useCurrency();
  const [rates, setRates] = useState<Record<Currency, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load exchange rates (only once on mount, all currencies loaded together)
  useEffect(() => {
    const loadRates = async () => {
      setIsLoading(true);
      try {
        const exchangeRates = await getExchangeRates();
        setRates(exchangeRates);
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
        // Fallback to default rates (will be handled by service)
        const exchangeRates = await getExchangeRates();
        setRates(exchangeRates);
      } finally {
        setIsLoading(false);
      }
    };

    loadRates();
  }, []); // Load once on mount - all currency rates are loaded together

  /**
   * Convert amount from PKR to selected currency
   */
  const convert = (amountInPKR: number): number => {
    if (!rates || currency === "PKR") {
      return amountInPKR;
    }
    return convertAmountSync(amountInPKR, "PKR", currency, rates);
  };

  /**
   * Format amount with currency symbol
   */
  const format = (amountInPKR: number): string => {
    const convertedAmount = convert(amountInPKR);
    return formatCurrency(convertedAmount, currency);
  };

  /**
   * Convert and format in one call
   */
  const convertAndFormat = (amountInPKR: number): string => {
    return format(amountInPKR);
  };

  return {
    currency,
    convert,
    format,
    convertAndFormat,
    isLoading,
    rates,
  };
}

