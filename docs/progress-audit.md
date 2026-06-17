# Market Villa Roadmap Audit

Compared against `docs/progress-tracker.md` after scanning the project folder.

Audit date: 2026-06-16

## Executive Summary

The project is farther along than the original tracker in several product areas. The repo already includes the main public pages, dashboard modules, admin center, Paystack routes, visibility packages, order flow, AI support, store discovery, analytics views, and a 10-theme registry.

The main launch risk is not the amount of UI built. The launch risk is proof and enforcement: database schema coverage, RLS/storage policies, owner checks, plan/theme limits, payment edge tests, SEO metadata, and production readiness are not fully represented in the repo.

## What Exists In The Repo

| Area | Evidence | Assessment |
| --- | --- | --- |
| Public marketing site | `app/page.tsx`, `components/HomeCommerceExperiences.tsx`, `components/PlatformNavbar.tsx`, `components/PlatformFooter.tsx` | Built and actively polished. Needs final mobile/performance review. |
| Store directory and search | `app/stores/page.tsx`, `components/StoreSmartSearch.tsx`, `components/PlatformNavbar.tsx` | Built. Keyword search and no-result states exist. |
| Public store pages | `app/store/[slug]/page.tsx`, `components/WhatsAppCheckout.tsx`, `lib/business-actions.ts` | Built. Supports products, services, themes, WhatsApp checkout, and order records. |
| Auth | `app/login/page.tsx`, `app/signup/page.tsx`, `app/admin-login/page.tsx`, `lib/auth.ts` | Basic login/signup/admin login exist. Forgot password is missing. |
| Business dashboard | `app/dashboard/*`, `components/DashboardShell.tsx` | Broad dashboard exists: overview, onboarding, profile, products, services, orders, billing, theme, domain, visibility, analytics, settings. |
| Admin center | `app/admin/page.tsx`, `app/admin/pricing/page.tsx`, `app/admin/revenue/page.tsx`, `app/admin/visibility-requests/page.tsx` | Built. Super admin checks exist in business actions, but full route-level/security verification still needs review. |
| Billing and subscription payments | `app/api/paystack/initialize/route.ts`, `app/api/paystack/verify/route.ts`, `app/api/paystack/webhook/route.ts`, `app/api/subscriptions/enforce/route.ts`, `lib/payment-actions.ts` | Implemented enough for integration testing. Needs live-mode and edge-case QA. |
| Visibility packages and featured stores | `app/dashboard/visibility/page.tsx`, `app/api/visibility/*`, `app/admin/visibility-requests/page.tsx`, `lib/visibility-packages.ts` | More complete than tracker suggests. Needs payment and expiry testing. |
| Theme system | `lib/themes.ts`, `components/ThemePreviewCard.tsx`, `app/dashboard/theme/page.tsx` | 10-theme registry exists. Plan-based locking/enforcement is missing. |
| Analytics/events | `app/dashboard/analytics/page.tsx`, `app/api/stores/track/route.ts` | Basic analytics dashboard and store event insert route exist. Full schema/migration and reporting need review. |
| AI support | `components\SupportWidget.tsx`, `components\DeferredSupportWidget.tsx`, `app/api/ai/support/route.ts`, `app/api/ai/health/route.ts` | Built as support assistant. Search AI/semantic discovery is still future work. |
| Legal/help/status pages | `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/help/page.tsx`, `app/status/page.tsx` | Pages exist. Need business/legal review before launch. |

## Tracker Status Corrections

These tracker statuses look outdated based on the current repo.

| Tracker Item | Current Tracker Status | Suggested Status | Reason |
| --- | --- | --- | --- |
| Theme registry | Not Started | Done or Needs Review | `lib/themes.ts` defines 10 storefront themes and `ThemePreviewCard` renders previews. |
| Onboarding checklist | Not Started | In Progress | `app/dashboard/onboarding/page.tsx` creates a business and optional sample data. It is not yet a full checklist. |
| Analytics/events | Not Started | In Progress | `app/dashboard/analytics/page.tsx` and `app/api/stores/track/route.ts` exist, but schema proof is incomplete. |
| Future AI/support assistant under growth | Not Started | In Progress | AI support widget and `/api/ai/support` exist. Semantic search remains Not Started. |
| Featured stores | In Progress | In Progress, close to Needs Review | Visibility and featured payment/admin flows exist, but expiry/payment QA is still needed. |
| Help center | Not Started | In Progress | `app/help/page.tsx` exists, but likely needs more content depth. |
| Legal pages | Not Started | Needs Review | Terms and privacy pages exist, but need final policy review. |
| Deployment/Vercel | In Progress | In Progress | `vercel.json` exists and pushes have been used for deployment. Production env review remains. |

## Areas That Match The Tracker

| Area | Status Match | Notes |
| --- | --- | --- |
| Product definition | In Progress | App scope is visible in routes and pages, but formal user journey docs are still light. |
| Frontend architecture | In Progress | Clear route structure exists across marketing, stores, dashboard, and admin. |
| Backend/API architecture | In Progress | API routes exist for Paystack, visibility, subscriptions, AI, and store tracking. |
| Core product build | In Progress | Dashboard, store builder, public store, products, services, orders, and directory all exist. |
| Admin center | In Progress | Admin surfaces exist and are actively being polished. |
| Mobile responsiveness | Needs Review | Recent mobile performance pass was committed locally, but still needs device testing. |
| QA and security | Not Started or Needs Review | Automated checks exist through lint/TypeScript, but no full test suite or security audit is visible. |

## Gaps Against The Roadmap

### Security and Database Proof

The repo only contains one Supabase migration: `supabase/migrations/002_revenue_protection_foundation.sql`. It adds the `payments` table, payment RLS, subscription columns, and indexes.

Missing or not represented in migrations:

- baseline schema for `profiles`, `businesses`, `products`, `services`, `orders`, `order_items`, `domain_requests`, `visibility_requests`, `pricing_items`, and `store_events`
- RLS policies for tenant isolation across the main app tables
- public read policies for published stores/products/services
- storage bucket creation and storage policies for `business-images`
- admin policy strategy for `super_admin`

This means the tracker should keep database/security at `Needs Review` until Supabase policies are exported or documented.

### Owner Checks

Many business operations depend on Supabase RLS and update records by ID. Examples include profile/theme/product/service/order updates in `lib/business-actions.ts`.

That can be fine if RLS is correct, but the repo does not currently prove the RLS layer for these tables. This should become a launch blocker item.

### Plan and Theme Enforcement

`lib/themes.ts` has 10 themes and `app/dashboard/theme/page.tsx` lets users choose from all available themes.

Missing:

- Free plan definition in `lib/plans.ts`
- per-plan theme limits
- locked theme UI
- backend enforcement in `updateBusinessTheme`
- single-page restriction for free plan

This matches the tracker's top recommended priority.

### Payment QA

Paystack initialize, verify, webhook, yearly amount handling, grace period, and enforcement routes exist.

Still needs:

- live key mode verification
- webhook signature testing in production
- duplicate reference and wrong amount tests
- failed payment lifecycle test
- documented rollback path

### SEO and Launch Content

Global metadata exists in `app/layout.tsx`, but store-level dynamic metadata is not clearly implemented. Terms, privacy, help, and status pages exist, but need review.

Still needs:

- dynamic store metadata
- OG/social previews
- sitemap
- robots
- launch policy review

### Testing

Current checks used during development are lint and TypeScript. There is no visible Playwright, unit, integration, payment, RLS, or role test suite.

The tracker's QA section should remain mostly `Not Started`.

## Suggested Tracker Updates

| Section | Update |
| --- | --- |
| 7. Theme System and Plan Limits | Mark Theme registry as `Done` or `Needs Review`. Keep all enforcement items `Not Started`. |
| 5. Auth and Onboarding | Mark Onboarding checklist as `In Progress`, not `Not Started`. Forgot password remains `Not Started`. |
| 3. Database Design and Data Model | Mark Analytics/events as `In Progress`, but add note: schema/RLS not proven in migrations. |
| 13. SEO, Legal, and Launch Content | Mark Legal pages and Help center as `Needs Review` or `In Progress`, not `Not Started`. |
| 15. Post-Launch Growth | Split AI support from semantic search. AI support is `In Progress`; AI discovery remains `Not Started`. |

## Recommended Next Tickets

1. Export or create complete Supabase migrations for all app tables and RLS policies.
2. Add storage bucket and storage policy migrations for `business-images`.
3. Implement plan/theme limits in `lib/plans.ts`, dashboard theme UI, and `updateBusinessTheme`.
4. Add forgot password/reset password flow.
5. Add dynamic metadata for public store pages plus sitemap and robots.
6. Add a basic QA checklist script or test plan for auth, roles, store CRUD, Paystack, webhooks, and public store flow.
7. Device-test the mobile performance commit and mark mobile responsiveness as either `Done` or keep `Needs Review` with specific issues.
8. Review all API/client JSON parsing around Paystack and visibility routes, similar to the AI support JSON fix.

## Current Repo Notes

- `docs/progress-tracker.md` is uncommitted.
- `docs/progress-audit.md` is this audit.
- `mobile.png` in the project root is an untracked duplicate and should not be committed unless it is intentionally needed.
- Commit `6e94f90 Lighten mobile app experience` exists locally from the mobile performance pass.
