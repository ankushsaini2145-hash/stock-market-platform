// Mock stock data for the platform

export const STOCKS: Record<
  string,
  { name: string; exchange: string; sector: string }
> = {
  RELIANCE: { name: "Reliance Industries", exchange: "NSE", sector: "Energy" },
  TCS: {
    name: "Tata Consultancy Services",
    exchange: "NSE",
    sector: "Technology",
  },
  INFY: { name: "Infosys Ltd", exchange: "NSE", sector: "Technology" },
  HDFCBANK: { name: "HDFC Bank", exchange: "NSE", sector: "Finance" },
  WIPRO: { name: "Wipro Ltd", exchange: "NSE", sector: "Technology" },
  BAJFINANCE: { name: "Bajaj Finance", exchange: "NSE", sector: "Finance" },
  TATAMOTORS: { name: "Tata Motors", exchange: "NSE", sector: "Auto" },
  NIFTY50: { name: "Nifty 50 Index", exchange: "NSE", sector: "Index" },
  SENSEX: { name: "BSE Sensex", exchange: "BSE", sector: "Index" },
  AAPL: { name: "Apple Inc", exchange: "NASDAQ", sector: "Technology" },
  GOOGL: { name: "Alphabet Inc", exchange: "NASDAQ", sector: "Technology" },
  MSFT: { name: "Microsoft Corp", exchange: "NASDAQ", sector: "Technology" },
  TSLA: { name: "Tesla Inc", exchange: "NASDAQ", sector: "Auto" },
  AMZN: { name: "Amazon.com Inc", exchange: "NASDAQ", sector: "Retail" },
  SPY: { name: "S&P 500 ETF", exchange: "NYSE", sector: "ETF" },
  META: { name: "Meta Platforms", exchange: "NASDAQ", sector: "Technology" },
};

export const BASE_PRICES: Record<string, number> = {
  RELIANCE: 2847.35,
  TCS: 3621.5,
  INFY: 1456.8,
  HDFCBANK: 1678.25,
  WIPRO: 524.65,
  BAJFINANCE: 6932.1,
  TATAMOTORS: 987.45,
  NIFTY50: 21850.0,
  SENSEX: 72000.0,
  AAPL: 189.5,
  GOOGL: 141.75,
  MSFT: 415.3,
  TSLA: 248.6,
  AMZN: 185.45,
  SPY: 485.2,
  META: 502.8,
};

function generatePriceHistory(basePrice: number, days = 180) {
  const data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[] = [];
  let price = basePrice * 0.75;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const change = (Math.random() - 0.48) * price * 0.025;
    price = Math.max(price + change, 1);
    const open = price;
    const high = price * (1 + Math.random() * 0.015);
    const low = price * (1 - Math.random() * 0.015);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(Math.random() * 5000000 + 1000000);
    data.push({
      date: date.toISOString().split("T")[0],
      open: Number.parseFloat(open.toFixed(2)),
      high: Number.parseFloat(high.toFixed(2)),
      low: Number.parseFloat(low.toFixed(2)),
      close: Number.parseFloat(close.toFixed(2)),
      volume,
    });
  }
  return data;
}

export function getPriceHistory(symbol: string) {
  const base = BASE_PRICES[symbol] || 100;
  return generatePriceHistory(base);
}

export function getCurrentPrice(symbol: string) {
  const base = BASE_PRICES[symbol] || 100;
  const variation = (Math.random() - 0.5) * 0.04;
  return Number.parseFloat((base * (1 + variation)).toFixed(2));
}

export function getChange(_symbol: string) {
  const pct = (Math.random() - 0.45) * 4;
  return Number.parseFloat(pct.toFixed(2));
}

export const FUNDAMENTALS: Record<string, Record<string, string>> = {
  RELIANCE: {
    "P/E": "28.4",
    EPS: "100.25",
    "Mkt Cap": "19.2T",
    "Div Yield": "0.35%",
    ROE: "11.2%",
    "Debt/Eq": "0.45",
  },
  TCS: {
    "P/E": "31.2",
    EPS: "116.10",
    "Mkt Cap": "13.1T",
    "Div Yield": "1.2%",
    ROE: "47.8%",
    "Debt/Eq": "0.02",
  },
  INFY: {
    "P/E": "26.8",
    EPS: "54.32",
    "Mkt Cap": "6.1T",
    "Div Yield": "2.1%",
    ROE: "32.4%",
    "Debt/Eq": "0.08",
  },
  HDFCBANK: {
    "P/E": "19.5",
    EPS: "86.10",
    "Mkt Cap": "12.5T",
    "Div Yield": "1.1%",
    ROE: "16.8%",
    "Debt/Eq": "8.2",
  },
  WIPRO: {
    "P/E": "22.1",
    EPS: "23.73",
    "Mkt Cap": "2.7T",
    "Div Yield": "0.2%",
    ROE: "18.2%",
    "Debt/Eq": "0.12",
  },
  BAJFINANCE: {
    "P/E": "32.7",
    EPS: "212.05",
    "Mkt Cap": "4.2T",
    "Div Yield": "0.3%",
    ROE: "24.1%",
    "Debt/Eq": "4.8",
  },
  TATAMOTORS: {
    "P/E": "11.2",
    EPS: "88.12",
    "Mkt Cap": "3.6T",
    "Div Yield": "0.5%",
    ROE: "20.5%",
    "Debt/Eq": "1.2",
  },
  AAPL: {
    "P/E": "31.5",
    EPS: "6.02",
    "Mkt Cap": "$2.9T",
    "Div Yield": "0.5%",
    ROE: "156.1%",
    "Debt/Eq": "1.8",
  },
  GOOGL: {
    "P/E": "24.8",
    EPS: "5.71",
    "Mkt Cap": "$1.8T",
    "Div Yield": "0.5%",
    ROE: "27.4%",
    "Debt/Eq": "0.11",
  },
  MSFT: {
    "P/E": "36.2",
    EPS: "11.45",
    "Mkt Cap": "$3.1T",
    "Div Yield": "0.7%",
    ROE: "40.2%",
    "Debt/Eq": "0.36",
  },
  TSLA: {
    "P/E": "62.1",
    EPS: "3.99",
    "Mkt Cap": "$792B",
    "Div Yield": "0%",
    ROE: "18.7%",
    "Debt/Eq": "0.10",
  },
  AMZN: {
    "P/E": "52.4",
    EPS: "3.54",
    "Mkt Cap": "$1.9T",
    "Div Yield": "0%",
    ROE: "20.5%",
    "Debt/Eq": "0.52",
  },
  META: {
    "P/E": "28.9",
    EPS: "17.41",
    "Mkt Cap": "$1.3T",
    "Div Yield": "0.4%",
    ROE: "38.2%",
    "Debt/Eq": "0.08",
  },
};

export const NEWS = [
  {
    id: 1,
    title:
      "Reliance Industries reports record Q3 profits, beats estimates by 12%",
    ticker: "RELIANCE",
    sentiment: "bullish",
    time: "2h ago",
    source: "Economic Times",
  },
  {
    id: 2,
    title: "TCS wins $500M deal from European banking giant",
    ticker: "TCS",
    sentiment: "bullish",
    time: "3h ago",
    source: "Business Standard",
  },
  {
    id: 3,
    title: "Infosys cuts revenue guidance amid client budget cuts",
    ticker: "INFY",
    sentiment: "bearish",
    time: "5h ago",
    source: "Mint",
  },
  {
    id: 4,
    title: "HDFC Bank NPA ratio improves to 1.26%, lowest in 5 years",
    ticker: "HDFCBANK",
    sentiment: "bullish",
    time: "6h ago",
    source: "LiveMint",
  },
  {
    id: 5,
    title: "Apple unveils new AI features for iPhone 17 lineup",
    ticker: "AAPL",
    sentiment: "bullish",
    time: "1h ago",
    source: "Bloomberg",
  },
  {
    id: 6,
    title: "Tesla faces regulatory scrutiny over Autopilot safety concerns",
    ticker: "TSLA",
    sentiment: "bearish",
    time: "4h ago",
    source: "Reuters",
  },
  {
    id: 7,
    title: "Microsoft Azure revenue surges 33% on AI cloud demand",
    ticker: "MSFT",
    sentiment: "bullish",
    time: "2h ago",
    source: "CNBC",
  },
  {
    id: 8,
    title: "Bajaj Finance sees 28% YoY growth in AUM",
    ticker: "BAJFINANCE",
    sentiment: "bullish",
    time: "7h ago",
    source: "The Hindu Business",
  },
  {
    id: 9,
    title: "Nifty 50 consolidates near all-time highs ahead of RBI policy",
    ticker: "NIFTY50",
    sentiment: "neutral",
    time: "1h ago",
    source: "Moneycontrol",
  },
  {
    id: 10,
    title: "Meta unveils next-generation AR glasses, stock jumps 4%",
    ticker: "META",
    sentiment: "bullish",
    time: "30m ago",
    source: "WSJ",
  },
  {
    id: 11,
    title: "Amazon lays off 500 employees in logistics division",
    ticker: "AMZN",
    sentiment: "bearish",
    time: "8h ago",
    source: "TechCrunch",
  },
  {
    id: 12,
    title: "Wipro management changes spark uncertainty among investors",
    ticker: "WIPRO",
    sentiment: "neutral",
    time: "10h ago",
    source: "Financial Express",
  },
  {
    id: 13,
    title: "Tata Motors JLR deliveries hit record high in Europe",
    ticker: "TATAMOTORS",
    sentiment: "bullish",
    time: "12h ago",
    source: "Autocar India",
  },
  {
    id: 14,
    title: "S&P 500 ETF sees $2.1B inflows as market sentiment improves",
    ticker: "SPY",
    sentiment: "bullish",
    time: "3h ago",
    source: "ETF.com",
  },
  {
    id: 15,
    title: "Google antitrust verdict may force breakup of ad business",
    ticker: "GOOGL",
    sentiment: "bearish",
    time: "6h ago",
    source: "FT",
  },
];

export function computeRSI(closes: number[], period = 14): number[] {
  const rsi: number[] = [];
  for (let i = 0; i < period; i++) rsi.push(50);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(Number.parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
  }
  return rsi;
}

export function computeMACD(closes: number[]) {
  function ema(data: number[], period: number) {
    const k = 2 / (period + 1);
    const result = [data[0]];
    for (let i = 1; i < data.length; i++)
      result.push(data[i] * k + result[i - 1] * (1 - k));
    return result;
  }
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const macdLine = ema12.map((v, i) =>
    Number.parseFloat((v - ema26[i]).toFixed(2)),
  );
  const signal = ema(macdLine, 9).map((v) => Number.parseFloat(v.toFixed(2)));
  const histogram = macdLine.map((v, i) =>
    Number.parseFloat((v - signal[i]).toFixed(2)),
  );
  return { macdLine, signal, histogram };
}

export function computeBollingerBands(closes: number[], period = 20) {
  return closes.map((_, i) => {
    if (i < period - 1) return { upper: 0, middle: 0, lower: 0 };
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(
      slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period,
    );
    return {
      upper: Number.parseFloat((mean + 2 * stdDev).toFixed(2)),
      middle: Number.parseFloat(mean.toFixed(2)),
      lower: Number.parseFloat((mean - 2 * stdDev).toFixed(2)),
    };
  });
}

export function computeMovingAverages(closes: number[]) {
  function sma(data: number[], period: number) {
    return data.map((_, i) => {
      if (i < period - 1) return null;
      return Number.parseFloat(
        (
          data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
        ).toFixed(2),
      );
    });
  }
  return {
    ma20: sma(closes, 20),
    ma50: sma(closes, 50),
    ma200: sma(closes, 200),
  };
}
