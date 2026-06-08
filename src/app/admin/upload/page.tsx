"use client";

import Image from "next/image";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { ADMIN_PASSWORD } from "@/lib/admin";
import {
  categoryLabels,
  categoryPrefixes,
  type PortfolioCategory,
} from "@/lib/portfolio";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

/** Make a safe, lowercase filename while keeping the extension. */
function sanitizeFilename(name: string): string {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot > -1 ? lower.slice(dot) : "";
  const base =
    (dot > -1 ? lower.slice(0, dot) : lower)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "photo";
  return `${base}${ext}`;
}

type UploadState = "idle" | "uploading" | "success" | "error";

function CategoryUploader({
  category,
  password,
}: {
  category: PortfolioCategory;
  password: string;
}) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const inputId = `file-${category}`;

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setState("error");
      setError("Only JPG and PNG images are allowed.");
      return;
    }

    setError("");
    setProgress(0);
    setState("uploading");

    try {
      const pathname = `${categoryPrefixes[category]}${sanitizeFilename(file.name)}`;
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: JSON.stringify({ password }),
        contentType: file.type,
        onUploadProgress: ({ percentage }) =>
          setProgress(Math.round(percentage)),
      });
      setUploadedUrl(result.url);
      setState("success");
    } catch (e) {
      setState("error");
      setError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
    }
  }

  return (
    <div className="upload-card">
      <h2>{categoryLabels[category]}</h2>
      <p className="text-muted upload-hint">
        Files are saved with the <code>{categoryPrefixes[category]}</code> prefix
        and show up under {categoryLabels[category]} on the portfolio.
      </p>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png"
        className="upload-input"
        disabled={state === "uploading"}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ""; // allow re-selecting the same file
          handleFile(file);
        }}
      />
      <label htmlFor={inputId} className="btn btn-outline upload-pick">
        {state === "uploading"
          ? `Uploading… ${progress}%`
          : state === "success"
            ? "Upload another"
            : "Choose JPG or PNG"}
      </label>

      {state === "error" && <p className="field-error upload-error">{error}</p>}

      {state === "success" && uploadedUrl && (
        <div className="upload-result">
          <p className="upload-success-msg">Uploaded successfully ✓</p>
          <figure className="portfolio-tile upload-preview">
            <Image
              src={uploadedUrl}
              alt="Uploaded preview"
              fill
              sizes="(max-width: 640px) 100vw, 360px"
              style={{ objectFit: "cover" }}
            />
          </figure>
          <a
            className="text-muted upload-link"
            href={uploadedUrl}
            target="_blank"
            rel="noreferrer"
          >
            View full image
          </a>
        </div>
      )}
    </div>
  );
}

export default function AdminUploadPage() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setPassword(input);
      setAuthError("");
    } else {
      setAuthError("Incorrect password.");
    }
  }

  if (!password) {
    return (
      <section className="section">
        <div className="container admin-gate">
          <p className="eyebrow">Admin</p>
          <h1>Upload Photos</h1>
          <form onSubmit={handleLogin} className="admin-login">
            <div className="form-field">
              <label htmlFor="admin-pw">Password</label>
              <input
                id="admin-pw"
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                autoFocus
              />
              {authError && <span className="field-error">{authError}</span>}
            </div>
            <button type="submit" className="btn btn-primary">
              Unlock
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">Admin</p>
          <h1>Upload Photos</h1>
          <p>
            Add images to the portfolio. They appear on the public page
            automatically, sorted into the right section by filename.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="upload-grid">
            <CategoryUploader category="real-estate" password={password} />
            <CategoryUploader category="commercial" password={password} />
          </div>
        </div>
      </section>
    </>
  );
}
