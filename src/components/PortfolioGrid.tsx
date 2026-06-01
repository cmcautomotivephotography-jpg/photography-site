"use client";

import Image from "next/image";
import { useState } from "react";
import {
  categoryLabels,
  portfolioItems,
  type PortfolioCategory,
} from "@/lib/portfolio";

type Filter = "all" | PortfolioCategory;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "real-estate", label: "Real Estate" },
  { value: "commercial", label: "Commercial" },
];

export default function PortfolioGrid() {
  const [active, setActive] = useState<Filter>("all");

  const visible = portfolioItems.filter(
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

      <div className="portfolio-grid">
        {visible.map((item) => {
          // Low-saturation gradient derived from the id keeps placeholders
          // on-theme (neutral/dark) until real photos are added.
          const hue = (item.id * 47) % 360;
          return (
            <figure key={item.id} className="portfolio-tile">
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  className="portfolio-placeholder"
                  style={{
                    backgroundImage: `linear-gradient(135deg, hsl(${hue} 12% 16%), hsl(${hue} 14% 26%))`,
                  }}
                  aria-hidden="true"
                />
              )}
              <figcaption className="portfolio-caption">
                <span className="portfolio-tag">{categoryLabels[item.category]}</span>
                <span className="portfolio-title">{item.title}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
