"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { AdminNavItem } from "./nav-types";

export default function AdminSidebarNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  // Group otomatis terbuka kalau salah satu sub-menunya sedang aktif
  const initialOpen = new Set(
    items
      .filter((item) => item.children?.some((c) => pathname.startsWith(c.href)))
      .map((item) => item.href)
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(initialOpen);

  const toggleGroup = (href: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {items.map((item) => {
        if (!item.children) {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-light text-brand-dark"
                  : "text-ink/70 hover:bg-brand-light hover:text-brand-dark"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        }

        const groupActive = item.children.some((c) => pathname.startsWith(c.href));
        const isOpen = openGroups.has(item.href) || groupActive;

        return (
          <div key={item.href}>
            <button
              type="button"
              onClick={() => toggleGroup(item.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                groupActive
                  ? "bg-brand-light text-brand-dark"
                  : "text-ink/70 hover:bg-brand-light hover:text-brand-dark"
              }`}
            >
              <span>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              <span
                className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-black/10 pl-3">
                {item.children.map((child) => {
                  const active = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-brand-light text-brand-dark"
                          : "text-ink/60 hover:bg-brand-light hover:text-brand-dark"
                      }`}
                    >
                      <span>{child.icon}</span>
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
