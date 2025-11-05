# 📊 Real-Time Order Book Visualizer

A high-performance, real-time **BTC/USDT Order Book Visualizer** built using **Next.js** and **TypeScript**, powered by live data from the **Binance WebSocket API**.

This project demonstrates the ability to handle **high-frequency streaming market data**, maintain **UI responsiveness**, and implement **clean, production-ready frontend architecture** — essential skills for modern financial technology applications.

---

## 🧩 Objective

The goal of this assignment is to build a **real-time stock order book visualizer** that:
- Connects to the **live Binance WebSocket API**
- Displays **bids (buy orders)** and **asks (sell orders)** in real time
- Streams the **most recent trades**
- Maintains smooth performance and clear UI even under high data rates

---

## ⚙️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [Next.js 14](https://nextjs.org/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| State Management | React Hooks + internal refs |
| Data Source | [Binance WebSocket API](https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams) |

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone this repository

```bash
git clone https://github.com/<your-username>/Orderbook-Visualizer.git
cd Orderbook-Visualizer
```
### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```
---

## 💡 Design Choices & Trade-offs
### 1.  Framework Choice — Next.js
- Chosen for its performance, simplicity, and easy Vercel deployment.
- Built-in TypeScript and file-based routing improve maintainability.

### 2. React Hooks instead of Zustand
- Used custom React Hooks **(useBinanceSocket)** instead of Zustand/Redux for minimal complexity.
- Since only two components **(OrderBook and RecentTrades)** consume data, global state libraries would have added unnecessary overhead.
- Internal useRef variables store data efficiently without triggering re-renders for every WebSocket message.

### 3. Performance Optimization
- Used requestAnimationFrame to batch WebSocket updates — ensuring React only re-renders once per animation frame.
- Used lodash.throttle (100 ms) to reduce sorting and re-render frequency under high update rates.
- Applied **useMemo** and **React.memo**to prevent redundant computations and re-renders.
- These techniques reduce latency and keep the UI smooth **(~60 FPS)**.



