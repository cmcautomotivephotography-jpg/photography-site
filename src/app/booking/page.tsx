import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Booking",
  description:
    "Request a real estate or commercial photography session. Tell us about your property or project and we'll be in touch.",
};

const steps = [
  {
    title: "Send your details",
    body: "Fill out the form with your contact info and a bit about the shoot.",
  },
  {
    title: "We confirm",
    body: "We'll reach out to lock in the date, location, and pricing.",
  },
  {
    title: "Shoot & deliver",
    body: "We capture the work and deliver edited, ready-to-use images.",
  },
];

export default function BookingPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">Booking</p>
          <h1>Request a Session</h1>
          <p>
            Share a few details about your property or project below. Required
            fields are marked with an asterisk.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container booking-layout">
          <aside className="booking-aside">
            <h2>How it works</h2>
            <ol className="booking-steps">
              {steps.map((step, i) => (
                <li key={step.title}>
                  <span className="step-num">{i + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p className="text-muted" style={{ margin: "0.2rem 0 0" }}>
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>

          <BookingForm />
        </div>
      </section>
    </>
  );
}
