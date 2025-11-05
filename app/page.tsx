import OrderBook from './components/OrderBook1';
import RecentTrades from './components/RecentTrades1';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl w-full flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold tracking-wide text-slate-100 mb-2">
          Real-Time Order Book Visualizer
        </h1>
        <p className="text-slate-400 text-sm mb-4">
          Powered by Binance Live Market Data (BTC/USDT)
        </p>

        {/* Order Book + Trades side by side on wide screens */}
        <div className="w-full flex flex-col lg:flex-row gap-8 justify-between">
          <OrderBook />
          <RecentTrades />
        </div>

        <footer className="text-xs text-slate-500 mt-10">
          Built by Vibha Narayan - OrderBook Visualizer
        </footer>
      </div>
    </main>
  );
}
