# KAGAN — Project Progress

*Last updated: April 2, 2026*

---

## What We've Built

### Landing Page
- Dark-mode-first design with OKLCH monochrome color system
- Scroll-triggered animations (`useMount` for page load, `useReveal` for scroll)
- Sections: Navbar, Hero, Features, Pricing ($700/mo + $100/integration), Contact form, Footer
- Smooth scroll navigation for Pricing and Contact sections

### Authentication (Supabase)
- Email/password login and registration with XSS sanitization
- Email verification flow (register → verify email → redirect to onboarding)
- Forgot password / reset password flow
- Middleware-based route protection (auth pages, dashboard, admin)
- Session refresh via Supabase SSR cookies

### Onboarding
- 5-step flow: Company Basics → Goals → Brand & Language → Channels & Hours → Review
- Saves to `profiles` table on completion
- Middleware gate: users must complete onboarding before accessing dashboard
- Onboarding status cached in HTTP-only cookie (7-day TTL)
- Verified email toast on arrival from email confirmation

### Dashboard
- **Layout**: Sidebar navigation + main content area (non-async for performance)
- **Overview** (`/dashboard`): Welcome message, stat cards (Leads, Conversations, Conversion Rate, Meetings), billing snapshot with live Stripe status, recent activity
- **Leads** (`/dashboard/leads`): 6-stage pipeline funnel (New → Engaged → Qualified → Appointment → Won → Lost), filterable table with search
- **Conversations** (`/dashboard/conversations`): Three-panel inbox layout — channel sidebar (WhatsApp, Instagram, Email, Phone, Web Chat), thread list, message/timeline detail view with AI/Human/Lead distinction
- **Workflows** (`/dashboard/workflows`): Execution tracking with summary cards (Successful/Failed/Retried), expandable detail rows showing steps executed and errors, workflow reference table (WF-01 through WF-ERR)
- **Integrations** (`/dashboard/integrations`): Health cards for WhatsApp, Instagram, Calendar, CRM with connection status, last activity, and connect/manage buttons
- **Analytics** (`/dashboard/analytics`): FRT (avg/median/p95), Conversion Rate, Handoff Rate with trend indicators, channel performance table
- **Billing** (`/dashboard/billing`): Live Stripe subscription status, cancellation with days-left countdown, subscribe/resubscribe/manage via Stripe Checkout and Customer Portal
- **Settings** (`/dashboard/settings`): Organization name, timezone, escalation email
- **Profile Panel**: Slide-over with avatar upload (MIME validation, 2MB limit), name/email editing with verification notice, password change with current password verification

### Stripe Integration
- Checkout sessions with 7-day free trial (first-time subscribers only)
- Customer Portal for subscription management (opens in new tab)
- Webhook handler for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Lazy-initialized Stripe client to avoid build-time crashes
- Subscription status synced to `profiles` table via service role client

### Staff Admin Dashboard (`/admin`)
- Protected by middleware admin check (cached in cookie)
- API-level double-check on all admin endpoints
- **Overview**: Total Users, Active Subscribers, MRR, Signups (7d), recent signups table
- **Customers**: Searchable/filterable list with expandable detail showing full onboarding data (company, goals, brand, channels, business hours), subscription info, and Stripe IDs

### Security
- XSS sanitization on user inputs (register, profile)
- IDOR prevention: always fetch userId from live auth session
- Path traversal prevention: file extensions derived from MIME type
- Avatar upload: MIME-type allowlist, size limit, RLS policies on storage
- Service role key server-side only, never exposed to browser
- Admin routes: middleware cookie check + API-level `is_admin` verification
- Supabase RLS on `profiles` table

### Legal Pages
- `/contact`, `/privacy`, `/terms`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| UI | React 19, Tailwind CSS v4 (`@theme inline`, OKLCH) |
| Auth | Supabase Auth (email/password, `@supabase/ssr`) |
| Database | Supabase PostgreSQL with RLS |
| Storage | Supabase Storage (avatars bucket) |
| Payments | Stripe (Checkout, Portal, Webhooks) |
| Icons | Lucide React |
| Fonts | Geist Sans + Geist Mono |
| Hosting | Vercel |

---

## Database Schema (`profiles` table)

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Matches auth.users.id |
| first_name, last_name | text | User name |
| company_name | text | From onboarding |
| industry | text | From onboarding |
| timezone | text | From onboarding |
| primary_goal | text | From onboarding |
| brand_tone | text | From onboarding |
| default_language | text | From onboarding |
| channels | jsonb | From onboarding |
| business_hours | jsonb | From onboarding |
| escalation_email | text | From settings |
| onboarding_completed | boolean | Gate for dashboard access |
| is_admin | boolean | Staff panel access |
| stripe_customer_id | text (unique) | Stripe customer reference |
| stripe_subscription_id | text (unique) | Stripe subscription reference |
| stripe_subscription_status | text | active/trialing/canceled/past_due |
| avatar_url | text | Profile picture path |
| created_at, updated_at | timestamptz | Timestamps |

---

## File Structure

```
sistem/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind v4 theme
│   ├── login/                      # Auth pages
│   ├── register/
│   ├── verify/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── onboarding/                 # 5-step onboarding
│   ├── dashboard/                  # User dashboard (8 sub-pages)
│   ├── admin/                      # Staff panel (overview + customers)
│   ├── api/
│   │   ├── stripe/                 # checkout, portal, subscription, webhook
│   │   └── admin/                  # customers endpoint
│   ├── auth/                       # confirm, signout
│   ├── contact/, privacy/, terms/  # Legal
├── lib/
│   ├── stripe.ts                   # Stripe client (lazy init)
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server client
│       ├── admin.ts                # Service role client
│       └── middleware.ts           # Auth + admin + onboarding checks
├── middleware.ts                    # Root middleware
└── .env.local                      # Keys (gitignored)
```

---

## What's Next

### Short-term
- [ ] Migrate `middleware.ts` → `proxy.ts` (Next.js 16 deprecation warning)
- [ ] Add Vercel env vars for production Stripe webhook
- [ ] Set up Supabase redirect URL for production domain

### Integration
- [ ] Connect n8n for workflow automation
- [ ] Wire real data into Leads, Conversations, Workflows, Analytics pages
- [ ] Set up WhatsApp Business API, Instagram Messaging, Calendar, CRM integrations
- [ ] Push n8n execution data to workflows page
- [ ] Push channel messages to conversations inbox

### Features
- [ ] Knowledge base for AI responses (WF-06)
- [ ] AI brain configuration per customer (WF-03)
- [ ] Custom integrations billing (+$100/mo each)
- [ ] Admin notes field per customer for n8n setup tracking
- [ ] Subdomain setup for admin panel (optional)

### Polish
- [ ] Real-time updates via Supabase Realtime (conversations, leads)
- [ ] Email notifications for subscription events
- [ ] Dashboard stat cards connected to real metrics
- [ ] Mobile responsiveness audit
