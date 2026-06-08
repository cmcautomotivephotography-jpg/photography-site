"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { categoryLabels, type PortfolioItem } from "@/lib/portfolio";

/**
 * Home-page teaser: shows the three most recent portfolio photos from Blob
 * storage. Falls back to on-theme placeholder tiles before any images exist so
 * the home page still looks intentional.
 */
export default function PortfolioTeaser() {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/portfolio");
        const data = res.ok ? await res.json() : { items: [] };
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items.slice(0, 3) : []);
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) {
    return (
      <div className="portfolio-grid" aria-busy="true" aria-label="Loading recent work">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="portfolio-tile portfolio-tile--skeleton" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="portfolio-grid">
        {Array.from({ length: 3 }).map((_, i) => {
          const hue = ((i + 1) * 47) % 360;
          return (
            <figure key={i} className="portfolio-tile">
              <div
                className="portfolio-placeholder"
                style={{
                  backgroundImage: `linear-gradient(135deg, hsl(${hue} 12% 16%), hsl(${hue} 14% 26%))`,
                }}
                aria-hidden="true"
              />
            </figure>
          );
        })}
      </div>
    );
  }

  return (
    <div className="portfolio-grid">
      {items.map((item) => (
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
  );
}
