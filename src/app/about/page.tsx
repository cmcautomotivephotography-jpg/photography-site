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
          <p>A quick introduction — replace this copy and the headshot with your own.</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div className="headshot" role="img" aria-label="Headshot placeholder">
            <span>Your headshot goes here</span>
          </div>

          <div className="about-body">
            <h2>Hi, I&apos;m the photographer behind {siteConfig.name}.</h2>
            <p className="text-muted">
              This is placeholder bio copy. Use this space to tell potential
              clients who you are, your background, and what makes your work
              different. Mention the areas you serve, the gear or style you
              shoot with, and the kinds of clients you love working with.
            </p>
            <p className="text-muted">
              For real estate agents, that might mean fast turnarounds and
              listing-ready galleries. For commercial clients, it might mean a
              consistent, on-brand look across every product and campaign.
            </p>

            <h2>What I offer</h2>
            <ul className="about-list">
              <li>Real estate interior, exterior, and twilight photography</li>
              <li>Product and packaging photography for e-commerce and print</li>
              <li>Branded lifestyle and commercial imagery</li>
              <li>Fast, reliable delivery of fully edited images</li>
            </ul>

            <p style={{ marginTop: "2rem" }}>
              <Link href="/booking" className="btn btn-primary">
                Work with me
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
