import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name} — real estate and commercial photography.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">About</p>
          <h1>Behind the Lens</h1>
          <p>Real estate and commercial product photography across the Salt Lake City area.</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="headshot" role="img" aria-label="Headshot placeholder">
            <span>Your headshot goes here</span>
          </div>

          <div className="about-body">
            <h2>Vision That Sells</h2>
            <p className="text-muted">
              {siteConfig.name} specializes in real estate and commercial
              product photography across the Salt Lake City area. With a sharp
              eye for composition and lighting, we create images that
              don&apos;t just document a space or product — they sell it.
            </p>
            <p className="text-muted">
              Whether you&apos;re a real estate agent looking to make listings
              stand out in a competitive market, or a brand that needs product
              shots that convert browsers into buyers, we deliver edited,
              ready-to-use images that do the work for you.
            </p>
            <p className="text-muted">
              Based in South Jordan, Utah. Available throughout the Wasatch
              Front.
            </p>

            <h2>What we offer</h2>
            <ul className="about-list">
              <li>Real estate interior, exterior, and twilight photography</li>
              <li>Product and packaging photography for e-commerce and print</li>
              <li>Branded lifestyle and commercial imagery</li>
              <li>Fast, reliable delivery of fully edited images</li>
            </ul>

            <p style={{ marginTop: "2rem" }}>
              <Link href="/booking" className="btn btn-primary">
                Work with us
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
