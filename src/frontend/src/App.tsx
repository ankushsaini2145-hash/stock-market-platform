import { Bell, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import Analysis from "./pages/Analysis";
import Backtesting from "./pages/Backtesting";
import Dashboard from "./pages/Dashboard";
import NewsPage from "./pages/NewsPage";
import PaperTrading from "./pages/PaperTrading";

type Page = "dashboard" | "analysis" | "backtesting" | "paper-trading" | "news";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const navItems: { id: Page; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "analysis", label: "Analysis" },
    { id: "backtesting", label: "Backtesting" },
    { id: "paper-trading", label: "Paper Trading" },
    { id: "news", label: "News" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#0E1217",
        color: "#E7EDF5",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top Navigation */}
      <nav
        style={{ background: "#141A21", borderBottom: "1px solid #2A3541" }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-screen-2xl mx-auto px-4 flex items-center h-14 gap-6">
          {/* Logo */}
          <div
            className="font-bold text-lg tracking-wider"
            style={{ color: "#2F80ED" }}
          >
            ZENITH TRADE
          </div>
          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                style={{
                  color: activePage === item.id ? "#E7EDF5" : "#98A5B3",
                  background:
                    activePage === item.id ? "#2F80ED22" : "transparent",
                  borderBottom:
                    activePage === item.id
                      ? "2px solid #2F80ED"
                      : "2px solid transparent",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#98A5B3" }}
            />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 rounded-lg text-sm outline-none"
              style={{
                background: "#1B222B",
                border: "1px solid #2A3541",
                color: "#E7EDF5",
                width: 180,
              }}
            />
          </div>
          {/* Bell */}
          <button
            type="button"
            style={{ color: "#98A5B3" }}
            className="relative"
          >
            <Bell size={18} />
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
              style={{ background: "#2F80ED" }}
            />
          </button>
          {/* User */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm"
            style={{ color: "#E7EDF5" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
              style={{ background: "#2F80ED" }}
            >
              ZT
            </div>
            <span className="hidden md:block">Trader</span>
            <ChevronDown size={14} style={{ color: "#98A5B3" }} />
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-4">
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "analysis" && <Analysis />}
        {activePage === "backtesting" && <Backtesting />}
        {activePage === "paper-trading" && <PaperTrading />}
        {activePage === "news" && <NewsPage />}
      </main>

      {/* Footer */}
      <footer
        style={{ background: "#141A21", borderTop: "1px solid #2A3541" }}
        className="mt-8"
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            {[
              [
                "Platform",
                ["Dashboard", "Analysis", "Backtesting", "Paper Trading"],
              ],
              [
                "Markets",
                ["Indian Stocks", "Global Stocks", "Indices", "ETFs"],
              ],
              [
                "Resources",
                ["Documentation", "API Reference", "Blog", "Tutorials"],
              ],
              [
                "Legal",
                ["Privacy Policy", "Terms of Service", "Disclaimer", "Contact"],
              ],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <div
                  className="font-semibold mb-3"
                  style={{ color: "#E7EDF5" }}
                >
                  {heading as string}
                </div>
                {(links as string[]).map((link) => (
                  <div
                    key={link}
                    className="mb-1.5"
                    style={{ color: "#98A5B3" }}
                  >
                    {link}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div
            className="mt-6 pt-4 text-xs"
            style={{ borderTop: "1px solid #2A3541", color: "#98A5B3" }}
          >
            © 2026 Zenith Trade. For educational purposes only. Not financial
            advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
