"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessagesSquare, Zap, Globe, BarChart2 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/overview", label: "Overview",     icon: BarChart2 },
  { href: "/",         label: "Dashboard",    icon: LayoutDashboard },
  { href: "/debate",   label: "Agent Debate", icon: MessagesSquare },
  { href: "/research", label: "Research",     icon: Globe },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 h-screen shrink-0 flex flex-col z-50"
      style={{
        width: "var(--sidebar-width)",
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-light)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--viega-yellow)" }}
          >
            <span style={{ color: "#000", fontWeight: 900, fontSize: "15px", letterSpacing: "-0.04em", fontFamily: "var(--font-sans)" }}>V</span>
          </div>
          <div>
            <div
              style={{
                color: "var(--text)",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
              }}
            >
              Viega
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "10px", letterSpacing: "0.06em" }}>
              Compass
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-4" style={{ height: "1px", backgroundColor: "var(--border-light)" }} />

      {/* Section label */}
      <div className="px-5 mb-2">
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150"
              style={{
                backgroundColor: active ? "var(--viega-yellow-dim)" : "transparent",
                borderLeft: active ? "2px solid var(--viega-yellow)" : "2px solid transparent",
                boxShadow: active ? "var(--viega-yellow-glow)" : "none",
              }}
            >
              <Icon
                size={14}
                style={{
                  color: active ? "var(--viega-yellow)" : "var(--text-muted)",
                  strokeWidth: active ? 2.5 : 1.8,
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--viega-yellow)" : "var(--text-secondary)",
                  letterSpacing: active ? "0.01em" : "0",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mx-3 mb-4 rounded-lg" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border-light)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: "var(--build)", animation: "pulseGreen 2s ease-in-out infinite" }}
            />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--build)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live
            </span>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={9} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            gemini-2.5-flash
          </span>
        </div>
      </div>
    </aside>
  );
}
