'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBinanceSocket } from '../hooks/useBinanceSocket';

/**
 * RecentTrades.tsx
 * 
 * Displays last 50 BTC/USDT trades in real time.
 * Each new trade flashes color briefly based on direction:
 * - 🟢 Market Buy
 * - 🔴 Market Sell
 */

export default function RecentTrades() {
  const [trades, setTrades] = useState<any[]>([]);
  const { lastTrade } = useBinanceSocket('btcusdt');

  useEffect(() => {
    if (lastTrade) {
      setTrades((prev) => [lastTrade, ...prev].slice(0, 50));
    }
  }, [lastTrade]);

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-xl">
      <h2 className="text-lg font-semibold text-center mb-3 text-slate-100">
        Recent Trades
      </h2>

      <div className="flex justify-between text-slate-400 text-xs border-b border-slate-700 pb-1 mb-2 uppercase tracking-wider">
        <span>Price (USDT)</span>
        <span>Amount (BTC)</span>
      </div>

      <ul className="space-y-1 max-h-[480px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {trades.map((trade) => {
            const isSell = trade.m;
            const color = isSell ? 'text-red-300' : 'text-green-300';
            const bgColor = isSell ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)';
            return (
              <motion.li
                key={trade.t}
                initial={{ backgroundColor: bgColor }}
                animate={{ backgroundColor: 'rgba(0,0,0,0)' }}
                transition={{ duration: 0.6 }}
                className={`flex justify-between text-sm ${color} px-2 py-0.5 rounded font-mono`}
              >
                <span>{parseFloat(trade.p).toFixed(2)}</span>
                <span>{parseFloat(trade.q).toFixed(4)}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
