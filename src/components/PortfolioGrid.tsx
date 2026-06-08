"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  categoryLabels,
  type PortfolioCategory,
  type PortfolioItem,
} from "@/lib/portfolio";

type Filter = "all" | PortfolioCategory;
type Status = "loading" | "ready" | "error";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "real-estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
];

export default function PortfolioGrid() {
  const [active, setActive] = useState<Filter>("all");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = items.filter(
    (item) => active === "all" || item.category === active,
  );

  return (
    <div>
      <div className="filter-bar" role="group" aria-label="Filter portfolio">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-btn ${active === f.value ? "active" : ""}`}
            aria-pressed={active === f.value}
            onClick={() => setActive(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div className="portfolio-grid" aria-busy="true" aria-label="Loading portfolio">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="portfolio-tile portfolio-tile--skeleton" />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="portfolio-empty text-muted">
          We couldn&apos;t load the portfolio right now. Please refresh to try again.
        </p>
      )}

      {status === "ready" && visible.length === 0 && (
        <p className="portfolio-empty text-muted">
          No photos here yet — check back soon.
        </p>
      )}

      {status === "ready" && visible.length > 0 && (
        <div className="portfolio-grid">
          {visible.map((item) => (
            <figure key={item.id} className="portfolio-tile">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              <figcaption className="portfolio-caption">
                <span className="portfolio-tag">{categoryLabels[item.category]}</span>
                <span className="portfolio-title">{item.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
