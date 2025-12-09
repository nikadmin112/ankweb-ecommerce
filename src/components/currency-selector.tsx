"use client";

import { useCurrency } from './currency-context';
import { Globe } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-white">
        <Globe className="h-4 w-4" />
        <span>{currency.code}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2 space-y-1">
          {Object.values(currencies).map((curr) => (
            <button
              key={curr.code}
              onClick={() => setCurrency(curr.code)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                currency.code === curr.code
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {curr.symbol} {curr.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
