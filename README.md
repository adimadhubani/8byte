# Stock Portfolio Dashboard

A dynamic full-stack stock portfolio tracking web app built with React, TypeScript, Tailwind CSS, Node.js, and Express. Tracks Indian equities, calculates sector-level investments, pulls live CMP from Yahoo Finance, scrapes valuation multiples (P/E ratio, earnings) from Google Finance, and auto-polls every 15s with an in-memory TTL cache.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with Inter font)
- **Data Fetching**: Axios with AbortController to discard stale requests
- **Components**: Semantic HTML tables with Tailwind and sticky headers, KPI cards, sector breakdown blocks (kept it to plain HTML tables instead of adding react-table so the code remains simple to explain)

### Backend
- **Runtime**: Node.js + Express with TypeScript
- **Security & Logging**: Helmet, CORS, Morgan
- **Caching**: `node-cache` (in-memory TTL cache)
- **Market Data**:
  - `yahoo-finance2`: CMP prices with 15s TTL and random jitter
  - `cheerio` + `axios`: Scrapes P/E and latest earnings from Google Finance with 5m TTL

---

## Project Structure

```text
portfolio-dashboard/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── stocks.ts          # Single ticker & list endpoints
│   │   │   └── portfolio.ts       # Main portfolio enrichment & sector grouping
│   │   ├── services/
│   │   │   ├── yahooService.ts    # Yahoo Finance CMP fetcher (marketData)
│   │   │   ├── googleService.ts   # Google Finance scraper (fundamentalsScraper)
│   │   │   └── cacheService.ts    # In-memory priceCache wrapper
│   │   ├── data/
│   │   │   └── portfolioData.ts   # Curated Indian blue-chip portfolio
│   │   ├── types/
│   │   │   └── index.ts           # Shared data interfaces (HoldingRow, SectorTotals)
│   │   ├── utils/
│   │   │   └── logger.ts          # Timestamped logger
│   │   └── server.ts              # Express server setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PortfolioTable.tsx # Plain HTML table with sticky headers
│   │   │   ├── SectorGroup.tsx    # SectorBlock with aggregated stats
│   │   │   ├── SummaryCard.tsx    # KpiCard metric components
│   │   │   ├── Loader.tsx         # Tailwind spinner
│   │   │   └── ErrorBanner.tsx    # FetchError dismissible alert
│   │   ├── hooks/
│   │   │   └── usePortfolio.ts    # useHoldings polling hook
│   │   ├── services/
│   │   │   └── api.ts             # Axios client with proxy support
│   │   ├── types/
│   │   │   └── index.ts           # Frontend contracts
│   │   ├── utils/
│   │   │   └── format.ts          # toRupees, asPercent, gainLossClass
│   │   ├── App.tsx                # Main view layout
│   │   ├── main.tsx               # App entry
│   │   └── index.css              # Tailwind base
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Setup & Running

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs at `http://127.0.0.1:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

---

## Caching Strategy

| Item | TTL | Storage | Reason |
| :--- | :--- | :--- | :--- |
| **CMP (Market Price)** | 15 seconds | `node-cache` | Matches the UI 15s refresh interval; avoids burst rate limits |
| **P/E & Earnings** | 5 minutes | `node-cache` | Fundamentals don't change every 15 seconds |

---

## Challenges Faced & Practical Solutions

### 1. Yahoo Finance Has No Official API
I initially looked for an official REST API endpoint, but Yahoo discontinued public API access years ago. Unofficial endpoints often return 401 Unauthorized or block requests when hit rapidly.
- **Solution**: I used the `yahoo-finance2` package. To avoid hammering the endpoint with concurrent requests, I introduced a small random jitter (100–300ms) between calls and wrapped each call in a try/catch so any network glitch falls back to `null` without crashing the app.

### 2. Google Finance Has No API (Cheerio Scraping)
Google Finance does not have any public JSON API for P/E ratios or earnings dates.
- **Solution**: I wrote a custom scraper using `axios` with browser headers and parsed the HTML DOM using `cheerio`. Since Google can tweak CSS classes or DOM nesting, I used defensive text matching for labels like "P/E ratio" and cached the parsed fundamentals for 5 minutes so we don't scrape Google on every 15-second tick.

### 3. Rate Limits & Parallel Fetching
Fetching 9 stocks sequentially was taking 4–5 seconds, but using a naive `Promise.all` meant that if even one ticker timed out or failed to resolve, the entire portfolio API failed.
- **Solution**: I switched to `Promise.allSettled`. This allows all stocks to enrich in parallel; if one stock fails, its price becomes `null` (rendered as `—` on the UI) while the remaining stocks render normally. Coupled with `node-cache`, subsequent requests take < 2ms.

### 4. macOS AirPlay Port 5000 Conflict
I spent ~45 minutes debugging why `http://localhost:5000` was throwing HTTP 403 Forbidden on macOS. It turns out macOS Monterey/Ventura/Sonoma runs AirPlay Receiver on port 5000 over IPv6 (`::1`).
- **Solution**: Configured the backend server to explicitly bind to IPv4 loopback `127.0.0.1:5000` and pointed the frontend proxy directly to `http://127.0.0.1:5000`.

### 5. Stale Requests on Fast User Interaction
If the user clicks "Refresh" while an automatic 15s background poll is already inflight, two requests race each other and can cause UI flickering.
- **Solution**: Implemented `AbortController` inside `useHoldings`. Whenever a new fetch begins, the previous in-flight controller is aborted, discarding obsolete responses.

---

## Disclaimer
Data shown is fetched from unofficial endpoints for educational purposes only.
