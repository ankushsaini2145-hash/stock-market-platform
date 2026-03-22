import { useState } from "react";
import { NEWS, STOCKS } from "../data/mockData";

const SENTIMENTS = ["all", "bullish", "bearish", "neutral"] as const;
const _FILTERS = ["all", ...Object.keys(STOCKS)] as const;

export default function NewsPage() {
  const [sentiment, setSentiment] =
    useState<(typeof SENTIMENTS)[number]>("all");
  const [ticker, setTicker] = useState("all");

  const filtered = NEWS.filter(
    (n) =>
      (sentiment === "all" || n.sentiment === sentiment) &&
      (ticker === "all" || n.ticker === ticker),
  );

  const bullishPct = Math.round(
    (NEWS.filter((n) => n.sentiment === "bullish").length / NEWS.length) * 100,
  );
  const bearishPct = Math.round(
    (NEWS.filter((n) => n.sentiment === "bearish").length / NEWS.length) * 100,
  );
  const neutralPct = 100 - bullishPct - bearishPct;

  return (
    <div className="space-y-4">
      {/* Sentiment Overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Overall Market",
            value: bullishPct > 50 ? "BULLISH" : "BEARISH",
            pct: bullishPct,
            color: "#2ECC71",
          },
          {
            label: "Bullish News",
            value: `${NEWS.filter((n) => n.sentiment === "bullish").length}`,
            pct: bullishPct,
            color: "#2ECC71",
          },
          {
            label: "Bearish News",
            value: `${NEWS.filter((n) => n.sentiment === "bearish").length}`,
            pct: bearishPct,
            color: "#E74C3C",
          },
          {
            label: "Neutral News",
            value: `${NEWS.filter((n) => n.sentiment === "neutral").length}`,
            pct: neutralPct,
            color: "#F59E0B",
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="text-xs" style={{ color: "#98A5B3" }}>
              {card.label}
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: card.color }}
            >
              {card.value}
            </div>
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ background: "#2A3541" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${card.pct}%`, background: card.color }}
              />
            </div>
            <div className="text-xs mt-1" style={{ color: "#98A5B3" }}>
              {card.pct}%
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#1B222B",
          border: "1px solid #2A3541",
          borderRadius: 12,
        }}
        className="p-4 flex gap-4 items-center flex-wrap"
      >
        <div className="flex gap-2">
          {SENTIMENTS.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSentiment(s)}
              className="px-3 py-1 rounded text-xs capitalize font-medium"
              style={{
                background:
                  sentiment === s
                    ? s === "bullish"
                      ? "#2ECC71"
                      : s === "bearish"
                        ? "#E74C3C"
                        : s === "neutral"
                          ? "#F59E0B"
                          : "#2F80ED"
                    : "#202A34",
                color:
                  sentiment === s
                    ? s === "all"
                      ? "#fff"
                      : "#0E1217"
                    : "#98A5B3",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="px-3 py-1.5 rounded text-xs outline-none"
          style={{
            background: "#202A34",
            border: "1px solid #2A3541",
            color: "#E7EDF5",
          }}
        >
          <option value="all">All Stocks</option>
          {Object.keys(STOCKS).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-xs" style={{ color: "#98A5B3" }}>
          {filtered.length} articles
        </span>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((news) => (
          <div
            key={news.id}
            style={{
              background: "#1B222B",
              border: "1px solid #2A3541",
              borderRadius: 12,
            }}
            className="p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={{
                  background:
                    news.sentiment === "bullish"
                      ? "#2ECC7122"
                      : news.sentiment === "bearish"
                        ? "#E74C3C22"
                        : "#F59E0B22",
                  color:
                    news.sentiment === "bullish"
                      ? "#2ECC71"
                      : news.sentiment === "bearish"
                        ? "#E74C3C"
                        : "#F59E0B",
                }}
              >
                {news.sentiment.toUpperCase()}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: "#202A34", color: "#2F80ED" }}
              >
                {news.ticker}
              </span>
            </div>
            <div
              className="text-sm font-medium mb-3"
              style={{ color: "#E7EDF5" }}
            >
              {news.title}
            </div>
            <div
              className="flex justify-between text-xs"
              style={{ color: "#98A5B3" }}
            >
              <span>{news.source}</span>
              <span>{news.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
