'use client';

import React, { useMemo } from 'react';
import { useBinanceSocket } from '../hooks/useBinanceSocket';

/**
 * OrderBook.tsx
 * 
 * Displays a live BTC/USDT order book with:
 * - Real-time WebSocket updates from Binance
 * - Memoized and batched rendering
 * - Professional UI styling and visual feedback
 */

// Memoized row component
interface RowProps {
  price: number;
  qty: number;
  total: number;
  maxTotal: number;
  color: 'green' | 'red';
}

const OrderRow = React.memo(({ price, qty, total, maxTotal, color }: RowProps) => {
  const pct = (total / (maxTotal || 1)) * 100;
  const widthPct = Math.max(pct, 2);

  const bgClass =
    color === 'green'
      ? 'bg-green-500/25 rounded-r'
      : 'bg-red-500/25 rounded-l';

  const priceColor =
    color === 'green' ? 'text-green-300' : 'text-red-300';

  return (
    <div className="relative px-2 py-1">
      <div
        aria-hidden
        style={{
          width: `${widthPct}%`,
          pointerEvents: 'none',
          [color === 'green' ? 'left' : 'right']: 0,
        }}
        className={`absolute top-0 bottom-0 ${bgClass}`}
      />
      <div className="relative z-10 grid grid-cols-3 items-center text-[11px] font-mono">
        <div className={priceColor}>{price.toFixed(2)}</div>
        <div className="text-center text-gray-200">{qty.toFixed(4)}</div>
        <div className="text-right text-slate-300">{total.toFixed(4)}</div>
      </div>
    </div>
  );
});
OrderRow.displayName = 'OrderRow';

export default function OrderBook() {
  const { bids, asks } = useBinanceSocket('btcusdt');

  const processedBids = useMemo(() => {
    let cumulative = 0;
    return (bids || [])
      .map(([price, qty]: [string, number]) => ({
        price: parseFloat(price),
        qty,
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 20)
      .map(item => {
        cumulative += item.qty;
        return { ...item, total: cumulative };
      });
  }, [bids]);

  const processedAsks = useMemo(() => {
    let cumulative = 0;
    return (asks || [])
      .map(([price, qty]: [string, number]) => ({
        price: parseFloat(price),
        qty,
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 20)
      .map(item => {
        cumulative += item.qty;
        return { ...item, total: cumulative };
      });
  }, [asks]);

  const { maxBidTotal, maxAskTotal, bestBid, bestAsk, spreadAbs, spreadPct } = useMemo(() => {
    const maxBidTotal = processedBids.length ? Math.max(...processedBids.map(x => x.total)) : 1;
    const maxAskTotal = processedAsks.length ? Math.max(...processedAsks.map(x => x.total)) : 1;
    const bestBid = processedBids[0]?.price ?? 0;
    const bestAsk = processedAsks[0]?.price ?? 0;
    const spreadAbs = bestAsk && bestBid ? bestAsk - bestBid : 0;
    const spreadPct = bestBid ? (spreadAbs / bestBid) * 100 : 0;
    return { maxBidTotal, maxAskTotal, bestBid, bestAsk, spreadAbs, spreadPct };
  }, [processedBids, processedAsks]);

  return (
    <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl">
      <h2 className="text-xl font-semibold text-center mb-4 text-slate-100">
        Order Book (BTC/USDT)
      </h2>

      <div className="flex gap-6">
        {/* Bids */}
        <div className="w-1/2">
          <h3 className="text-green-400 font-semibold mb-2">Bids</h3>
          <div className="text-xs text-slate-400 uppercase grid grid-cols-3 gap-x-2 px-2 mb-1 tracking-wider">
            <div>Price</div><div className="text-center">Amount</div><div className="text-right">Total</div>
          </div>

          <div className="max-h-[480px] overflow-y-auto border border-slate-800 rounded-lg">
            {processedBids.map((row) => (
              <OrderRow
                key={row.price}
                price={row.price}
                qty={row.qty}
                total={row.total}
                maxTotal={maxBidTotal}
                color="green"
              />
            ))}
          </div>
        </div>

        {/* Spread */}
        <div className="flex flex-col items-center justify-center px-3 py-4 bg-slate-800/40 rounded-xl border border-slate-700 shadow-inner">
          <div className="text-sm text-slate-400 mb-1">Spread</div>
          <div className="text-center">
            <div className="text-xl font-semibold text-slate-100">
              {spreadAbs ? spreadAbs.toFixed(2) : '—'}
            </div>
            <div className="text-xs text-slate-400">
              {spreadPct ? `${spreadPct.toFixed(4)}%` : '—'}
            </div>
            <div className="mt-2 text-sm text-slate-300">
              Bid: <span className="text-green-300 font-medium">{bestBid?.toFixed(2)}</span>
            </div>
            <div className="text-sm text-slate-300">
              Ask: <span className="text-red-300 font-medium">{bestAsk?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Asks */}
        <div className="w-1/2">
          <h3 className="text-red-400 font-semibold mb-2">Asks</h3>
          <div className="text-xs text-slate-400 uppercase grid grid-cols-3 gap-x-2 px-2 mb-1 tracking-wider">
            <div>Price</div><div className="text-center">Amount</div><div className="text-right">Total</div>
          </div>

          <div className="max-h-[480px] overflow-y-auto border border-slate-800 rounded-lg">
            {processedAsks.map((row) => (
              <OrderRow
                key={row.price}
                price={row.price}
                qty={row.qty}
                total={row.total}
                maxTotal={maxAskTotal}
                color="red"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
