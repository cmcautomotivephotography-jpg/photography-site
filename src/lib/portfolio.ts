export type PortfolioCategory = "real-estate" | "commercial";

export interface PortfolioItem {
  id: number;
  title: string;
  category: PortfolioCategory;
  /**
   * Optional image path. Leave undefined to show a styled placeholder tile.
   * To use a real photo, drop it in /public (e.g. /public/portfolio/kitchen.jpg)
   * and set src: "/portfolio/kitchen.jpg".
   */
  src?: string;
}

export const categoryLabels: Record<PortfolioCategory, string> = {
  "real-estate": "Real Estate",
  commercial: "Commercial",
};

/**
 * Placeholder portfolio data. Swap these out (or add a `src`) once you have
 * real images. The category drives the filter buttons on /portfolio.
 */
export const portfolioItems: PortfolioItem[] = [
  { id: 1, title: "Modern Kitchen", category: "real-estate" },
  { id: 2, title: "Living Room at Dusk", category: "real-estate" },
  { id: 3, title: "Product — Skincare Line", category: "commercial" },
  { id: 4, title: "Master Suite", category: "real-estate" },
  { id: 5, title: "Restaurant Interior", category: "commercial" },
  { id: 6, title: "Backyard & Pool", category: "real-estate" },
  { id: 7, title: "Product — Coffee Packaging", category: "commercial" },
  { id: 8, title: "Open Floor Plan", category: "real-estate" },
  { id: 9, title: "Brand Lifestyle Shoot", category: "commercial" },
  { id: 10, title: "Twilight Exterior", category: "real-estate" },
  { id: 11, title: "Product — Watch Detail", category: "commercial" },
  { id: 12, title: "Staged Dining Room", category: "real-estate" },
];
