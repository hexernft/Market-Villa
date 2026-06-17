# Mobile Reference Action Plan

Source images: mobile screenshots provided on June 17, 2026 from a commerce management app and one payment receipt reference.

Purpose: translate the screenshots into practical Market Villa product improvements without copying another product's branding or exact UI.

## Executive Summary

The reference images show a mobile-first business management flow that feels useful because it does four things well:

1. It teaches users inside the product with contextual bottom sheets.
2. It gives clear empty states with one strong action.
3. It turns setup into a visible checklist with progress.
4. It groups advanced tools into simple sections so the dashboard does not feel overwhelming.

Market Villa already has the foundation: dashboard, products, stores, billing, themes, admin, and public pages. The strongest next move is to improve the business owner's mobile dashboard experience with onboarding, empty states, quick actions, contextual help, and simple analytics.

## Priority Fixes

| Priority | Workstream | Why It Matters | Recommended Scope |
| --- | --- | --- | --- |
| P0 | Mobile onboarding checklist | Users need to know what to do after signup. | Add a dashboard setup card with progress and direct links. |
| P0 | Empty states for products, orders, analytics | Empty pages should guide action, not feel unfinished. | Add illustrated/structured empty states with primary buttons. |
| P0 | Mobile dashboard quick actions | Makes the app feel useful on first launch. | Add quick action buttons for add product, view store, share link. |
| P1 | Contextual help bottom sheets | Reduces confusion without adding documentation pages. | Add help modals for Products, Orders, Themes, Billing. |
| P1 | More menu / settings hub | Keeps mobile dashboard simpler. | Group profile, store setup, billing, domain, support, legal, logout. |
| P1 | Analytics overview | Owners want proof that their store is working. | Add simple cards for visits, WhatsApp clicks, products, and orders. |
| P2 | Staff permissions | Useful, but bigger data/security work. | Defer until roles/RLS are reviewed. |
| P2 | Wallet/settlement concepts | Not currently core to Market Villa. | Defer unless Market Villa collects customer payments directly. |
| P2 | Receipt/invoice templates | Useful for future orders. | Use as inspiration for simple order receipt/share summary. |

## Screenshot Learnings

### 1. Contextual Help Bottom Sheets

Observed in images:
- Products help sheet explains what the tab is for.
- Orders help sheet explains orders, invoices, receipts, payment requests.
- Staff update modal explains new permissions and activity logs.
- Milestones modal explains goals in plain language.

Action for Market Villa:
- Add reusable `HelpSheet` component for dashboard pages.
- Add a small help icon beside page titles or section headers.
- Keep help content short, practical, and tied to one action.

Suggested first help topics:
- Products: add products, images, prices, availability, WhatsApp inquiry behavior.
- Orders/Inquiries: explain WhatsApp inquiries now and future order tracking.
- Themes: explain plan limits and previewing themes.
- Billing: explain current plan, renewal, and upgrade.

Acceptance criteria:
- Help opens as a mobile-friendly bottom sheet.
- Desktop can use a centered modal or side panel.
- Help does not block normal use after dismissal.
- Text is readable with strong contrast.

Affected areas:
- `app/dashboard/products/page.tsx`
- `app/dashboard/orders/page.tsx`
- `app/dashboard/theme/page.tsx`
- `app/dashboard/billing/page.tsx`
- New shared component under `components/`

### 2. Onboarding Checklist

Observed in images:
- Home screen shows "Complete your onboarding" with progress.
- Dedicated setup screen has a progress bar, remaining steps, preview sample website, and save button.

Action for Market Villa:
- Add a dashboard setup card that checks the current business state.
- Link each item to the exact dashboard page needed.
- Keep the checklist focused on storefront launch, not every possible setting.

Recommended checklist:
1. Complete store profile.
2. Add logo or cover image.
3. Add first product.
4. Choose a theme.
5. Add WhatsApp number.
6. Publish or preview store.

Acceptance criteria:
- Progress count updates from real business/product data.
- Completed items are visually marked.
- Each incomplete item opens the relevant page.
- Dashboard shows the checklist only while setup is incomplete, or collapses it after completion.

Affected areas:
- `app/dashboard/page.tsx`
- `lib/business-actions.ts`
- Possibly Supabase queries for product counts.

### 3. Strong Empty States

Observed in images:
- Products empty state has a clear message and "Add Product".
- Orders empty state explains how to record first sale.
- Invoice note page shows a clear description even when content is empty.

Action for Market Villa:
- Replace blank/quiet empty sections with useful empty states.
- Use one primary action per empty state.

Recommended empty states:
- Products: "No products yet" + Add product.
- Orders/Inquiries: "No inquiries yet" + View store / Share store.
- Analytics: "No activity yet" + Share store.
- Domain requests: "No domain request yet" + Request domain.
- Admin lists: "No matching results" + reset search/filter.

Acceptance criteria:
- Empty states explain what is missing and what to do next.
- CTA goes to the correct page/action.
- Works well on mobile without giant vertical gaps.

Affected areas:
- `app/dashboard/products/page.tsx`
- `app/dashboard/orders/page.tsx`
- `app/dashboard/analytics/page.tsx`
- `app/dashboard/domain/page.tsx`
- `app/admin/page.tsx`

### 4. Mobile Dashboard Quick Actions

Observed in images:
- Home dashboard offers quick tiles: new order, add product, run sales, support.
- Wallet, maintenance mode, visit store, share link, notifications, analytics are surfaced early.

Action for Market Villa:
- Add compact quick actions near the top of the dashboard.
- Focus on actions Market Villa actually supports today.

Recommended quick actions:
- Add product.
- View store.
- Share store link.
- Edit profile.
- Choose theme.

Acceptance criteria:
- Actions are visible without deep scrolling on mobile.
- Buttons use icons plus short labels.
- Each action routes directly to useful work.

Affected areas:
- `app/dashboard/page.tsx`
- Shared dashboard action/card components if available.

### 5. More / Settings Hub

Observed in images:
- The "More" tab groups tools into Operations, Reports, Finance, Sales and Marketing, Store Setup, Account, Support, Legal.
- This keeps the main navigation simple while still exposing many features.

Action for Market Villa:
- Create a mobile-friendly settings hub or improve the dashboard sidebar equivalent.
- Group pages in plain-language sections.

Recommended sections:
- Store Setup: Profile, Theme, Domain, Visibility.
- Selling: Products and Orders/Inquiries.
- Growth: Analytics, Store directory visibility, Featured promotion.
- Billing: Plan, invoices/payments.
- Account: Profile, password, logout.
- Support: Help, contact, status.
- Legal: Terms, privacy.

Acceptance criteria:
- Mobile users can reach every major dashboard page without relying on a crowded sidebar.
- Section headings are readable and not overly decorative.
- Current page is clearly highlighted.

Affected areas:
- Dashboard layout/navigation components.
- `app/dashboard/*`

### 6. Analytics and Reports

Observed in images:
- Analytics screen has tabs for sales, products, customers.
- Cards show totals and comparison labels.
- A "download report" action is prominent.

Action for Market Villa:
- Start with simple storefront analytics, not full accounting.
- Use the event RPCs already prepared in the Supabase migration.

Recommended MVP metrics:
- Store views.
- WhatsApp clicks.
- Product count.
- Share/copy link clicks.
- Published status.

Acceptance criteria:
- Dashboard analytics show real counts where available.
- If data is zero, copy explains how to generate activity.
- Avoid fake profit/sales metrics until Market Villa has real order/payment data.

Affected areas:
- `app/dashboard/analytics/page.tsx`
- `app/store/[slug]/page.tsx`
- Supabase event tables/RPCs from migration.

### 7. Staff Permissions and Activity Logs

Observed in images:
- Add Staff screen includes role label, name, email, phone, assigned location, and permissions matrix.
- Staff update modal highlights granular permissions and activity logs.

Action for Market Villa:
- Treat this as a later security feature, not an immediate UI-only feature.
- Staff accounts require database model, invite flow, RLS policies, and audit logs.

Recommended future permissions:
- Products: view/manage/delete.
- Orders/Inquiries: view/manage/update.
- Store profile: view/manage.
- Billing: view only or owner-only.
- Theme/domain: owner-only by default.

Approval needed before implementation:
- This is a major change because it affects auth, database schema, permissions, and business data access.

Affected future areas:
- Supabase migrations.
- RLS policies.
- Dashboard layout.
- Admin/user management pages.

### 8. Billing, Wallet, and Receipt Inspiration

Observed in images:
- Wallet setup explains settlement benefits.
- Receipt screenshot shows a clean transaction receipt with provider, amount, status, token, and transaction number.

Action for Market Villa:
- Do not build wallet/settlements now unless Market Villa will process customer payments directly.
- Borrow the receipt clarity for future invoice/order summaries.

Recommended MVP use:
- Add a clean order/inquiry summary that can be copied to WhatsApp.
- Later add printable/downloadable receipt or invoice when orders become first-class records.

Privacy note:
- The provided payment receipt includes personal transaction details. Do not commit that image or use its real data in demo content.

## Proposed Implementation Order

1. Add dashboard onboarding checklist.
2. Add empty states across dashboard pages.
3. Add dashboard quick actions.
4. Add reusable help bottom sheet and first help topics.
5. Improve mobile dashboard navigation/settings hub.
6. Connect simple analytics cards to real store event data.
7. Review and apply Supabase migrations.
8. Plan staff permissions and audit logs as a separate major feature.

## MVP Acceptance Checklist

| Area | Done When |
| --- | --- |
| Onboarding | New users can see exactly what remains before their store is presentable. |
| Empty states | Every blank dashboard page explains the next action. |
| Quick actions | Mobile owners can add products and share/view their store quickly. |
| Help | Key pages explain themselves without sending users elsewhere. |
| Analytics | Owners can see basic activity without confusing fake revenue metrics. |
| Navigation | Mobile dashboard feels organized and not heavy. |
| Security | Staff permissions are not added until RLS and audit requirements are designed. |
