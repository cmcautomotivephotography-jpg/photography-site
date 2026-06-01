import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-block">
          <div className="footer-brand">{siteConfig.name}</div>
          <p className="text-muted">{siteConfig.tagline}</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/about">About</Link>
          <Link href="/booking">Booking</Link>
        </nav>

        <div className="footer-contact">
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <a href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}>{siteConfig.phone}</a>
          <span className="text-muted">{siteConfig.location}</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span className="text-muted">
          © {year} {siteConfig.name}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
