# Things Written

A minimal publishing platform where you photograph handwritten text, have it transcribed by Claude's vision AI, edit it, and publish it as a post. Subscribers are notified by email.

## Architecture

```
                          ┌─────────────────────────────────────────┐
                          │           Vercel (Astro SSR)             │
                          │                                          │
Browser ──────────────────►  GET  /            → Post list           │
                          │  GET  /posts/[slug] → Rendered markdown  │
                          │  POST /api/subscribe ──────────────────────────► Supabase
                          │                                          │
                          │  POST /api/transcribe ──────────────────────────► Anthropic API
                          │                                                   (Claude Vision)
                          │  POST /api/publish ─────────────────────────────► GitHub API
                          │                          commits markdown         (triggers rebuild)
                          │  POST /api/send-email ──► Supabase (read) ──────► Resend
                          │                                          │
                          │  /admin/*  (password-protected)          │
                          └─────────────────────────────────────────┘
```

**How new posts go live:**
`Admin publishes` → GitHub commit → Vercel detects push → rebuilds site → post live at `/posts/[slug]`

## Prerequisites

- **Node.js** 18 or later
- **GitHub** account + personal access token
- **Supabase** account (free tier works)
- **Resend** account + a verified sending domain
- **Anthropic** API key
- **Vercel** account (for deployment)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in every value (see [Environment Variables](#environment-variables) below).

### 3. Supabase — create the subscribers table

1. Open your Supabase project → **SQL Editor**
2. Run the following:

```sql
CREATE TABLE subscribers (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        NOT NULL UNIQUE,
  active     BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial index for fetching active subscribers efficiently
CREATE INDEX idx_subscribers_active ON subscribers (active) WHERE active = true;

-- Enable RLS so the table is inaccessible from the client side
-- (the server uses the service_role key which bypasses RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
```

### 4. GitHub — create a Personal Access Token

1. Go to **GitHub** → Settings → Developer Settings → Personal access tokens → **Fine-grained tokens**
2. Click **Generate new token**
3. Set **Resource owner** to the account/org that owns the repo
4. Under **Repository access** → select your repo
5. Under **Permissions** → **Repository permissions** → **Contents** → set to **Read and write**
6. Copy the token into `GITHUB_TOKEN` in your `.env`

### 5. Resend — verify your sending domain

1. Log into [Resend](https://resend.com) → **Domains** → **Add Domain**
2. Add the DNS records Resend provides to your domain registrar
3. Once verified, set `RESEND_FROM_EMAIL` to an address on that domain (e.g. `hello@yourdomain.com`)

### 6. Generate a session secret

```bash
# macOS / Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

Paste the output into `SESSION_SECRET` in your `.env`.

## Environment Variables

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password to access `/admin` |
| `SESSION_SECRET` | Random string (≥32 chars) for signing session cookies |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude vision |
| `GITHUB_TOKEN` | Fine-grained PAT with Contents read+write on your repo |
| `GITHUB_OWNER` | GitHub username or org name |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | Branch to commit posts to (usually `main`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (never expose to the client) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender address on your Resend domain |
| `SITE_URL` | Full public URL, e.g. `https://yourdomain.com` |

## Local Development

```bash
npm run dev
```

The site will be available at `http://localhost:4321`.

> **Note:** The session cookie uses `secure: false` in development (controlled by `import.meta.env.PROD`), so it works over plain HTTP.

## Deployment to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add environment variables:

```bash
vercel env add ADMIN_PASSWORD
# ... repeat for all variables
```

### Option B — Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
3. Select your repo; Vercel will detect Astro automatically
4. Under **Environment Variables**, add all variables from `.env.example`
5. Click **Deploy**

After the first deploy, every new commit (including posts committed via the admin panel) will trigger an automatic rebuild.

## Using the Admin Panel

1. **Visit `/admin/login`** — enter your `ADMIN_PASSWORD`
2. **Upload a photo** — drag and drop or click to select an image of handwritten text
3. **Click "Transcribe with Claude"** — the transcribed text appears in the content area
4. **Edit** the title, slug (auto-generated), description, and content as needed
5. **Click "Publish Post"** — this commits a markdown file to `src/content/posts/[slug].md` in your GitHub repo, triggering a Vercel rebuild (~1–2 minutes)
6. **Review the email preview** — check the subject and post URL
7. **Click "Send to Subscribers"** — emails all active subscribers via Resend, or click "Skip" to publish without notifying

To log out, click the **Log out** link in the top-right of the admin page.

## Project Structure

```
src/
├── content/
│   ├── config.ts          # Frontmatter schema (Zod)
│   └── posts/             # Published markdown files (committed via GitHub API)
├── lib/
│   ├── auth.ts            # HMAC-SHA256 session cookie utilities
│   └── emailTemplate.ts   # HTML email template generator
├── layouts/
│   ├── BaseLayout.astro   # HTML shell with nav and footer
│   └── PostLayout.astro   # Extends BaseLayout with post header
├── pages/
│   ├── index.astro        # Homepage: post list + subscribe form
│   ├── posts/
│   │   └── [slug].astro   # Individual post pages (prerendered)
│   ├── admin/
│   │   ├── index.astro    # Admin dashboard
│   │   ├── login.astro    # Login page
│   │   └── logout.astro   # Clears session cookie
│   └── api/
│       ├── subscribe.ts   # POST: add subscriber to Supabase
│       ├── transcribe.ts  # POST: Claude vision transcription
│       ├── publish.ts     # POST: commit markdown to GitHub
│       └── send-email.ts  # POST: send newsletter via Resend
└── middleware.ts           # Auth guard for all /admin/* routes
```

## Security Notes

- The admin password is stored as a plain env var and compared server-side. Use a strong, unique password.
- Session cookies are HMAC-SHA256 signed (using the Web Crypto API) and expire after 24 hours.
- The Supabase service role key is used server-side only and never exposed to the client. Row-Level Security is enabled to block any accidental client-side access.
- All user-provided strings written into email HTML are escaped to prevent XSS.

## Limitations & Considerations

- **Vercel Hobby plan** has a 10-second serverless function timeout. The Claude transcription call can occasionally be slow for dense images. Consider upgrading to Vercel Pro (60s timeout) for production use.
- **Resend free tier** allows 100 emails/day and 3,000/month. Check [resend.com/pricing](https://resend.com/pricing) for current limits.
- New posts are only live after Vercel finishes rebuilding (~1–2 minutes after the GitHub commit).
- There is no unsubscribe link in emails by default. For CAN-SPAM/GDPR compliance in production, add an unsubscribe mechanism before sending to real subscribers.
