"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessagesSquare, Globe, BarChart2, Inbox, Radar } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/overview",       label: "Overview",      icon: BarChart2, indent: false },
  { href: "/overview/radar", label: "Signal Radar",  icon: Radar,     indent: true  },
  { href: "/",               label: "Dashboard",     icon: LayoutDashboard, indent: false },
  { href: "/queue",          label: "Action Queue",  icon: Inbox,     indent: false },
  { href: "/debate",         label: "Agent Debate",  icon: MessagesSquare, indent: false },
  { href: "/research",       label: "Research",      icon: Globe,     indent: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        width: "var(--sidebar-width)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "0.6px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              backgroundColor: "#ffe600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#000", fontWeight: 900, fontSize: "16px", letterSpacing: "-0.04em" }}>V</span>
          </div>
          <div>
            <div style={{ color: "var(--text)", fontWeight: 800, fontSize: "14px", letterSpacing: "0.04em", fontFamily: "var(--font-sans)" }}>
              Viega
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "11px", letterSpacing: "0.04em" }}>
              Compass
            </div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "0 20px 8px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.map(({ href, label, icon: Icon, indent }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                paddingLeft: indent ? "28px" : "12px",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "all 0.12s",
                backgroundColor: active ? "var(--accent)" : "transparent",
              }}
            >
              <Icon
                size={indent ? 13 : 15}
                style={{
                  color: active ? "#ffffff" : indent ? "var(--text-muted)" : "var(--text-muted)",
                  strokeWidth: active ? 2.5 : 1.8,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: indent ? "12px" : "13px",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#ffffff" : "var(--text-secondary)",
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
      <div style={{ margin: "0 10px 16px", padding: "14px 12px", borderRadius: "10px", backgroundColor: "var(--surface)", border: "0.6px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--build)",
                animation: "pulseGreen 2s ease-in-out infinite",
              }}
            />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--build)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Live
            </span>
          </div>
          <ThemeToggle />
        </div>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          gemini-2.5-flash
        </span>
      </div>
    </aside>
  );
}
