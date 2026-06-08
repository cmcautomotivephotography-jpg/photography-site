import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { getLatestImageUrl } from "@/lib/portfolio";
import PortfolioTeaser from "@/components/PortfolioTeaser";

// Render on demand so the hero always reflects the latest uploaded image
// (rather than baking one in at build time).
export const dynamic = "force-dynamic";

const services = [
  {
    icon: "🏠",
    title: "Real Estate Photography",
    desc: "Bright, true-to-life interior and exterior photos, twilight shots, and staged details that help listings stand out and sell faster.",
  },
  {
    icon: "📦",
    title: "Commercial & Product Photography",
    desc: "Clean studio product shots and on-brand lifestyle imagery for menus, e-commerce, marketing, and social.",
  },
];

export default async function HomePage() {
  // Hardcoded override wins; otherwise fall back to the most recent upload.
  const heroImage = siteConfig.heroImage || (await getLatestImageUrl());

  return (
    <>
      {/* Hero */}
      <section
        className={`hero${heroImage ? " hero--image" : ""}`}
        style={
          heroImage
            ? {
                // Dark overlay (55% black) layered over the photo keeps the
                // white text readable regardless of the image.
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url("${heroImage}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        <div className="container hero-inner">
          <p className="eyebrow">{siteConfig.tagline}</p>
          <h1 className="hero-title">{siteConfig.name}</h1>
          <p className="hero-sub">{siteConfig.heroSubtitle}</p>
          <div className="hero-actions">
            <Link href="/booking" className="btn btn-primary">
              Book a Session
            </Link>
            <Link href="/portfolio" className="btn btn-outline">
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">What I Shoot</p>
          <h2 className="section-title">Photography built to sell</h2>
          <p className="section-lead">
            Two specialties, one standard: images that make spaces and products
            look their absolute best.
          </p>
          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <div className="service-icon" aria-hidden="true">
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
                <p className="text-muted">{service.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio teaser */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="teaser-head">
            <div>
              <p className="eyebrow">Recent Work</p>
              <h2 className="section-title">A look at the portfolio</h2>
            </div>
            <Link href="/portfolio" className="btn btn-outline">
              View Portfolio
            </Link>
          </div>
          <PortfolioTeaser />
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container cta-inner">
          <p className="eyebrow">Ready when you are</p>
          <h2>Let&apos;s get your shoot on the calendar</h2>
          <p className="text-muted">
            Tell me about your property or project and I&apos;ll follow up with
            availability and pricing.
          </p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <Link href="/booking" className="btn btn-primary">
              Book a Session
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
