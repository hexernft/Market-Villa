# Market Villa Product and Design Guidelines

This document is the working rulebook for Market Villa. Use it before adding features, redesigning screens, changing pricing, or expanding the database.

## Product Direction

Market Villa helps small businesses create a simple online storefront, display products, share a professional link, and receive customer inquiries through WhatsApp.

The product should feel simple, useful, and trustworthy. It should not feel like a heavy enterprise dashboard or a complicated ecommerce platform.

## Primary Users

| User | What They Need |
| --- | --- |
| Business owner | Create a store, add products, share the link, receive inquiries, update business details. |
| Customer | Browse a business page, view products, add items to cart, contact the seller. |
| Admin | Manage businesses, pricing, visibility, subscriptions, and platform requests. |

Future users such as staff, agencies, resellers, car dealers, and property agents should be planned carefully before implementation because they affect data structure and permissions.

## Product Promise

Market Villa should promise:

- A business website in minutes.
- A clean product catalog.
- WhatsApp-ready selling.
- Simple setup for non-technical business owners.
- Affordable starter pricing.
- Premium themes and business tools as upgrades.

## MVP Scope

The launch version should focus on:

- Signup and login.
- Business onboarding.
- Store details editor.
- Product management.
- Public storefront.
- WhatsApp cart/inquiry flow.
- Mobile owner dashboard.
- Admin center.
- Pricing management.
- Theme store foundation.
- Basic analytics.

## Not MVP Yet

These should not be rushed without planning:

- Staff permissions.
- Full customer accounts.
- Full checkout/payment collection for store customers.
- Wallets and settlements.
- Campaign credits.
- Cars and properties as full verticals.
- Advanced CRM.
- WhatsApp Cloud API automation.
- Reseller/agency accounts.
- Deep AI search/ranking.

## Feature Approval Rules

Small UI changes can be done directly when they match this guide.

Ask for approval before building anything that:

- Requires new database tables.
- Changes pricing or billing logic.
- Changes authentication or user roles.
- Affects Supabase RLS/security.
- Adds a new business vertical such as cars or properties.
- Changes customer checkout behavior.
- Adds paid plan restrictions.
- Removes existing data or deletes old components.

## Design Personality

Market Villa should feel:

- Clean.
- Light.
- Mobile-first.
- Businesslike.
- Premium but not flashy.
- Easy for non-technical users.

Avoid:

- Heavy gradients on app surfaces.
- Large marketing-style dashboard cards.
- Excessive shadows.
- Long helper paragraphs.
- Overly decorative layouts.
- Crowded mobile screens.
- Too many colors competing with the brand.

## Brand Rules

| Element | Rule |
| --- | --- |
| Primary brand color | Purple. |
| Success/money color | Green only for live, paid, success, money, or positive status. |
| Danger/price emphasis | Red may be used for final product prices, errors, and destructive actions. |
| Backgrounds | White, off-white, or flat warm purple on mobile where needed. |
| Shadows | Avoid. Prefer borders and spacing. |
| Corners | Cards around 16px unless product/theme design needs a stronger visual style. |
| Typography | Tight, readable, consistent app-wide body font. |

## Text Rules

Keep interface text short.

Use:

- Titles.
- Labels.
- Buttons.
- Prices.
- Statuses.
- Counts.
- Real business/product/order data.

Avoid:

- Long helper paragraphs.
- Repeating explanations on every screen.
- Marketing copy inside dashboards.
- Rewording content without a clear reason.

If guidance is needed, use a compact help sheet, modal, tooltip, or onboarding checklist instead of permanent paragraphs.

## Mobile Dashboard Rules

The owner dashboard on mobile should feel like a lightweight app.

Required:

- Bottom navigation: Home, Products, Orders, Messaging/Leads, More.
- No mobile sidebar.
- Compact page headers.
- Clear primary action per page.
- Search/filter row only where useful.
- Safe bottom padding so content does not hide behind navigation.
- Support widget must not overlap bottom navigation.

Dashboard surfaces should use:

- Flat white/off-white backgrounds.
- Thin borders.
- 14-16px body text.
- 22-30px page titles.
- Rounded compact cards.
- Purple active states.
- Green only for success/money actions.

## Desktop Dashboard Rules

Desktop can keep the sidebar.

Desktop should still follow the same visual language:

- Clean spacing.
- Minimal shadows.
- Consistent cards.
- Clear content hierarchy.
- No dark unreadable sidebars.
- No decorative panels unless they help the task.

## Storefront Rules

The default storefront should be a simple product catalog.

Required sections:

- Top announcement bar.
- Header with logo/business name, search, contact/cart.
- Hero/banner image.
- Category pills.
- Product grid.
- WhatsApp/cart flow.
- Dark footer with contact details.

Avoid:

- SaaS landing page sections.
- Large about blocks.
- Long business descriptions.
- Heavy gradients.
- Oversized headings.
- Theme clutter in the default experience.

The default store should work well for any product-selling business. Paid themes can add richer layouts later.

## Product Card Rules

Product cards should be visual and simple.

Show:

- Product image.
- Product name.
- Category.
- Final price.
- Add to cart/contact action.

Do not show product descriptions in the card.

Cards should be clean, border-based, and mostly shadowless. Price can be made visually stronger than the rest of the text.

## Theme System Rules

Default theme:

- `default-one-page`.
- Free.
- Used by all new businesses.
- Simple and reliable.

Theme store:

- Should feel premium.
- Should not show old/legacy themes as active unless approved.
- Paid themes can be more specialized.
- Theme previews should help users understand the look before selecting.

Theme customization should be controlled through Store Details, theme settings, and product data. Do not make every design decision editable too early.

## Pricing Rules

Current starter messaging:

Own a business website with 3 months free. Starter pays N1500/month for the next 3 months, then regular billing resumes. Growth and Pro get 50% off for the first 6 months on bi-annual payment only; quarterly, bi-annual, and annual billing resume after 6 months.

Pricing text must match across:

- Homepage.
- Signup/onboarding.
- Business dashboard.
- Billing page.
- Admin pricing.
- Paystack amount logic.

Any pricing change requires checking both displayed copy and payment behavior.

## Admin Center Rules

Admin pages should be clear and readable.

Admin can manage:

- Businesses.
- Pricing.
- Visibility requests.
- Domain requests.
- Revenue/subscription state.
- Platform overview.

Admin should not become a dumping ground for homepage or business-owner content. Public marketing/pricing copy belongs on public pages and business onboarding, not inside admin unless it is part of pricing management.

## Database and Security Rules

Do not add database changes casually.

Before adding tables or roles, define:

- What data is stored.
- Who owns it.
- Who can read it.
- Who can update it.
- What happens publicly.
- What RLS policy is needed.
- How admin access works.
- How existing businesses are migrated.

Any change involving roles, staff, cars, properties, customer accounts, payments, or checkout needs a short written plan first.

## Roadmap Priorities

### Stabilize First

1. Storefront default theme.
2. Store details editor.
3. Product management.
4. WhatsApp cart/inquiry flow.
5. Mobile dashboard navigation.
6. Admin pricing consistency.
7. Build and responsive QA.

### Launch MVP

1. Signup/onboarding clarity.
2. Pricing clarity.
3. Publish/share store flow.
4. Store directory/search.
5. Basic analytics.
6. Legal/help pages.
7. Supabase/RLS review.
8. Paystack verification review.

### After Launch

1. Paid themes.
2. Advanced analytics.
3. Customer order records.
4. Receipts/invoices.
5. Staff permissions.
6. Cars/properties verticals.
7. WhatsApp automation.
8. AI discovery and assistant improvements.

## Build Discipline

For code changes:

- Work one small area at a time.
- Run `npm.cmd run build` after meaningful changes.
- Do not use broad destructive regex on large files.
- Do not delete old systems until the replacement is proven.
- Keep unrelated changes separate when possible.
- Commit after a stable unit of work.

## Decision Checklist

Before building a new feature, answer:

1. Does this help a business owner launch or manage their store?
2. Does this help a customer buy or inquire faster?
3. Does this help admin manage the platform safely?
4. Is this MVP or later?
5. Does it require database/security changes?
6. Does it keep the app lighter?
7. Does it match the visual rules?
8. Can it be tested quickly?

If the answer is unclear, plan before coding.
