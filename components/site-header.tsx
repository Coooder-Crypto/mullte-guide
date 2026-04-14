"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Chat" },
  { href: "/about", label: "About" },
  { href: "/studio", label: "Studio" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link href="/" className="inline-flex min-w-0 flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Mullet Guide</span>
            <span className="mt-1 truncate text-lg font-semibold text-ink">Chat-first yield routing</span>
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx("nav-link", isActive && "nav-link-active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-2 shrink-0">
            <ConnectButton />
          </div>
        </div>

        <button
          type="button"
          className="menu-button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          >
            {isOpen ? (
              <>
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7H20" />
                <path d="M4 12H20" />
                <path d="M4 17H20" />
              </>
            )}
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="mobile-menu">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx("nav-link min-h-[44px] justify-start", isActive && "nav-link-active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 w-full">
            <ConnectButton />
          </div>
        </div>
      ) : null}
    </header>
  );
}
