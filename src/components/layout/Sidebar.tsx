"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessagesSquare, Zap, Globe, BarChart2 } from "lucide-react";

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
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--viega-yellow)" }}
          >
            <span className="text-black font-black text-sm leading-none">V</span>
          </div>
          <div>
            <div
              className="text-xs font-bold tracking-[0.12em] uppercase"
              style={{ color: "var(--text)" }}
            >
              Viega
            </div>
            <div
              className="text-xs tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Compass
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-4 mb-5"
        style={{ height: "1px", backgroundColor: "var(--border-light)" }}
      />

      {/* Section label */}
      <div className="px-5 mb-2">
        <span
          className="text-[10px] font-semibold tracking-[0.15em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 group"
              style={{
                backgroundColor: active
                  ? "var(--viega-yellow-dim)"
                  : "transparent",
                color: active ? "var(--viega-yellow)" : "var(--text-secondary)",
              }}
            >
              <Icon
                size={15}
                style={{
                  color: active ? "var(--viega-yellow)" : "var(--text-muted)",
                }}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className="text-sm font-medium"
                style={{
                  color: active ? "var(--viega-yellow)" : "var(--text-secondary)",
                }}
              >
                {label}
              </span>
              {active && (
                <div
                  className="ml-auto w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--viega-yellow)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 mx-3 mb-4 rounded-lg"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border-light)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: "var(--build)",
              animation: "pulseGreen 2s ease-in-out infinite",
            }}
          />
          <span className="text-[11px] font-medium" style={{ color: "var(--build)" }}>
            Live
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={10} style={{ color: "var(--text-muted)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            gemini-2.5-flash
          </span>
        </div>
      </div>
    </aside>
  );
}
