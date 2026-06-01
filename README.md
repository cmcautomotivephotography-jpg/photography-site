# Aperture Studio — Photography Website

A clean, modern, mobile-responsive site for a real estate & commercial
photography business, built with **Next.js (App Router)** + **TypeScript** and a
**Supabase**-backed booking form.

- **Home** (`/`) — hero, services, portfolio teaser, booking CTA
- **Portfolio** (`/portfolio`) — filterable image grid (Real Estate / Commercial)
- **Booking** (`/booking`) — inquiry form that writes to Supabase `clients` + `jobs`
- **About** (`/about`) — bio + headshot placeholder

---

## 1. Run it locally

```bash
# from inside the photography-site folder
npm install
cp .env.local.example .env.local   # then add your Supabase keys (step 2)
npm run dev
```

Open **http://localhost:3000**.

> The site runs and looks complete even before you add Supabase keys — only the
> booking form needs them in order to save inquiries.

---

## 2. Where to paste your Supabase URL and anon key

1. In the [Supabase dashboard](https://supabase.com/dashboard), open your project.
2. Go to **Project Settings → API**.
3. Copy these two values into **`.env.local`** (create it from `.env.local.example`):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co   # "Project URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...                       # "anon / public" key
```

4. **Restart** the dev server (`Ctrl+C`, then `npm run dev`) so it picks up the changes.

---

## 3. Set up the database tables

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents
of [`supabase-schema.sql`](./supabase-schema.sql), and click **Run**.

This creates (or safely skips if they already exist):

| Table     | Key columns |
|-----------|-------------|
| `clients` | `client_id`, `first_name`, `last_name`, `company`, `phone`, `email` (unique) |
| `jobs`    | `job_id`, `client_id` → clients, `job_type`, `status` (default `Inquiry`), `description`, `preferred_shoot_date`, `message` |

It also creates a `submit_inquiry()` function that the booking form calls. On
submit, that function **finds or creates a client by email**, then **creates a
job linked to that client with status `Inquiry`** — atomically.

> **Already have `clients` / `jobs` tables?** Great — the script won't overwrite
> them. Just make sure the column names above match yours. If they differ, edit
> the `INSERT` statements inside `submit_inquiry()` in `supabase-schema.sql`.

> **Why a function instead of writing to the tables directly?** It lets us keep
> Row Level Security fully locked down, so your clients' contact details can
> never be read with the public anon key. The form can only *submit* inquiries.

---

## 4. Make it yours (customize)

| What | Where |
|------|-------|
| Business name, tagline, email, phone, socials | [`src/lib/site.ts`](./src/lib/site.ts) |
| Portfolio images & categories | [`src/lib/portfolio.ts`](./src/lib/portfolio.ts) |
| Bio + headshot | [`src/app/about/page.tsx`](./src/app/about/page.tsx) |
| Colors / fonts / theme | `:root` at the top of [`src/app/globals.css`](./src/app/globals.css) |

**Swapping in real portfolio photos:** drop image files in `public/portfolio/`
and set a `src` on the item in `src/lib/portfolio.ts`, e.g.
`{ id: 1, title: "Modern Kitchen", category: "real-estate", src: "/portfolio/kitchen.jpg" }`.
Tiles without a `src` show a styled placeholder.

---

## 5. Push to GitHub

```bash
# from inside the photography-site folder
git init
git add .
git commit -m "Initial commit: photography site"

# create an empty repo on github.com first (no README/.gitignore), then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

> `.env.local` is gitignored, so your Supabase keys are **never** committed.

---

## 6. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and **Import** your GitHub repo.
2. Framework preset auto-detects **Next.js** — leave the build settings as-is.
3. Before deploying, expand **Environment Variables** and add the same two keys
   from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Every future `git push` to `main` auto-deploys.

> If you add the env vars *after* the first deploy, trigger a redeploy
> (**Deployments → ⋯ → Redeploy**) so they take effect.

---

## Project structure

```
photography-site/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # header + footer shell, fonts, metadata
│  │  ├─ globals.css           # all styling (dark, neutral theme)
│  │  ├─ page.tsx              # Home
│  │  ├─ portfolio/page.tsx    # Portfolio
│  │  ├─ booking/page.tsx      # Booking
│  │  ├─ about/page.tsx        # About
│  │  └─ api/booking/route.ts  # POST handler -> Supabase
│  ├─ components/
│  │  ├─ Header.tsx            # responsive nav
│  │  ├─ Footer.tsx
│  │  ├─ PortfolioGrid.tsx     # filterable grid (client component)
│  │  └─ BookingForm.tsx       # validated inquiry form (client component)
│  └─ lib/
│     ├─ site.ts               # brand/contact config
│     ├─ portfolio.ts          # portfolio data
│     └─ supabase.ts           # Supabase client factory
├─ supabase-schema.sql         # tables + RLS + submit_inquiry()
├─ .env.local.example
└─ ...
```

Built with Next.js, React, and Supabase.
