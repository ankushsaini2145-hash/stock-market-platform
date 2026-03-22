# Stock Market Platform

## Current State
Empty project with Motoko backend scaffold and React frontend scaffold.

## Requested Changes (Diff)

### Add
- Dashboard overview with market summary (indices, top gainers/losers)
- Stock search and detail pages with price history charts
- News feed with sentiment analysis (bullish/bearish/neutral tags)
- Technical indicators panel (RSI, MACD, Bollinger Bands, Moving Averages)
- Chart patterns detection display
- Fundamental metrics panel (P/E, EPS, Market Cap, Revenue, etc.)
- Backtesting engine: user defines a strategy (buy/sell rules) on historical data and sees results
- Paper trading simulator: virtual portfolio with buy/sell orders, P&L tracking
- Watchlist management
- Support for Indian (NSE/BSE) and global stocks (mock data)

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Backend: Store watchlist, paper trading portfolio (positions, orders), backtesting results, user preferences
2. Backend: Expose APIs for portfolio management (add/remove positions, track P&L), watchlist CRUD, and storing backtests
3. Frontend: Dashboard with mock market data, charts using recharts
4. Frontend: Stock detail page with tabs for technical, fundamental, news
5. Frontend: Paper trading UI (virtual buy/sell form, portfolio summary)
6. Frontend: Backtesting UI (strategy parameters, results display)
7. Frontend: Navigation between all sections
