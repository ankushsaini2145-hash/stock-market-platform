import {
  ShoppingCart,
  Star,
  StarOff,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FUNDAMENTALS,
  NEWS,
  STOCKS,
  computeMACD,
  computeRSI,
  getChange,
  getCurrentPrice,
  getPriceHistory,
} from "../data/mockData";

const WATCHLIST_DEFAULT = [
  "NIFTY50",
  "SENSEX",
  "RELIANCE",
  "TCS",
  "AAPL",
  "MSFT",
  "TSLA",
];

function PriceRow({
  symbol,
  isSelected,
  onClick,
}: { symbol: string; isSelected: boolean; onClick: () => void }) {
  const price = useMemo(() => getCurrentPrice(symbol), [symbol]);
  const change = useMemo(() => getChange(symbol), [symbol]);
  const info = STOCKS[symbol];
  const isUp = change >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2 cursor-pointer rounded w-full text-left"
      style={{
        background: isSelected ? "#2F80ED22" : "transparent",
        borderLeft: isSelected ? "2px solid #2F80ED" : "2px solid transparent",
      }}
    >
      <div>
        <div className="text-xs font-semibold" style={{ color: "#E7EDF5" }}>
          {symbol}
        </div>
        <div className="text-xs" style={{ color: "#98A5B3" }}>
          {info?.exchange}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-medium" style={{ color: "#E7EDF5" }}>
          {price.toLocaleString()}
        </div>
        <div
          className="text-xs font-medium"
          style={{ color: isUp ? "#2ECC71" : "#E74C3C" }}
        >
          {isUp ? "+" : ""}
          {change}%
        </div>
      </div>
    </button>
  );
}

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState("NIFTY50");
  const [watchlist, setWatchlist] = useState(WATCHLIST_DEFAULT);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderQty, setOrderQty] = useState("10");
  const [orderType, setOrderType] = useState("Market");
  const [orderMsg, setOrderMsg] = useState("");

  const allSymbols = Object.keys(STOCKS);
  const [showAddStock, setShowAddStock] = useState(false);

  const priceHistory = useMemo(
    () => getPriceHistory(selectedStock),
    [selectedStock],
  );
  const chartData = useMemo(
    () =>
      priceHistory.slice(-60).map((d, i, arr) => ({
        date: d.date.slice(5),
        price: d.close,
        volume: d.volume,
        rsi: computeRSI(
          arr.map((x) => x.close),
          14,
        )[i],
        macd: computeMACD(arr.map((x) => x.close)).macdLine[i],
        signal: computeMACD(arr.map((x) => x.close)).signal[i],
        histogram: computeMACD(arr.map((x) => x.close)).histogram[i],
      })),
    [priceHistory],
  );

  const currentPrice = useMemo(
    () => getCurrentPrice(selectedStock),
    [selectedStock],
  );
  const currentChange = useMemo(
    () => getChange(selectedStock),
    [selectedStock],
  );
  const isUp = currentChange >= 0;

  const fundamentals = FUNDAMENTALS[selectedStock] || FUNDAMENTALS.RELIANCE;
  const sentimentNews = NEWS.filter((n) => n.ticker === selectedStock).slice(
    0,
    3,
  );
  const bullishCount = sentimentNews.filter(
    (n) => n.sentiment === "bullish",
  ).length;
  const bearishCount = sentimentNews.filter(
    (n) => n.sentiment === "bearish",
  ).length;
  const recentNews = NEWS.slice(0, 5);

  // Technical signal counts
  const rsiLast = chartData[chartData.length - 1]?.rsi || 50;
  const buySignals = rsiLast < 40 ? 3 : rsiLast < 55 ? 2 : 1;
  const sellSignals = rsiLast > 70 ? 3 : rsiLast > 55 ? 2 : 1;
  const neutralSignals = 3 - buySignals + 3 - sellSignals;

  function toggleWatchlist(sym: string) {
    setWatchlist((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  }

  function placeOrder() {
    setOrderMsg(
      `${orderSide.toUpperCase()} ${orderQty} ${selectedStock} @ ${orderType} placed!`,
    );
    setTimeout(() => setOrderMsg(""), 3000);
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "240px 1fr 240px" }}
    >
      {/* Left: Watchlist */}
      <div
        style={{
          background: "#1B222B",
          border: "1px solid #2A3541",
          borderRadius: 12,
        }}
        className="flex flex-col"
      >
        <div
          className="flex items-center justify-between px-3 pt-3 pb-2"
          style={{ borderBottom: "1px solid #2A3541" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: "#98A5B3" }}
          >
            Market Watchlist
          </span>
          <button
            type="button"
            onClick={() => setShowAddStock(!showAddStock)}
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: "#2F80ED22", color: "#2F80ED" }}
          >
            + Add
          </button>
        </div>
        {showAddStock && (
          <div
            className="px-3 py-2"
            style={{ borderBottom: "1px solid #2A3541" }}
          >
            <div className="flex flex-wrap gap-1">
              {allSymbols
                .filter((s) => !watchlist.includes(s))
                .map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setWatchlist((prev) => [...prev, s]);
                      setShowAddStock(false);
                    }}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "#202A34",
                      color: "#2F80ED",
                      border: "1px solid #2A3541",
                    }}
                  >
                    {s}
                  </button>
                ))}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {watchlist.map((sym) => (
            <div key={sym} className="group flex items-center">
              <div className="flex-1">
                <PriceRow
                  symbol={sym}
                  isSelected={selectedStock === sym}
                  onClick={() => setSelectedStock(sym)}
                />
              </div>
              <button
                type="button"
                onClick={() => toggleWatchlist(sym)}
                className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} style={{ color: "#E74C3C" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Chart */}
      <div className="flex flex-col gap-4">
        {/* Stock Header */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg">
                {selectedStock}{" "}
                <span
                  className="text-xs font-normal ml-1"
                  style={{ color: "#98A5B3" }}
                >
                  {STOCKS[selectedStock]?.name}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold">
                  {currentPrice.toLocaleString()}
                </span>
                <span
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: isUp ? "#2ECC71" : "#E74C3C" }}
                >
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isUp ? "+" : ""}
                  {currentChange}%
                </span>
                <span className="text-xs" style={{ color: "#98A5B3" }}>
                  {STOCKS[selectedStock]?.exchange} •{" "}
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleWatchlist(selectedStock)}
              style={{
                color: watchlist.includes(selectedStock)
                  ? "#F59E0B"
                  : "#98A5B3",
              }}
            >
              {watchlist.includes(selectedStock) ? (
                <Star size={18} fill="#F59E0B" />
              ) : (
                <StarOff size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Main Price Chart */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div
            className="text-xs font-semibold mb-2"
            style={{ color: "#98A5B3" }}
          >
            PRICE CHART (60 Days)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#98A5B3", fontSize: 10 }}
                interval={9}
              />
              <YAxis
                tick={{ fill: "#98A5B3", fontSize: 10 }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1B222B",
                  border: "1px solid #2A3541",
                  borderRadius: 8,
                  color: "#E7EDF5",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#2F80ED"
                fill="#2F80ED22"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          {/* Volume */}
          <div
            className="text-xs font-semibold mt-2 mb-1"
            style={{ color: "#98A5B3" }}
          >
            VOLUME
          </div>
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={chartData}>
              <Bar dataKey="volume" fill="#2F80ED44" />
              <XAxis hide />
              <YAxis hide />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RSI */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div
            className="text-xs font-semibold mb-2"
            style={{ color: "#98A5B3" }}
          >
            RSI (14)
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#98A5B3", fontSize: 9 }}
                interval={9}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#98A5B3", fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#1B222B",
                  border: "1px solid #2A3541",
                  borderRadius: 8,
                  color: "#E7EDF5",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#8B5CF6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MACD */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div
            className="text-xs font-semibold mb-2"
            style={{ color: "#98A5B3" }}
          >
            MACD (12, 26, 9)
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#98A5B3", fontSize: 9 }}
                interval={9}
              />
              <YAxis tick={{ fill: "#98A5B3", fontSize: 9 }} />
              <Tooltip
                contentStyle={{
                  background: "#1B222B",
                  border: "1px solid #2A3541",
                  borderRadius: 8,
                  color: "#E7EDF5",
                  fontSize: 11,
                }}
              />
              <Bar dataKey="histogram" fill="#2ECC7166" />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#2DD4BF"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Technical Gauge */}
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-3"
          >
            <div
              className="text-xs font-bold uppercase mb-3"
              style={{ color: "#98A5B3" }}
            >
              Technical Signals
            </div>
            <div className="flex justify-between text-xs mb-2">
              <div className="text-center">
                <div
                  className="font-bold text-base"
                  style={{ color: "#2ECC71" }}
                >
                  {buySignals}
                </div>
                <div style={{ color: "#98A5B3" }}>Buy</div>
              </div>
              <div className="text-center">
                <div
                  className="font-bold text-base"
                  style={{ color: "#F59E0B" }}
                >
                  {neutralSignals}
                </div>
                <div style={{ color: "#98A5B3" }}>Neutral</div>
              </div>
              <div className="text-center">
                <div
                  className="font-bold text-base"
                  style={{ color: "#E74C3C" }}
                >
                  {sellSignals}
                </div>
                <div style={{ color: "#98A5B3" }}>Sell</div>
              </div>
            </div>
            <div className="flex rounded overflow-hidden h-2 mt-2">
              <div style={{ flex: buySignals, background: "#2ECC71" }} />
              <div style={{ flex: neutralSignals, background: "#F59E0B" }} />
              <div style={{ flex: sellSignals, background: "#E74C3C" }} />
            </div>
            <div className="mt-3 text-xs" style={{ color: "#98A5B3" }}>
              RSI:{" "}
              <span
                style={{
                  color:
                    rsiLast < 30
                      ? "#2ECC71"
                      : rsiLast > 70
                        ? "#E74C3C"
                        : "#E7EDF5",
                }}
              >
                {rsiLast.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Fundamentals */}
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-3"
          >
            <div
              className="text-xs font-bold uppercase mb-3"
              style={{ color: "#98A5B3" }}
            >
              Fundamentals
            </div>
            {Object.entries(fundamentals).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-0.5">
                <span style={{ color: "#98A5B3" }}>{k}</span>
                <span style={{ color: "#E7EDF5" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* News Sentiment */}
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-3"
          >
            <div
              className="text-xs font-bold uppercase mb-2"
              style={{ color: "#98A5B3" }}
            >
              News Sentiment
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-sm font-bold"
                style={{
                  color: bullishCount > bearishCount ? "#2ECC71" : "#E74C3C",
                }}
              >
                {bullishCount > bearishCount
                  ? "BULLISH"
                  : bullishCount < bearishCount
                    ? "BEARISH"
                    : "NEUTRAL"}
              </span>
              <span className="text-xs" style={{ color: "#98A5B3" }}>
                {recentNews.filter((n) => n.sentiment === "bullish").length}/
                {recentNews.length} bullish
              </span>
            </div>
            {recentNews.slice(0, 3).map((n) => (
              <div key={n.id} className="text-xs mb-1.5 flex items-start gap-1">
                <span
                  className="shrink-0 px-1 rounded text-xs"
                  style={{
                    background:
                      n.sentiment === "bullish"
                        ? "#2ECC7122"
                        : n.sentiment === "bearish"
                          ? "#E74C3C22"
                          : "#F59E0B22",
                    color:
                      n.sentiment === "bullish"
                        ? "#2ECC71"
                        : n.sentiment === "bearish"
                          ? "#E74C3C"
                          : "#F59E0B",
                  }}
                >
                  {n.sentiment.toUpperCase().slice(0, 4)}
                </span>
                <span style={{ color: "#98A5B3" }} className="line-clamp-1">
                  {n.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Orders + Portfolio */}
      <div className="flex flex-col gap-4">
        {/* Order Form */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div
            className="text-xs font-bold uppercase mb-3"
            style={{ color: "#98A5B3" }}
          >
            Place Order
          </div>
          <div className="flex gap-1 mb-3">
            <button
              type="button"
              onClick={() => setOrderSide("buy")}
              className="flex-1 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                background: orderSide === "buy" ? "#2ECC71" : "#202A34",
                color: orderSide === "buy" ? "#0E1217" : "#98A5B3",
              }}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setOrderSide("sell")}
              className="flex-1 py-1.5 rounded text-xs font-bold transition-all"
              style={{
                background: orderSide === "sell" ? "#E74C3C" : "#202A34",
                color: orderSide === "sell" ? "#fff" : "#98A5B3",
              }}
            >
              SELL
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs" style={{ color: "#98A5B3" }}>
                Stock
              </div>
              <div
                className="mt-0.5 text-xs font-semibold px-2 py-1.5 rounded"
                style={{ background: "#202A34", color: "#2F80ED" }}
              >
                {selectedStock}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: "#98A5B3" }}>
                Quantity
              </div>
              <input
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                className="w-full mt-0.5 px-2 py-1.5 rounded text-xs outline-none"
                style={{
                  background: "#202A34",
                  border: "1px solid #2A3541",
                  color: "#E7EDF5",
                }}
              />
            </div>
            <div>
              <div className="text-xs" style={{ color: "#98A5B3" }}>
                Order Type
              </div>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full mt-0.5 px-2 py-1.5 rounded text-xs outline-none"
                style={{
                  background: "#202A34",
                  border: "1px solid #2A3541",
                  color: "#E7EDF5",
                }}
              >
                <option>Market</option>
                <option>Limit</option>
                <option>Stop Loss</option>
              </select>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span style={{ color: "#98A5B3" }}>Est. Value</span>
              <span style={{ color: "#E7EDF5" }}>
                {(
                  currentPrice * Number.parseInt(orderQty || "0")
                ).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={placeOrder}
            className="w-full mt-3 py-2 rounded text-xs font-bold"
            style={{
              background: orderSide === "buy" ? "#2ECC71" : "#E74C3C",
              color: orderSide === "buy" ? "#0E1217" : "#fff",
            }}
          >
            {orderSide === "buy" ? "BUY" : "SELL"} {selectedStock}
          </button>
          {orderMsg && (
            <div
              className="mt-2 text-xs text-center"
              style={{ color: "#2ECC71" }}
            >
              {orderMsg}
            </div>
          )}
        </div>

        {/* Portfolio Summary */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div
            className="text-xs font-bold uppercase mb-3"
            style={{ color: "#98A5B3" }}
          >
            Portfolio
          </div>
          <div className="text-xl font-bold">₹1,24,350.00</div>
          <div
            className="flex items-center gap-1 text-sm mt-0.5"
            style={{ color: "#2ECC71" }}
          >
            <TrendingUp size={14} /> +₹24,350 (+24.35%)
          </div>
          <div className="mt-3 space-y-2">
            {[
              { s: "RELIANCE", qty: 5, avg: 2780, curr: 2847 },
              { s: "TCS", qty: 2, avg: 3500, curr: 3621 },
              { s: "AAPL", qty: 10, avg: 182, curr: 189 },
            ].map((p) => (
              <div
                key={p.s}
                className="flex items-center justify-between text-xs"
              >
                <div>
                  <div style={{ color: "#E7EDF5" }}>{p.s}</div>
                  <div style={{ color: "#98A5B3" }}>
                    Qty: {p.qty} · Avg: {p.avg}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ color: "#E7EDF5" }}>{p.curr}</div>
                  <div style={{ color: "#2ECC71" }}>
                    +{(((p.curr - p.avg) / p.avg) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-3"
        >
          <div
            className="text-xs font-bold uppercase mb-3"
            style={{ color: "#98A5B3" }}
          >
            Activity Feed
          </div>
          <div className="space-y-2">
            {[
              {
                action: "BUY",
                sym: "TCS",
                qty: 2,
                price: 3600,
                time: "10:32 AM",
              },
              {
                action: "SELL",
                sym: "WIPRO",
                qty: 5,
                price: 520,
                time: "9:45 AM",
              },
              {
                action: "BUY",
                sym: "AAPL",
                qty: 10,
                price: 185,
                time: "Yesterday",
              },
            ].map((t) => (
              <div
                key={t.time + t.sym}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 rounded font-bold text-xs"
                    style={{
                      background:
                        t.action === "BUY" ? "#2ECC7122" : "#E74C3C22",
                      color: t.action === "BUY" ? "#2ECC71" : "#E74C3C",
                    }}
                  >
                    {t.action}
                  </span>
                  <span style={{ color: "#E7EDF5" }}>
                    {t.sym} ×{t.qty}
                  </span>
                </div>
                <div className="text-right">
                  <div style={{ color: "#E7EDF5" }}>@{t.price}</div>
                  <div style={{ color: "#98A5B3" }}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
