import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "SAR" | "CAD" | "AUD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Currency information
export const CURRENCIES: Record<Currency, { name: string; symbol: string; flag?: string }> = {
  PKR: { name: "Pakistani Rupee", symbol: "Rs." },
  USD: { name: "US Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  AED: { name: "UAE Dirham", symbol: "AED" },
  SAR: { name: "Saudi Riyal", symbol: "SAR" },
  CAD: { name: "Canadian Dollar", symbol: "C$" },
  AUD: { name: "Australian Dollar", symbol: "A$" },
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    // Get currency from localStorage or default to PKR
    const savedCurrency = localStorage.getItem("algohar-currency");
    return (savedCurrency as Currency) || "PKR";
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Save currency preference to localStorage
    localStorage.setItem("algohar-currency", currency);
  }, [currency]);

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

