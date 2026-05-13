import { useState, useEffect } from "react";
import { useCurrency, Currency, CURRENCIES } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export default function CurrencySelector({ 
  className = "",
  showLabel = false,
  compact = false 
}: CurrencySelectorProps) {
  const { currency, setCurrency, isLoading } = useCurrency();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize exchange rates on mount
  useEffect(() => {
    const initRates = async () => {
      try {
        const { initializeExchangeRates } = await import("@/services/exchangeRateService");
        await initializeExchangeRates();
      } catch (error) {
        console.error("Failed to initialize exchange rates:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initRates();
  }, []);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  if (compact) {
    return (
      <Select value={currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className={`h-9 w-[100px] ${className}`}>
          {isInitializing || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SelectValue>
              <span className="flex items-center gap-1">
                <span>{CURRENCIES[currency].symbol}</span>
                <span className="text-xs">{currency}</span>
              </span>
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CURRENCIES).map(([code, info]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{info.symbol}</span>
                <span>{code}</span>
                <span className="text-muted-foreground text-xs ml-2">
                  {info.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Currency:
        </label>
      )}
      <Select value={currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[180px]">
          {isInitializing || isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="font-medium">{CURRENCIES[currency].symbol}</span>
                <span>{currency}</span>
                <span className="text-muted-foreground">- {CURRENCIES[currency].name}</span>
              </div>
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CURRENCIES).map(([code, info]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8">{info.symbol}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{code}</span>
                  <span className="text-xs text-muted-foreground">{info.name}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground hidden md:inline">
        (Approximate conversion)
      </span>
    </div>
  );
}

