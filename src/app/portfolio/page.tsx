import type { Metadata } from "next";
import PortfolioGrid from "@/components/PortfolioGrid";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A selection of recent real estate and commercial photography work.",
};

export default function PortfolioPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">Portfolio</p>
          <h1>Selected Work</h1>
          <p>
            A sampling of recent shoots. Use the filters to browse by category —
            real photos drop in here as projects wrap.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <PortfolioGrid />
        </div>
      </section>
    </>
  );
}
