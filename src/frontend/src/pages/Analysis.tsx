import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
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
  STOCKS,
  computeBollingerBands,
  computeMACD,
  computeMovingAverages,
  computeRSI,
  getPriceHistory,
} from "../data/mockData";

const SYMBOLS = Object.keys(STOCKS);

export default function Analysis() {
  const [symbol, setSymbol] = useState("TCS");
  const [tab, setTab] = useState<"technical" | "fundamental" | "patterns">(
    "technical",
  );

  const history = useMemo(() => getPriceHistory(symbol), [symbol]);
  const closes = useMemo(() => history.map((d) => d.close), [history]);
  const rsi = useMemo(() => computeRSI(closes), [closes]);
  const macdData = useMemo(() => computeMACD(closes), [closes]);
  const bb = useMemo(() => computeBollingerBands(closes), [closes]);
  const mas = useMemo(() => computeMovingAverages(closes), [closes]);

  const chartData = useMemo(
    () =>
      history.slice(-90).map((d, i) => ({
        date: d.date.slice(5),
        close: d.close,
        upper: bb[history.length - 90 + i]?.upper,
        middle: bb[history.length - 90 + i]?.middle,
        lower: bb[history.length - 90 + i]?.lower,
        ma20: mas.ma20[history.length - 90 + i],
        ma50: mas.ma50[history.length - 90 + i],
        rsi: rsi[history.length - 90 + i],
        macd: macdData.macdLine[history.length - 90 + i],
        signal: macdData.signal[history.length - 90 + i],
        histogram: macdData.histogram[history.length - 90 + i],
      })),
    [history, bb, mas, rsi, macdData],
  );

  const fundamentals = FUNDAMENTALS[symbol] || FUNDAMENTALS.RELIANCE;
  const rsiLast = rsi[rsi.length - 1] || 50;

  const CHART_COLORS = {
    price: "#2F80ED",
    upper: "#E74C3C",
    middle: "#F59E0B",
    lower: "#2ECC71",
    ma20: "#8B5CF6",
    ma50: "#2DD4BF",
    rsi: "#8B5CF6",
    macd: "#2DD4BF",
    signal: "#F59E0B",
  };

  const patterns = [
    {
      name: "Double Bottom",
      status: "Detected",
      confidence: "78%",
      direction: "Bullish",
    },
    {
      name: "RSI Oversold",
      status: rsiLast < 30 ? "Detected" : "Not Detected",
      confidence: rsiLast < 30 ? "90%" : "-",
      direction: "Bullish",
    },
    {
      name: "Golden Cross (20/50)",
      status: "Detected",
      confidence: "82%",
      direction: "Bullish",
    },
    {
      name: "Head & Shoulders",
      status: "Not Detected",
      confidence: "-",
      direction: "Bearish",
    },
    {
      name: "MACD Bullish Crossover",
      status: "Detected",
      confidence: "71%",
      direction: "Bullish",
    },
    {
      name: "Bollinger Squeeze",
      status: "Monitoring",
      confidence: "55%",
      direction: "Neutral",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        style={{
          background: "#1B222B",
          border: "1px solid #2A3541",
          borderRadius: 12,
        }}
        className="p-4 flex items-center gap-4"
      >
        <div>
          <div className="text-xs" style={{ color: "#98A5B3" }}>
            Select Stock
          </div>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="block mt-1 px-3 py-2 rounded text-sm outline-none"
            style={{
              background: "#202A34",
              border: "1px solid #2A3541",
              color: "#E7EDF5",
            }}
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s} - {STOCKS[s].name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 ml-4">
          {(["technical", "fundamental", "patterns"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded text-sm font-medium capitalize"
              style={{
                background: tab === t ? "#2F80ED" : "#202A34",
                color: tab === t ? "#fff" : "#98A5B3",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "technical" && (
        <div className="grid grid-cols-1 gap-4">
          {/* Price with Bollinger Bands + MAs */}
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
              Price + Bollinger Bands + Moving Averages (90 Days)
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#98A5B3", fontSize: 10 }}
                  interval={14}
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
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke={CHART_COLORS.upper}
                  fill="#E74C3C11"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke={CHART_COLORS.lower}
                  fill="#2ECC7111"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="middle"
                  stroke={CHART_COLORS.middle}
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={CHART_COLORS.price}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke={CHART_COLORS.ma20}
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke={CHART_COLORS.ma50}
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {[
                ["Price", "#2F80ED"],
                ["BB Upper", "#E74C3C"],
                ["BB Middle", "#F59E0B"],
                ["BB Lower", "#2ECC71"],
                ["MA20", "#8B5CF6"],
                ["MA50", "#2DD4BF"],
              ].map(([label, color]) => (
                <div
                  key={label}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "#98A5B3" }}
                >
                  <div
                    className="w-3 h-0.5"
                    style={{ background: color as string }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* RSI */}
            <div
              style={{
                background: "#1B222B",
                border: "1px solid #2A3541",
                borderRadius: 12,
              }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="text-xs font-bold uppercase"
                  style={{ color: "#98A5B3" }}
                >
                  RSI (14)
                </div>
                <div
                  className="text-xs px-2 py-0.5 rounded font-medium"
                  style={{
                    background:
                      rsiLast < 30
                        ? "#2ECC7122"
                        : rsiLast > 70
                          ? "#E74C3C22"
                          : "#F59E0B22",
                    color:
                      rsiLast < 30
                        ? "#2ECC71"
                        : rsiLast > 70
                          ? "#E74C3C"
                          : "#F59E0B",
                  }}
                >
                  {rsiLast < 30
                    ? "OVERSOLD"
                    : rsiLast > 70
                      ? "OVERBOUGHT"
                      : "NEUTRAL"}{" "}
                  {rsiLast.toFixed(1)}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#98A5B3", fontSize: 9 }}
                    interval={14}
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
              className="p-4"
            >
              <div
                className="text-xs font-bold uppercase mb-3"
                style={{ color: "#98A5B3" }}
              >
                MACD (12, 26, 9)
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3541" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#98A5B3", fontSize: 9 }}
                    interval={14}
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
          </div>
        </div>
      )}

      {tab === "fundamental" && (
        <div className="grid grid-cols-2 gap-4">
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="text-sm font-bold mb-4">
              {symbol} - {STOCKS[symbol]?.name}
            </div>
            <div className="space-y-3">
              {Object.entries(fundamentals).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid #2A3541" }}
                >
                  <span style={{ color: "#98A5B3" }}>{k}</span>
                  <span className="font-semibold" style={{ color: "#E7EDF5" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="text-sm font-bold mb-4">Sector Comparison</div>
            <div className="space-y-2">
              {Object.entries(FUNDAMENTALS)
                .slice(0, 7)
                .map(([sym, data]) => (
                  <div
                    key={sym}
                    className="flex justify-between items-center text-xs py-1.5"
                    style={{ borderBottom: "1px solid #2A3541" }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: sym === symbol ? "#2F80ED" : "#E7EDF5" }}
                    >
                      {sym}
                    </span>
                    <span style={{ color: "#98A5B3" }}>P/E: {data["P/E"]}</span>
                    <span style={{ color: "#98A5B3" }}>ROE: {data.ROE}</span>
                    <span style={{ color: "#2ECC71" }}>
                      {data["Div Yield"]}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab === "patterns" && (
        <div
          style={{
            background: "#1B222B",
            border: "1px solid #2A3541",
            borderRadius: 12,
          }}
          className="p-4"
        >
          <div className="text-sm font-bold mb-4">
            Chart Pattern Detection - {symbol}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A3541" }}>
                {["Pattern", "Status", "Confidence", "Direction"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 pb-3 text-xs font-semibold uppercase"
                    style={{ color: "#98A5B3" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.name} style={{ borderBottom: "1px solid #2A3541" }}>
                  <td className="py-3" style={{ color: "#E7EDF5" }}>
                    {p.name}
                  </td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background:
                          p.status === "Detected"
                            ? "#2ECC7122"
                            : p.status === "Not Detected"
                              ? "#E74C3C22"
                              : "#F59E0B22",
                        color:
                          p.status === "Detected"
                            ? "#2ECC71"
                            : p.status === "Not Detected"
                              ? "#E74C3C"
                              : "#F59E0B",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ color: "#E7EDF5" }}>{p.confidence}</td>
                  <td>
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background:
                          p.direction === "Bullish"
                            ? "#2ECC7122"
                            : p.direction === "Bearish"
                              ? "#E74C3C22"
                              : "#F59E0B22",
                        color:
                          p.direction === "Bullish"
                            ? "#2ECC71"
                            : p.direction === "Bearish"
                              ? "#E74C3C"
                              : "#F59E0B",
                      }}
                    >
                      {p.direction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
