"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = {
  code: string;
  symbol: string;
  rate: number; // Rate relative to INR
};

const CURRENCIES: Record<string, Currency> = {
  INR: { code: 'INR', symbol: '₹', rate: 1 },
  USD: { code: 'USD', symbol: '$', rate: 0.012 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 0.018 },
  CAD: { code: 'CAD', symbol: 'C$', rate: 0.017 },
};

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (code: string) => void;
  convertPrice: (priceInINR: number) => number;
  formatPrice: (priceInINR: number) => string;
  currencies: Record<string, Currency>;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES.INR);

  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved && CURRENCIES[saved]) {
      setCurrencyState(CURRENCIES[saved]);
    }
  }, []);

  const setCurrency = (code: string) => {
    if (CURRENCIES[code]) {
      setCurrencyState(CURRENCIES[code]);
      localStorage.setItem('preferredCurrency', code);
    }
  };

  const convertPrice = (priceInINR: number): number => {
    return Math.round(priceInINR * currency.rate);
  };

  const formatPrice = (priceInINR: number): string => {
    const converted = convertPrice(priceInINR);
    return `${currency.symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
