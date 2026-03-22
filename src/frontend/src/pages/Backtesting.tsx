import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { STOCKS } from "../data/mockData";

const STRATEGIES = [
  {
    id: "ma_crossover",
    name: "MA Crossover (20/50)",
    description: "Buy when 20-day MA crosses above 50-day MA, sell on reversal",
  },
  {
    id: "rsi_strategy",
    name: "RSI Contrarian",
    description:
      "Buy when RSI < 30 (oversold), sell when RSI > 70 (overbought)",
  },
  {
    id: "bollinger",
    name: "Bollinger Band Bounce",
    description: "Buy when price touches lower band, sell at upper band",
  },
  {
    id: "macd",
    name: "MACD Crossover",
    description: "Buy on MACD bullish crossover, sell on bearish crossover",
  },
];

function generateEquityCurve(returnPct: number) {
  const data: { day: number; equity: number }[] = [];
  let equity = 100000;
  const daily = returnPct / 252;
  for (let i = 0; i < 252; i++) {
    const noise = (Math.random() - 0.48) * 2;
    equity *= 1 + (daily + noise / 100);
    data.push({
      day: i + 1,
      equity: Number.parseFloat(equity.toFixed(2)),
    });
  }
  return data;
}

export default function Backtesting() {
  const [strategy, setStrategy] = useState("ma_crossover");
  const [asset, setAsset] = useState("TCS");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [initialCapital, setInitialCapital] = useState("100000");
  const [results, setResults] = useState<null | {
    returnPct: number;
    maxDrawdown: number;
    sharpe: number;
    totalTrades: number;
    winRate: number;
    equityCurve: { day: number; equity: number }[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    {
      strategy: string;
      asset: string;
      returnPct: number;
      maxDrawdown: number;
      date: string;
    }[]
  >([]);

  function runBacktest() {
    setLoading(true);
    setTimeout(() => {
      const returnPct = Math.random() * 60 - 10;
      const maxDrawdown = -(Math.random() * 20 + 5);
      const sharpe = Number.parseFloat(
        (returnPct > 0
          ? Math.random() * 1.5 + 0.5
          : Math.random() * 0.5
        ).toFixed(2),
      );
      const totalTrades = Math.floor(Math.random() * 40 + 10);
      const winRate = Number.parseFloat((Math.random() * 30 + 45).toFixed(1));
      const newResult = {
        returnPct: Number.parseFloat(returnPct.toFixed(2)),
        maxDrawdown: Number.parseFloat(maxDrawdown.toFixed(2)),
        sharpe,
        totalTrades,
        winRate,
        equityCurve: generateEquityCurve(returnPct),
      };
      setResults(newResult);
      setHistory((prev) =>
        [
          {
            strategy: STRATEGIES.find((s) => s.id === strategy)!.name,
            asset,
            returnPct: newResult.returnPct,
            maxDrawdown: newResult.maxDrawdown,
            date: new Date().toLocaleDateString(),
          },
          ...prev,
        ].slice(0, 10),
      );
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Config Panel */}
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-4 space-y-4"
        >
          <div
            className="text-sm font-bold uppercase"
            style={{ color: "#98A5B3" }}
          >
            Strategy Configuration
          </div>

          <div>
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              Strategy
            </div>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "#202A34",
                border: "1px solid #2A3541",
                color: "#E7EDF5",
              }}
            >
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="text-xs mt-1" style={{ color: "#98A5B3" }}>
              {STRATEGIES.find((s) => s.id === strategy)?.description}
            </div>
          </div>

          <div>
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              Asset
            </div>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "#202A34",
                border: "1px solid #2A3541",
                color: "#E7EDF5",
              }}
            >
              {Object.keys(STOCKS).map((s) => (
                <option key={s} value={s}>
                  {s} - {STOCKS[s].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              Start Date
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              End Date
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
              Initial Capital (₹/$)
            </div>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded text-sm outline-none"
              style={{
                background: "#202A34",
                border: "1px solid #2A3541",
                color: "#E7EDF5",
              }}
            />
          </div>

          <button
            type="button"
            onClick={runBacktest}
            disabled={loading}
            className="w-full py-2.5 rounded text-sm font-bold transition-opacity"
            style={{
              background: "#2F80ED",
              color: "#fff",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Running..." : "Run Backtest"}
          </button>
        </div>

        {/* Results Panel */}
        <div className="col-span-2 space-y-4">
          {!results ? (
            <div
              style={{
                background: "#1B222B",
                border: "1px solid #2A3541",
                borderRadius: 12,
              }}
              className="p-8 text-center"
            >
              <div className="text-4xl mb-4">📊</div>
              <div className="text-sm" style={{ color: "#98A5B3" }}>
                Configure your strategy and run a backtest to see results
              </div>
            </div>
          ) : (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  {
                    label: "Total Return",
                    value: `${results.returnPct > 0 ? "+" : ""}${results.returnPct}%`,
                    color: results.returnPct > 0 ? "#2ECC71" : "#E74C3C",
                  },
                  {
                    label: "Max Drawdown",
                    value: `${results.maxDrawdown}%`,
                    color: "#E74C3C",
                  },
                  {
                    label: "Sharpe Ratio",
                    value: results.sharpe.toString(),
                    color: results.sharpe > 1 ? "#2ECC71" : "#F59E0B",
                  },
                  {
                    label: "Total Trades",
                    value: results.totalTrades.toString(),
                    color: "#E7EDF5",
                  },
                  {
                    label: "Win Rate",
                    value: `${results.winRate}%`,
                    color: results.winRate > 50 ? "#2ECC71" : "#E74C3C",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    style={{
                      background: "#1B222B",
                      border: "1px solid #2A3541",
                      borderRadius: 12,
                    }}
                    className="p-3 text-center"
                  >
                    <div className="text-xs" style={{ color: "#98A5B3" }}>
                      {m.label}
                    </div>
                    <div
                      className="text-xl font-bold mt-1"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Equity Curve */}
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
                  Equity Curve
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={results.equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#98A5B3", fontSize: 10 }}
                      label={{
                        value: "Trading Days",
                        fill: "#98A5B3",
                        fontSize: 10,
                        position: "insideBottom",
                        offset: -2,
                      }}
                    />
                    <YAxis tick={{ fill: "#98A5B3", fontSize: 10 }} />
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
                        "Portfolio Value",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke={results.returnPct > 0 ? "#2ECC71" : "#E74C3C"}
                      fill={results.returnPct > 0 ? "#2ECC7122" : "#E74C3C22"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>

      {/* History Table */}
      {history.length > 0 && (
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-4"
        >
          <div className="text-sm font-bold mb-3">Backtest History</div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A3541" }}>
                {["Strategy", "Asset", "Return", "Max Drawdown", "Date"].map(
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
              {history.map((h) => (
                <tr
                  key={h.strategy + h.asset + h.date}
                  style={{ borderBottom: "1px solid #2A3541" }}
                >
                  <td className="py-2" style={{ color: "#E7EDF5" }}>
                    {h.strategy}
                  </td>
                  <td style={{ color: "#2F80ED" }}>{h.asset}</td>
                  <td
                    style={{ color: h.returnPct > 0 ? "#2ECC71" : "#E74C3C" }}
                  >
                    {h.returnPct > 0 ? "+" : ""}
                    {h.returnPct}%
                  </td>
                  <td style={{ color: "#E74C3C" }}>{h.maxDrawdown}%</td>
                  <td style={{ color: "#98A5B3" }}>{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
