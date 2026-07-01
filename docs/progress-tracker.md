# Market Villa Product Progress Tracker

Architecture to launch checklist for a robust SaaS product.

Source: `C:\Users\Hex\Downloads\Market_Villa_Product_Progress_Tracker.pdf`

## Product Snapshot

| Field | Details |
| --- | --- |
| Product | Market Villa - business hosting, storefront builder, store discovery, and WhatsApp-ready selling. |
| Primary users | Super admin, business owner, business staff, public customer, future agency/reseller. |
| Core stack | Next.js, Supabase Auth/Postgres/Storage, Paystack, Vercel, future AI search, and WhatsApp Cloud API. |
| Purpose | Track every major step required to move from architecture to a properly working product launch. |

## Status Key

| Status | Meaning |
| --- | --- |
| Not Started | Work has not begun. |
| In Progress | Design, code, data, or testing is actively being worked on. |
| Blocked | Cannot continue until a dependency, bug, or decision is resolved. |
| Needs Review | Built but requires business, technical, UI, or security review. |
| Done | Built, tested, and accepted for the current launch stage. |

## Product Focus

| Area | Definition |
| --- | --- |
| Product Promise | Help small businesses create polished mini websites, display products, receive WhatsApp inquiries, and manage their business presence online. |
| MVP Focus | Auth, business workspace, store builder, public store page, products, WhatsApp inquiry flow, admin center, basic billing, and store discovery. |
| Commercial Focus | Subscription enforcement, theme access limits, Paystack billing, admin overrides, domain requests, analytics, and featured stores. |
| Growth Focus | AI search/discovery, sponsored stores, reseller/agency accounts, CRM, follow-up automation, and WhatsApp Cloud API integrations. |

## Phase Summary Roadmap

| # | Phase | Work Required | Success Output | Status |
| --- | --- | --- | --- | --- |
| 1 | Product Definition | Clarify users, value proposition, paid/free plan rules, MVP vs later features. | Product scope and launch promise agreed. | In Progress |
| 2 | Requirements | List every feature, user action, data requirement, restriction, and failure state. | Complete functional requirements checklist. | In Progress |
| 3 | Architecture | Define frontend, backend, database, auth, payments, hosting, storage, AI, and messaging systems. | System architecture map and data flow. | In Progress |
| 4 | Database and Security | Design tables, relationships, indexes, RLS policies, and storage rules. Baseline schema/RLS/storage migrations are now prepared and need review before applying to Supabase. | Secure database schema and access rules. | Needs Review |
| 5 | Auth and Roles | Business login, admin login, role checks, protected routes, and unauthorized handling. | Stable role-based access. | In Progress |
| 6 | Core Product Build | Business dashboard, profile, products, public store page, themes, and store directory. | Usable MVP storefront system. | In Progress |
| 7 | Billing and Plans | Pricing, Paystack, subscriptions, plan limits, failed payment handling, and admin override. | Commercial SaaS billing flow. | In Progress |
| 8 | Admin Center | Manage businesses, pricing, domains, visibility, subscriptions, and platform controls. | Protected admin operations hub. | In Progress |
| 9 | AI Search and Discovery | Natural search for stores/products, ranking logic, result cards, and future AI integration. | Customer discovery engine. | In Progress |
| 10 | QA and Security Review | Manual testing, role testing, mobile checks, RLS review, payment tests, and build checks. | Launch-ready, stable product. | Not Started |
| 11 | Launch Setup | Production env vars, Vercel, domain, Paystack live mode, demo data, legal pages, and monitoring. | Production launch checklist passed. | Not Started |
| 12 | Post-Launch Growth | Analytics, support, referrals, sponsored stores, CRM, AI assistant, and reseller system. | Growth roadmap execution. | Not Started |

## 1. Product Definition and Requirements

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Define target users | Super admin, business owner, business staff, public customer, future reseller/agency. | User roles documented. | In Progress |
| Define MVP feature scope | Auth, business creation, dashboard, store page, products, WhatsApp inquiry, themes, admin center. | MVP locked. | In Progress |
| Define pricing rules | Free, Starter, Grow, Pro plan features, limits, upgrades, downgrades, grace rules. | Pricing matrix accepted. | In Progress |
| Define customer journeys | Business owner journey, customer browsing journey, admin journey, payment journey. | Journey map completed. | Needs Review |
| Separate MVP vs V1 vs V2 | Avoid building every future idea before launch. | Roadmap staged. | In Progress |

## 2. System Architecture

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Frontend architecture | Next.js app routes, public pages, dashboard pages, admin pages, reusable components. | Route map documented. | In Progress |
| Backend/API architecture | Server actions/API routes for payments, store actions, admin actions, domain actions, and webhooks. | Backend map ready. | In Progress |
| Database architecture | Supabase Postgres tables, relationships, indexes, constraints, policies. | Schema baseline ready. | In Progress |
| Storage architecture | Logos, covers, products, orders, and future gallery buckets. `business-images` bucket and owner-folder storage policies are prepared in migration. | Storage rules ready. | Needs Review |
| External services | Paystack, Vercel, Supabase, future AI API, future WhatsApp Cloud API. | Integration plan agreed. | In Progress |

## 3. Database Design and Data Model

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Profiles table | User identity, email, role, created date, owner/staff/admin designation. | `profiles.role` works. | In Progress |
| Businesses table | Owner, name, slug, category, description, location, WhatsApp, status, plan, selected theme. | Business record stable. | In Progress |
| Products | CRUD table with images, category, price, description, availability, business link. Services were removed from the active product scope. | Catalog data works. | In Progress |
| Payments/subscriptions | Payments, pricing items, plan, status, reference, raw response, renewal/grace/suspension fields. | Billing data reliable. | In Progress |
| Domain requests | Business domain requests, status, admin note, approval/rejection flow. | Domain flow tracked. | In Progress |
| Analytics/events | Store visits, WhatsApp clicks, product clicks, search terms, upgrade attempts. Store event table and increment RPCs are prepared in migration; product/search/upgrade analytics still need expansion. | Analytics schema ready. | In Progress |

## 4. Roles, Permissions, and Security

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Super admin access | Admin login checks `profiles.role = super_admin` and protects `/admin` routes. | Admin access stable. | In Progress |
| Business owner access | Owners can only manage their own businesses and related records. | Tenant isolation enforced. | Needs Review |
| Public store access | Only published/allowed stores and public product data are visible publicly. | Public RLS safe. | Needs Review |
| Storage access rules | Users upload only to allowed folders and cannot overwrite other business assets. Owner-folder storage policies are prepared and need Supabase review. | Storage secured. | Needs Review |
| Service role protection | Service role key never used client-side. | Secrets safe. | Needs Review |

## 5. Auth and Onboarding

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Business login | `/login` routes business users to `/dashboard`. | Business login stable. | In Progress |
| Admin login | `/admin-login` routes `super_admin` users to `/admin`. | Admin login stable. | In Progress |
| Business creation | New owner creates or receives business workspace. | Business onboarding works. | In Progress |
| Onboarding checklist | Guide user to add profile, products, theme, WhatsApp, publish. | Checklist live. | In Progress |
| Forgot password flow | Login can send Supabase reset emails and `/reset-password` lets users set a new password from the email link. | Recovery works. | Needs Review |

## 6. Core Dashboard and Store Builder

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Dashboard shell | Business sidebar, protected layout, responsive navigation, logout, loading state. | Dashboard works on desktop/mobile. | In Progress |
| Business profile | Edit name, description, location, WhatsApp, logo, cover, brand details. | Profile saves correctly. | In Progress |
| Products | Add/edit/delete products, images, categories, prices, availability. | Products render on store. | In Progress |
| Services | Removed from active MVP scope; `/dashboard/services` redirects to Products. | No service management UI is shown. | Done |
| Orders/inquiries | WhatsApp order flow, inquiry summary, future order tracking. | Inquiry flow usable. | In Progress |
| Public store page | Slug-based store, SEO, theme rendering, responsive layout, empty states. | Store page polished. | In Progress |

## 7. Theme System and Plan Limits

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Theme registry | Central list of themes with ID, name, preview, layout type, plan availability. `lib/themes.ts` contains 10 themes and dashboard previews are live. | `lib/themes` ready. | Done |
| Free plan limit | Free users get 2 themes and single-page UI only. | Restriction enforced. | Not Started |
| Starter plan limit | Starter users get 5 themes. Dashboard locking and backend save enforcement are implemented. | Restriction enforced. | Done |
| Grow and Pro limit | Grow and Pro users get 10 themes. Premium is normalized internally to `pro` while remaining the display label. | Restriction enforced. | Done |
| Frontend locking | Locked themes shown with upgrade prompt. Lower-plan users see upgrade badges and cannot select locked themes. | Clear upgrade UX. | Done |
| Backend enforcement | Saving locked themes blocked server-side. `updateBusinessTheme` checks plan limits before saving. | Cannot bypass frontend. | Done |

### Premium Theme Add-ons / Extensions

Premium themes should be built with extension slots for optional add-ons. These add-ons should be visible as purchasable upgrades, but inactive by default. A business should only be able to activate an add-on after purchase or admin entitlement approval.

| Add-on | What It Adds | Activation Rule | Status |
| --- | --- | --- | --- |
| Blog | Posts/articles for SEO, product education, announcements, and business updates. | Locked until purchased. | Not Started |
| Photo Gallery | Brand, product, lookbook, food, property, car, or event image galleries. | Locked until purchased. | Not Started |
| Gift Box at Checkout | Gift wrapping or packaging option during checkout/order request. | Locked until purchased. | Not Started |
| Product Add-ons | Optional extras attached to a product before checkout. | Locked until purchased. | Not Started |
| Pages | Extra informational pages such as About, Policies, Size Guide, FAQ, Delivery, or Care Instructions. | Locked until purchased. | Not Started |
| Custom Checkout | Custom checkout/order fields for details the seller needs to collect. | Locked until purchased. | Not Started |
| Countdown | Countdown banners for launches, flash sales, deadlines, or limited offers. | Locked until purchased. | Not Started |
| Back In Stock | Customer restock notifications for unavailable products. | Locked until purchased. | Not Started |
| Featured Brands | Brand grouping and navigation for multi-brand stores. | Locked until purchased. | Not Started |
| Product Bundles | Group multiple products into one bundle with one price and stock handling. | Locked until purchased. | Not Started |
| Gift Card | Sell or issue gift cards customers can redeem later. | Locked until purchased. | Not Started |

Implementation notes:

- Add-ons must not appear as active storefront features unless the business owns the add-on.
- Premium themes should be designed to support these add-ons visually, even before the add-on logic is built.
- Add-on entitlement should be stored separately from theme selection so a business can change themes without losing purchased add-ons.
- The future Extensions/Add-ons page should show available, purchased, and active states clearly.

## 8. Billing, Payments, and Subscription Enforcement

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Pricing items | Admin-controlled pricing items and plan metadata. | Plans load correctly. | In Progress |
| Paystack initialize | Create transaction with correct plan, cycle, amount, business, callback URL. | Checkout starts correctly. | In Progress |
| Paystack verify | Verify reference, update payments and subscription status. | Payments confirmed. | In Progress |
| Yearly billing | Yearly price should use discount and correct Paystack amount. | No monthly/yearly mismatch. | In Progress |
| Failed payment handling | Grace period, reminders, suspension, admin override. | Dunning flow works. | Not Started |
| Admin override | Admin can extend/reactivate/suspend plans. | Override logged. | In Progress |

## 9. Admin Center

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Admin dashboard | Platform overview, business counts, subscription health, pending requests. | Admin overview works. | In Progress |
| Business management | Create, search, edit, suspend, reactivate businesses. | Admin can manage tenants. | In Progress |
| Pricing management | Update prices and active plan data from admin center. | Billing syncs. | In Progress |
| Domain requests | Approve/reject domain requests and add notes. | Domain workflow clear. | In Progress |
| Featured stores | Mark featured/visibility priority for store discovery. | Featured logic ready. | In Progress |
| Audit trail | Track admin changes and important billing/profile edits. | Audit log available. | Not Started |

## 10. Store Discovery and AI Search

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Store directory | Public list of available stores with category/location/store cards. | Stores discoverable. | In Progress |
| Smart search section | Search stores/products naturally inside `/stores`. | Search usable. | In Progress |
| Ranking logic | Keyword scoring across store names, categories, descriptions, products, and location. | Relevant results first. | In Progress |
| No-result state | Suggest searches and guide users when nothing matches. | No dead end. | In Progress |
| Future AI integration | Gemini/OpenAI semantic search for natural language intent. | AI-ready design. | Not Started |
| Sponsored results | Future promoted stores/products with clear labeling. | Revenue path ready. | Not Started |

## 11. UI/UX and Design System

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Brand system | Purple/black premium palette, white-purple glass cards, consistent logo use. | Visual identity consistent. | In Progress |
| Typography | Shopify-like clean typography, readable headings, proper line height. | Readable app-wide. | In Progress |
| Components | Reusable buttons, cards, forms, badges, empty states, loading states. | Components reused. | In Progress |
| Mobile responsiveness | Homepage, stores, dashboard, admin, billing, forms, public store pages. | Mobile feels native. | Needs Review |
| Accessibility | Contrast, focus states, labels, keyboard usability, image alt text. | Accessibility pass. | Not Started |

## 12. Testing and QA

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Build checks | Run `npm run build` before every commit/deploy. | No build errors. | In Progress |
| Manual user tests | Test signup, login, business creation, product add, publish, store link, WhatsApp. | Core flows pass. | Not Started |
| Role tests | Super admin, business owner, free user, paid user, expired user, public customer. | Roles behave correctly. | Not Started |
| Payment tests | Monthly, yearly, verify, failed, repeated references, webhook, wrong amount. | Billing safe. | Not Started |
| RLS/security tests | Try accessing another business data, updating locked records, public updates. | No data leaks. | Not Started |
| Browser/device tests | Chrome, mobile, tablet, desktop, slow network. | Responsive stable. | Not Started |

## 13. SEO, Legal, and Launch Content

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| SEO metadata | Dynamic store titles, descriptions, OG images, slugs, sitemap, robots. Sitemap and robots are now added; dynamic store metadata still needs a store-page server/client split. | Share previews polished. | In Progress |
| Legal pages | Terms, privacy, refund/subscription policy, acceptable use. | Launch compliant. | Not Started |
| Help center | FAQs, how to create store, add products, connect WhatsApp, upgrade, request domain. | Support reduced. | Not Started |
| Demo data | Demo stores for fashion, bakery, phone shop, furniture, and product-led categories. | Showcase ready. | In Progress |
| Launch graphics | Homepage visuals, social posts, demo video, pitch materials. | Launch assets ready. | In Progress |

## 14. Deployment and Production Readiness

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Environment variables | Supabase, Paystack, app URL, future AI/WhatsApp keys set correctly. | Production env ready. | Needs Review |
| Vercel deployment | Production branch, preview deploys, domain, SSL, build command. | Deploy stable. | In Progress |
| Supabase production setup | Tables, policies, storage buckets, seed data, admin profile. | Production DB ready. | Needs Review |
| Paystack live mode | Live keys, webhook URL, callback URL, verification and logging. | Payments live. | Not Started |
| Monitoring | Vercel logs, Supabase logs, payment logs, error tracking plan. | Issues visible. | Not Started |
| Rollback plan | Know how to revert deployments and data changes safely. | Recovery plan ready. | Not Started |

## 15. Beta, Launch, and Post-Launch Growth

| Task | What to Build / Verify | Success Criteria | Status |
| --- | --- | --- | --- |
| Beta businesses | Test with food, fashion, phone/accessories, beauty, service provider. | Real feedback collected. | Not Started |
| Feedback cycle | Collect confusion points, missing features, pricing objections, bugs. | Launch improvements made. | Not Started |
| Public launch | Final build, live payment, admin access, store pages, support, legal pages. | Launch approved. | Not Started |
| Analytics review | Track signups, published stores, WhatsApp clicks, search queries, upgrades. | Growth data visible. | Not Started |
| Growth features | Referral system, sponsored stores, CRM, AI assistant, WhatsApp automation, reseller dashboard. | Post-launch roadmap active. | Not Started |

## Launch Readiness Checklist

| Area | Checklist |
| --- | --- |
| Product | [ ] Core user journeys work end-to-end.<br>[ ] Demo stores are present.<br>[ ] Empty states guide users. |
| Auth and Roles | [ ] Business login works.<br>[ ] Admin login works.<br>[ ] Unauthorized users are blocked.<br>[ ] Password recovery works. |
| Database and Security | [ ] RLS enabled.<br>[ ] Public reads are safe.<br>[ ] Business tenant isolation is tested.<br>[ ] Storage rules are safe. |
| Billing | [ ] Paystack initialize works.<br>[ ] Verify works.<br>[ ] Monthly/yearly amounts correct.<br>[ ] Webhook tested.<br>[ ] Grace/suspension defined. |
| Themes and Plans | [ ] Free plan has 2 single-page themes.<br>[ ] Starter has 5 themes.<br>[ ] Grow/Pro have 10 themes.<br>[ ] Backend enforcement works. |
| Public Storefronts | [ ] Store pages load.<br>[ ] WhatsApp links work.<br>[ ] Images render.<br>[ ] SEO/social previews are set. |
| Admin Center | [ ] Super admin profile works.<br>[ ] Business management works.<br>[ ] Pricing/domain/visibility controls work. |
| Search and Discovery | [ ] Store/product search works.<br>[ ] No-result state works.<br>[ ] Featured stores are readable and distinct. |
| UI/UX | [ ] Mobile responsive.<br>[ ] Text readable.<br>[ ] Buttons consistent.<br>[ ] Loading/error states polished. |
| Deployment | [ ] Production env vars set.<br>[ ] Build passes.<br>[ ] Vercel deployment works.<br>[ ] Monitoring/logs checked. |

## Recommended Next Priorities

| Priority | Focus | Reason |
| --- | --- | --- |
| 1 | Lock plan/theme access rules | Free 2 themes/single-page, Starter 5, Grow/Pro 10. Enforce on frontend and backend. |
| 2 | Stabilize admin access and permissions | Ensure `profiles.role = super_admin`, protected admin routes, and tenant-safe dashboard access. |
| 3 | Finalize Paystack subscription enforcement | Monthly/yearly amounts, verification, webhook, grace period, suspension, override. |
| 4 | Finish RLS/security review | Confirm public/private access policies for businesses, products, payments, domains, and storage. |
| 5 | Run beta with real businesses | Use 3-5 businesses and collect feedback before full launch. |

## Update Notes

- Update statuses after every major build, review, and launch milestone.
- Keep this Markdown file as the editable tracker.
- Regenerate or export a PDF only when a polished shareable version is needed.
