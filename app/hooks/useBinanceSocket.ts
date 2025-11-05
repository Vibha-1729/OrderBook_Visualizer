import { useEffect, useState, useRef } from 'react';

interface Order {
  [price: string]: number;
}

interface DepthState {
  bids: [string, number][];
  asks: [string, number][];
}

interface Trade {
  e: string;
  E: number;
  s: string;
  t: number;
  p: string;
  q: string;
  m: boolean;
  T: number;
}

export function useBinanceSocket(symbol: string) {
  const [depth, setDepth] = useState<DepthState>({ bids: [], asks: [] });
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const lastUpdateId = useRef<number | null>(null);
  const bidsRef = useRef<Order>({});
  const asksRef = useRef<Order>({});

  useEffect(() => {
    let wsDepth: WebSocket | null = null;
    let wsTrade: WebSocket | null = null;
    let isMounted = true;

    async function fetchSnapshot() {
      const restUrl = `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=1000`;
      const snapshot = await fetch(restUrl).then(res => res.json());
      if (!isMounted) return;

      lastUpdateId.current = snapshot.lastUpdateId;
      bidsRef.current = Object.fromEntries(snapshot.bids.map(([p, q]: [string, string]) => [p, parseFloat(q)]));
      asksRef.current = Object.fromEntries(snapshot.asks.map(([p, q]: [string, string]) => [p, parseFloat(q)]));

      // Now start listening to the WebSocket stream
      connectDepthSocket();
      connectTradeSocket();

      // Initialize visible book
      updateDepthState();
    }

    function updateDepthState() {
      const sortedBids = Object.entries(bidsRef.current)
        .filter(([_, qty]) => qty > 0)
        .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
        .slice(0, 100);
      const sortedAsks = Object.entries(asksRef.current)
        .filter(([_, qty]) => qty > 0)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
        .slice(0, 100);

      setDepth({ bids: sortedBids as [string, number][], asks: sortedAsks as [string, number][] });
    }

    function applyDelta(data: any) {
      if (!lastUpdateId.current) return;
      if (data.u <= lastUpdateId.current) return; // outdated delta

      // Apply bid updates
      for (const [p, q] of data.b) {
        const qty = parseFloat(q);
        if (qty === 0) delete bidsRef.current[p];
        else bidsRef.current[p] = qty;
      }

      // Apply ask updates
      for (const [p, q] of data.a) {
        const qty = parseFloat(q);
        if (qty === 0) delete asksRef.current[p];
        else asksRef.current[p] = qty;
      }

      lastUpdateId.current = data.u;
      updateDepthState();
    }

    function connectDepthSocket() {
      const url = `wss://stream.binance.com:9443/ws/${symbol}@depth`;
      wsDepth = new WebSocket(url);

      wsDepth.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.e === 'depthUpdate') {
          applyDelta(data);
        }
      };

      wsDepth.onclose = () => {
        console.warn('Depth WS closed. Reconnecting...');
        setTimeout(connectDepthSocket, 2000);
      };

      wsDepth.onerror = (err) => console.error('Depth WS error:', err);
    }

    function connectTradeSocket() {
      const url = `wss://stream.binance.com:9443/ws/${symbol}@trade`;
      wsTrade = new WebSocket(url);

      wsTrade.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastTrade(data);
      };

      wsTrade.onclose = () => {
        console.warn('Trade WS closed. Reconnecting...');
        setTimeout(connectTradeSocket, 2000);
      };

      wsTrade.onerror = (err) => console.error('Trade WS error:', err);
    }

    fetchSnapshot();

    return () => {
      isMounted = false;
      wsDepth?.close();
      wsTrade?.close();
    };
  }, [symbol]);

  return { bids: depth.bids, asks: depth.asks, lastTrade };
}
