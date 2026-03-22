import { TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STOCKS, getCurrentPrice } from "../data/mockData";

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface Trade {
  id: number;
  side: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  time: string;
  total: number;
}

const INITIAL_CASH = 100000;

const INITIAL_TRADES: Trade[] = [
  {
    id: 1,
    side: "BUY",
    symbol: "RELIANCE",
    quantity: 5,
    price: 2780,
    time: "3 days ago",
    total: 13900,
  },
  {
    id: 2,
    side: "BUY",
    symbol: "TCS",
    quantity: 2,
    price: 3500,
    time: "2 days ago",
    total: 7000,
  },
  {
    id: 3,
    side: "BUY",
    symbol: "AAPL",
    quantity: 10,
    price: 182,
    time: "1 day ago",
    total: 1820,
  },
];

const INITIAL_POSITIONS: Position[] = [
  {
    symbol: "RELIANCE",
    quantity: 5,
    avgPrice: 2780,
    currentPrice: getCurrentPrice("RELIANCE"),
  },
  {
    symbol: "TCS",
    quantity: 2,
    avgPrice: 3500,
    currentPrice: getCurrentPrice("TCS"),
  },
  {
    symbol: "AAPL",
    quantity: 10,
    avgPrice: 182,
    currentPrice: getCurrentPrice("AAPL"),
  },
];

const INITIAL_CASH_BALANCE = INITIAL_CASH - 13900 - 7000 - 1820;

export default function PaperTrading() {
  const [cash, setCash] = useState(INITIAL_CASH_BALANCE);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [symbol, setSymbol] = useState("RELIANCE");
  const [qty, setQty] = useState("5");
  const [orderType, setOrderType] = useState("Market");
  const [msg, setMsg] = useState("");

  const currentPrice = useMemo(() => getCurrentPrice(symbol), [symbol]);

  const totalPositionValue = positions.reduce(
    (sum, p) => sum + p.quantity * p.currentPrice,
    0,
  );
  const totalCost = positions.reduce(
    (sum, p) => sum + p.quantity * p.avgPrice,
    0,
  );
  const totalPnL = totalPositionValue - totalCost;
  const totalValue = cash + totalPositionValue;
  const totalReturn = ((totalValue - INITIAL_CASH) / INITIAL_CASH) * 100;

  // Portfolio history for chart
  const portfolioHistory = useMemo(() => {
    const data: { date: string; value: number }[] = [];
    let v = INITIAL_CASH;
    for (let i = 30; i >= 0; i--) {
      const noise = (Math.random() - 0.47) * 1200;
      v = Math.max(v + noise, INITIAL_CASH * 0.8);
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().slice(5, 10),
        value: Number.parseFloat(v.toFixed(2)),
      });
    }
    data[data.length - 1].value = totalValue;
    return data;
  }, [totalValue]);

  function executeTrade() {
    const quantity = Number.parseInt(qty);
    if (!quantity || quantity <= 0) {
      setMsg("Invalid quantity");
      return;
    }

    const price = currentPrice;
    const total = price * quantity;

    if (side === "BUY") {
      if (total > cash) {
        setMsg("Insufficient cash balance");
        return;
      }
      setCash((prev) => prev - total);
      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === symbol);
        if (existing) {
          return prev.map((p) =>
            p.symbol === symbol
              ? {
                  ...p,
                  quantity: p.quantity + quantity,
                  avgPrice:
                    (p.avgPrice * p.quantity + price * quantity) /
                    (p.quantity + quantity),
                  currentPrice: price,
                }
              : p,
          );
        }
        return [
          ...prev,
          { symbol, quantity, avgPrice: price, currentPrice: price },
        ];
      });
    } else {
      const pos = positions.find((p) => p.symbol === symbol);
      if (!pos || pos.quantity < quantity) {
        setMsg("Insufficient position");
        return;
      }
      setCash((prev) => prev + total);
      setPositions((prev) =>
        prev
          .map((p) =>
            p.symbol === symbol
              ? { ...p, quantity: p.quantity - quantity, currentPrice: price }
              : p,
          )
          .filter((p) => p.quantity > 0),
      );
    }

    setTrades((prev) => [
      {
        id: Date.now(),
        side,
        symbol,
        quantity,
        price,
        time: "Just now",
        total,
      },
      ...prev,
    ]);
    setMsg(`${side} ${quantity} ${symbol} @ ${price.toFixed(2)} executed!`);
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Portfolio Value",
            value: `₹${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            color: "#E7EDF5",
            sub: `Return: ${totalReturn > 0 ? "+" : ""}${totalReturn.toFixed(2)}%`,
            subColor: totalReturn >= 0 ? "#2ECC71" : "#E74C3C",
          },
          {
            label: "Cash Balance",
            value: `₹${cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            color: "#E7EDF5",
            sub: `${((cash / totalValue) * 100).toFixed(1)}% of portfolio`,
            subColor: "#98A5B3",
          },
          {
            label: "Invested Value",
            value: `₹${totalPositionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            color: "#E7EDF5",
            sub: `${positions.length} positions`,
            subColor: "#98A5B3",
          },
          {
            label: "Unrealized P&L",
            value: `${totalPnL >= 0 ? "+" : ""}₹${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            color: totalPnL >= 0 ? "#2ECC71" : "#E74C3C",
            sub: `${((totalPnL / totalCost) * 100 || 0).toFixed(2)}%`,
            subColor: totalPnL >= 0 ? "#2ECC71" : "#E74C3C",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              {stat.label}
            </div>
            <div
              className="text-xl font-bold mt-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: stat.subColor }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
        <div className="space-y-4">
          {/* Portfolio Chart */}
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div
              className="text-xs font-bold uppercase mb-3"
              style={{ color: "#98A5B3" }}
            >
              Portfolio Value (30 Days)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={portfolioHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#98A5B3", fontSize: 10 }}
                  interval={4}
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
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [
                    `₹${v.toLocaleString()}`,
                    "Portfolio",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2F80ED"
                  fill="#2F80ED22"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Positions Table */}
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="text-sm font-bold mb-3">Open Positions</div>
            {positions.length === 0 ? (
              <div
                className="text-sm text-center py-4"
                style={{ color: "#98A5B3" }}
              >
                No open positions
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #2A3541" }}>
                    {[
                      "Symbol",
                      "Qty",
                      "Avg Price",
                      "Current",
                      "P&L",
                      "P&L %",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left pb-2 text-xs font-semibold uppercase"
                        style={{ color: "#98A5B3" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => {
                    const pnl = (p.currentPrice - p.avgPrice) * p.quantity;
                    const pnlPct =
                      ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100;
                    return (
                      <tr
                        key={p.symbol}
                        style={{ borderBottom: "1px solid #2A3541" }}
                      >
                        <td
                          className="py-2.5 font-semibold"
                          style={{ color: "#2F80ED" }}
                        >
                          {p.symbol}
                        </td>
                        <td style={{ color: "#E7EDF5" }}>{p.quantity}</td>
                        <td style={{ color: "#E7EDF5" }}>
                          {p.avgPrice.toFixed(2)}
                        </td>
                        <td style={{ color: "#E7EDF5" }}>
                          {p.currentPrice.toFixed(2)}
                        </td>
                        <td style={{ color: pnl >= 0 ? "#2ECC71" : "#E74C3C" }}>
                          {pnl >= 0 ? "+" : ""}
                          {pnl.toFixed(2)}
                        </td>
                        <td
                          style={{ color: pnlPct >= 0 ? "#2ECC71" : "#E74C3C" }}
                        >
                          {pnlPct >= 0 ? "+" : ""}
                          {pnlPct.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Trades History */}
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="text-sm font-bold mb-3">Trade History</div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A3541" }}>
                  {["Side", "Symbol", "Qty", "Price", "Total", "Time"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left pb-2 text-xs font-semibold uppercase"
                        style={{ color: "#98A5B3" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #2A3541" }}>
                    <td className="py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background:
                            t.side === "BUY" ? "#2ECC7122" : "#E74C3C22",
                          color: t.side === "BUY" ? "#2ECC71" : "#E74C3C",
                        }}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td style={{ color: "#E7EDF5" }}>{t.symbol}</td>
                    <td style={{ color: "#E7EDF5" }}>{t.quantity}</td>
                    <td style={{ color: "#E7EDF5" }}>{t.price.toFixed(2)}</td>
                    <td style={{ color: "#E7EDF5" }}>
                      {t.total.toLocaleString()}
                    </td>
                    <td style={{ color: "#98A5B3" }}>{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Form */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-4 h-fit space-y-3"
        >
          <div
            className="text-sm font-bold uppercase"
            style={{ color: "#98A5B3" }}
          >
            New Order
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSide("BUY")}
              className="flex-1 py-2 rounded text-sm font-bold"
              style={{
                background: side === "BUY" ? "#2ECC71" : "#202A34",
                color: side === "BUY" ? "#0E1217" : "#98A5B3",
              }}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setSide("SELL")}
              className="flex-1 py-2 rounded text-sm font-bold"
              style={{
                background: side === "SELL" ? "#E74C3C" : "#202A34",
                color: side === "SELL" ? "#fff" : "#98A5B3",
              }}
            >
              SELL
            </button>
          </div>

          <div>
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              Stock
            </div>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "#202A34",
                border: "1px solid #2A3541",
                color: "#E7EDF5",
              }}
            >
              {Object.keys(STOCKS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div
            className="flex justify-between text-xs"
            style={{ color: "#98A5B3" }}
          >
            <span>Current Price</span>
            <span style={{ color: "#E7EDF5" }}>{currentPrice.toFixed(2)}</span>
          </div>

          <div>
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              Quantity
            </div>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
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
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
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

          <div className="p-3 rounded" style={{ background: "#202A34" }}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: "#98A5B3" }}>Order Value</span>
              <span style={{ color: "#E7EDF5" }}>
                ₹
                {(currentPrice * Number.parseInt(qty || "0")).toLocaleString(
                  undefined,
                  { maximumFractionDigits: 0 },
                )}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "#98A5B3" }}>Available Cash</span>
              <span style={{ color: "#2ECC71" }}>
                ₹{cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={executeTrade}
            className="w-full py-2.5 rounded text-sm font-bold"
            style={{
              background: side === "BUY" ? "#2ECC71" : "#E74C3C",
              color: side === "BUY" ? "#0E1217" : "#fff",
            }}
          >
            {side} {symbol}
          </button>

          {msg && (
            <div
              className="text-xs text-center p-2 rounded"
              style={{
                background: msg.includes("Insufficient")
                  ? "#E74C3C22"
                  : "#2ECC7122",
                color: msg.includes("Insufficient") ? "#E74C3C" : "#2ECC71",
              }}
            >
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
