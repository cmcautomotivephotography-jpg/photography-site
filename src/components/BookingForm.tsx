"use client";

import { useState } from "react";

interface FormState {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  jobType: string;
  description: string;
  preferredDate: string;
  message: string;
}

const initialState: FormState = {
  firstName: "",
  lastName: "",
  company: "",
  phone: "",
  email: "",
  jobType: "",
  description: "",
  preferredDate: "",
  message: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.phone.trim()) errors.phone = "Phone number is required.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.jobType) errors.jobType = "Please choose a job type.";
  return errors;
}

export default function BookingForm() {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setValues(initialState);
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <h3>Thank you — your inquiry is in! 🎉</h3>
        <p>
          We&apos;ve received your details and will be in touch shortly to confirm
          availability and the next steps.
        </p>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setStatus("idle")}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="firstName">
            First Name <span className="req">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={values.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            autoComplete="given-name"
          />
          {errors.firstName && <span className="field-error">{errors.firstName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="lastName">
            Last Name <span className="req">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={values.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            autoComplete="family-name"
          />
          {errors.lastName && <span className="field-error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="email">
            Email <span className="req">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
            autoComplete="email"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="phone">
            Phone <span className="req">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            autoComplete="tel"
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            type="text"
            value={values.company}
            onChange={(e) => update("company", e.target.value)}
            autoComplete="organization"
          />
        </div>

        <div className="form-field">
          <label htmlFor="jobType">
            Job Type <span className="req">*</span>
          </label>
          <select
            id="jobType"
            value={values.jobType}
            onChange={(e) => update("jobType", e.target.value)}
            aria-invalid={!!errors.jobType}
          >
            <option value="">Select a job type…</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Commercial">Commercial</option>
          </select>
          {errors.jobType && <span className="field-error">{errors.jobType}</span>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="description">Property or Job Description</label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="e.g. 3-bed single-family listing, ~2,200 sq ft, occupied"
        />
      </div>

      <div className="form-field">
        <label htmlFor="preferredDate">Preferred Shoot Date</label>
        <input
          id="preferredDate"
          type="date"
          value={values.preferredDate}
          onChange={(e) => update("preferredDate", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          rows={4}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Anything else we should know?"
        />
      </div>

      {status === "error" && (
        <div className="form-error-banner" role="alert">
          {serverError}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Submit Inquiry"}
      </button>

      <p className="form-note text-muted">
        Fields marked <span className="req">*</span> are required.
      </p>
    </form>
  );
}
