# rateusz — Mateusz Tomaszek Portfolio & CMS

A production-ready portfolio for **Mateusz Tomaszek** (creative brand: *rateusz*) — a cinematic, editorial public site plus a private admin dashboard ("Studio") where every piece of content can be edited without touching code.

- **Public site:** home (cinematic hero, featured work, about preview, photography, services, technical projects, experience, CTA — all reorderable), Work index with category filters, case-study pages at `/work/[slug]`, masonry Photography gallery, About (education + skills), Services, Experience timeline, Contact form.
- **Admin (`/admin`):** dashboard, projects (create / edit / preview drafts / publish / feature / reorder / delete), categories, photography curation, media library (Cloudinary uploads with progress, search, filters, alt-text, usage-aware delete), experience, education, skills & skill groups, services, messages inbox, homepage editor, About editor, SEO, social links, site settings (logo, favicon, CV upload, contact details), account (name / e-mail / password).

---

## 1. Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Route Handlers, `proxy.ts`) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (tokens in `app/globals.css`) · Framer Motion (subtle, respects reduced motion) · Lucide icons |
| Data | MongoDB Atlas · Mongoose 8 |
| Media | Cloudinary (signed direct browser uploads; nothing stored on local disk or in MongoDB) |
| Auth | bcrypt-hashed passwords · HS256 JWT in an HTTP-only, `SameSite=Strict`, `Secure` (prod) cookie · DB-checked token version |
| Validation | Zod 4 on every write (server) · React Hook Form + Zod on public/login forms |
| SEO | Metadata API, canonical URLs, Open Graph, Twitter cards, `robots.txt`, `sitemap.xml`, JSON-LD (Person, CreativeWork, BreadcrumbList) |

---

## 2. Project structure

```
app/
  (public)/               public site (shared Navbar/Footer layout)
    page.tsx              homepage (sections driven by Homepage settings)
    work/                 index · [slug] case study · category/[slug]
    photography/ about/ services/ experience/ contact/
    error.tsx loading.tsx
  admin/
    login/                sign-in page (public)
    (panel)/              protected CMS pages (sidebar layout)
    preview/projects/[id] draft preview (protected)
  api/
    auth/login|logout     session endpoints
    contact               public enquiry endpoint (validated, rate-limited, honeypot)
    admin/[resource]      generic CRUD: projects, categories, experience, education,
                          skills, skill-categories, services, messages (+ /reorder)
    admin/media           list/register · /sign (upload signature) · /[id] edit/delete
    admin/singletons/[key]  site | home | about settings
    admin/account         name / e-mail / password
  layout.tsx globals.css robots.ts sitemap.ts not-found.tsx
components/
  public/                 Navbar, Hero, ProjectCard/Grid, CaseStudy, PhotographyGrid, Lightbox,
                          VideoPlayer, ExperienceTimeline, SkillGroups, ServiceCard, ContactForm, …
  admin/                  AdminSidebar, ResourceManager, ProjectEditor, SingletonForm, MediaLibrary,
                          MediaPicker, MediaUploader, PhotographyManager, MessagesInbox, Feedback (toasts + confirm), fields/
  ui/                     SmartImage (Cloudinary loader), Reveal, Icon
lib/
  db/connect.ts           cached Mongoose connection
  auth/                   jwt.ts (edge-safe), session.ts (server-only), password.ts
  security/               rate-limit.ts (MongoDB-backed), request.ts
  validation/             all Zod schemas
  utils/                  slugify, sanitize, media helpers, social, cn
  api.ts cloudinary.ts email.ts defaults.ts
models/                   User, Project, Category, Media, Experience, Education, Skill, SkillCategory,
                          Service, ContactMessage, SiteSettings, HomepageSettings, AboutSettings, RateLimit
services/                 content.ts (public reads) · admin.ts · resources.ts (CRUD registry) · media-usage.ts
scripts/                  create-admin.ts · seed.ts
types/                    shared serialisable types
proxy.ts                  auth gate for /admin + CSRF origin check for /api
```

---

## 3. Requirements

- **Node.js 20.9+** (22 LTS recommended) and npm
- A **MongoDB Atlas** cluster (free tier is fine)
- A **Cloudinary** account (free tier is fine)
- Optional: a **Resend** account for e-mail notifications of new enquiries

---

## 4. Local installation

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file and fill it in (see sections 5–7)
cp .env.example .env.local

# 3. Seed initial content from the CV
npm run seed

# 4. Create the admin account (interactive; password is hidden as you type)
npm run create-admin

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin> for the dashboard.

---

## 5. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✔ | Public URL, no trailing slash (e.g. `https://rateusz.com`). Used for canonical URLs, sitemap, Open Graph. |
| `MONGODB_URI` | ✔ | MongoDB Atlas connection string. |
| `AUTH_SECRET` | ✔ | 32+ random characters used to sign sessions. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `AUTH_SESSION_HOURS` | | Session length in hours (default 12). |
| `CLOUDINARY_CLOUD_NAME` | ✔ | From the Cloudinary dashboard. |
| `CLOUDINARY_API_KEY` | ✔ | 〃 |
| `CLOUDINARY_API_SECRET` | ✔ | 〃 (server-only, never sent to the browser). |
| `CLOUDINARY_FOLDER` | | Root folder for uploads (default `rateusz`). |
| `RESEND_API_KEY` | | Enables enquiry notification e-mails. |
| `NOTIFY_FROM_EMAIL` | | Verified Resend sender, e.g. `Portfolio <noreply@yourdomain.com>`. |
| `NOTIFY_TO_EMAIL` | | Recipient (defaults to the contact e-mail in Site Settings). |

`.env.local` is git-ignored. Only `NEXT_PUBLIC_SITE_URL` is exposed to the browser; everything else is read in server code only.

---

## 6. MongoDB Atlas setup

1. Create a free cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user with a strong password (role: *Read and write to any database*).
3. **Network Access** → add your IP for local development. For Vercel, either allow `0.0.0.0/0` (access is still protected by the user/password) or use Atlas' Vercel integration.
4. **Connect → Drivers** → copy the connection string, put the user/password in, and add a database name before the `?`, e.g.
   `mongodb+srv://mateusz:<password>@cluster0.xxxxx.mongodb.net/rateusz?retryWrites=true&w=majority`
5. Paste it into `MONGODB_URI`. Indexes (unique slugs/e-mails, TTL for rate limits) are created automatically by Mongoose on first use.

---

## 7. Cloudinary setup

1. Sign up at <https://cloudinary.com> and open **Settings → API Keys**.
2. Copy *Cloud name*, *API key* and *API secret* into `.env.local`.
3. That's it — uploads use **signed** requests generated by the server, so you don't need an unsigned upload preset.

How uploads work: the admin's browser asks `/api/admin/media/sign` for a short-lived signature (admin-only), uploads the file **directly** to Cloudinary (so large videos never hit Vercel's request-size limit), then calls `/api/admin/media`, which looks the asset up via Cloudinary's Admin API, enforces the allowed folder, format and size, and stores the metadata (URL, public ID, filename, type, size, width/height, alt, caption) in MongoDB.

Allowed: JPG/JPEG, PNG, WEBP, AVIF (≤ 20 MB), MP4 (≤ 200 MB — Cloudinary's free plan caps single videos at 100 MB), PDF (≤ 15 MB, stored as a raw file so it's always downloadable). Images are served through Cloudinary with `f_auto,q_auto` and responsive widths.

---

## 8. Admin account

```bash
npm run create-admin               # prompts for name, e-mail, password (hidden)
npm run create-admin -- --reset    # reset the password for an existing admin (signs out all sessions)
```

Passwords must be at least 12 characters and mix at least three of: lowercase, uppercase, numbers, symbols. There are **no default credentials**. For a one-off non-interactive run (e.g. against production from your machine) you can set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in the shell for that single command.

---

## 9. Seeding

```bash
npm run seed            # inserts anything missing; never overwrites dashboard edits
npm run seed -- --force # resets seeded records back to the CV defaults
```

Seeds: site settings (name, brand, location, Instagram `@matis.lens`, SEO defaults), homepage hero and section order, About text, 7 project categories, 11 projects (the four Game Arts & Design projects, the music-video cinematography, Catalyst Growth short-form editing, Prince Regent social content, wildlife photography, and the three technical projects), 5 experience entries, 3 education entries, 22 skills in 3 groups, and 5 services.

Everything is taken from the CV — no invented clients, statistics, awards or outcomes. **No images are seeded**: until media is uploaded, projects show a designed typographic placeholder. Upload images in **Studio → Videos / Media** and attach them to projects, the hero, the About portrait, etc. Upload the CV PDF under **Site settings → CV**.

---

## 10. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | TypeScript, no emit |
| `npm run seed` | Seed initial content |
| `npm run create-admin` | Create / reset the admin account |

Scripts read `.env.local` via `tsx --env-file`.

---

## 11. Production build & deployment (Vercel)

1. Push the project to a GitHub repository.
2. In Vercel, **Add New → Project**, import the repo (framework preset: Next.js).
3. Add every variable from section 5 under **Settings → Environment Variables** (Production and Preview). Set `NEXT_PUBLIC_SITE_URL` to the final domain.
4. Deploy. Then, from your machine with `.env.local` pointing at the **production** database:
   ```bash
   npm run seed
   npm run create-admin
   ```
5. Add your custom domain in Vercel and update `NEXT_PUBLIC_SITE_URL` to match (redeploy).

Notes:
- Public pages use ISR (`revalidate = 3600`). Every save in the dashboard calls `revalidatePath("/", "layout")`, so changes appear immediately.
- If the database is unreachable at build time, pages render safe empty states and refresh on the next revalidation — the build itself does not fail.
- The app never writes to the local filesystem, so it runs on any serverless platform.
- To verify locally: `npm run build && npm start`.

---

## 12. Security

- **Authentication:** bcrypt (12 rounds); constant-time-ish login (bcrypt runs even for unknown e-mails); generic error messages.
- **Sessions:** signed JWT in an `HttpOnly`, `SameSite=Strict`, `Secure` (production) cookie. Every admin request is checked twice — in `proxy.ts` (signature/expiry) and in the route/page (`requireAdmin()` re-loads the user and compares `tokenVersion`, so a password change or `--reset` revokes all sessions).
- **CSRF:** SameSite=Strict cookies plus an Origin / `Sec-Fetch-Site` check that blocks cross-site `POST/PUT/PATCH/DELETE` to `/api/*`.
- **Rate limiting (MongoDB-backed, works across serverless instances):** login 20/15 min per IP and 6/15 min per account; contact form 5/hour per IP.
- **Spam:** honeypot field + minimum fill time on the contact form (bots get a fake success).
- **Input:** every write is validated with Zod; text is stripped of HTML/control characters; URLs are limited to `http(s)`/relative; video embeds are whitelisted to YouTube/Vimeo; all content is rendered as text by React (no `dangerouslySetInnerHTML` except escaped JSON-LD).
- **Uploads:** signed, folder-pinned, format-restricted Cloudinary uploads, re-verified server-side (format + size) before being accepted.
- **Headers:** CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP; `/admin` is `noindex`.
- **Privacy:** the contact e-mail is hidden publicly unless enabled in settings; enquiry IPs are stored only as salted hashes; secrets are only read in server modules (`server-only` guards).
- The CSP allows `'unsafe-inline'` scripts because Next.js injects inline bootstrapping scripts; switching to nonce-based CSP is possible but forces dynamic rendering of every page.

---

## 13. Editing content (for Mateusz)

1. Go to `/admin/login` and sign in.
2. **Projects → New project** → enter a title → choose a category → upload a cover → add gallery images → write the description → add tools → **Save** → **Preview** → **Save & publish**.
3. Drag rows in any list to reorder; click **Draft/Published** to toggle visibility; click the ★ to feature a project on the homepage.
4. **Homepage** controls the hero text, rotating roles, background (gradient, image, looping video or showreel) and the order/visibility of each homepage section.
5. **Photography** → *Add photos*, set a collection such as "Wildlife", star favourites for the homepage.
6. Always fill in **alt text** for images in the Media Library — it's shown as a warning until you do.
