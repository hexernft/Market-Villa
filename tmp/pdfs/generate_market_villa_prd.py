from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "market-villa-partner-prd.pdf"
LOGO = ROOT / "public" / "market-villa-logo.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_X = 18 * mm
MARGIN_TOP = 18 * mm
MARGIN_BOTTOM = 16 * mm

COLORS = {
    "ink": colors.HexColor("#241436"),
    "violet": colors.HexColor("#7C3AED"),
    "violet_dark": colors.HexColor("#35124D"),
    "violet_soft": colors.HexColor("#F3E8FF"),
    "mint": colors.HexColor("#10B981"),
    "mint_soft": colors.HexColor("#D9FFF3"),
    "gold_soft": colors.HexColor("#FFF7D6"),
    "paper": colors.HexColor("#FCFAFF"),
    "muted": colors.HexColor("#6B5D7C"),
    "line": colors.HexColor("#DED3EE"),
    "white": colors.white,
}


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        "CoverEyebrow",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=COLORS["mint"],
        alignment=TA_CENTER,
        uppercase=True,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=33,
        leading=38,
        textColor=COLORS["white"],
        alignment=TA_CENTER,
        spaceAfter=14,
    )
)
styles.add(
    ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12.5,
        leading=18,
        textColor=colors.HexColor("#F4ECFF"),
        alignment=TA_CENTER,
        spaceAfter=22,
    )
)
styles.add(
    ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=COLORS["ink"],
        spaceBefore=6,
        spaceAfter=9,
    )
)
styles.add(
    ParagraphStyle(
        "SubTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12.5,
        leading=15,
        textColor=COLORS["violet_dark"],
        spaceBefore=8,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=COLORS["ink"],
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.3,
        leading=11.5,
        textColor=COLORS["muted"],
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        "TableHead",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.2,
        leading=10,
        textColor=COLORS["white"],
        alignment=TA_LEFT,
    )
)
styles.add(
    ParagraphStyle(
        "TableCell",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.7,
        leading=10.2,
        textColor=COLORS["ink"],
    )
)
styles.add(
    ParagraphStyle(
        "MetricNumber",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=21,
        textColor=COLORS["violet"],
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        "MetricLabel",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.4,
        leading=10,
        textColor=COLORS["ink"],
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        "Callout",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=COLORS["violet_dark"],
        spaceAfter=0,
    )
)


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph(f"- {text}", styles["Body"])


def table(data, widths, header=True):
    converted = []
    for r, row in enumerate(data):
        converted.append(
            [
                cell if hasattr(cell, "wrap") else Paragraph(str(cell), styles["TableHead" if r == 0 and header else "TableCell"])
                for cell in row
            ]
        )

    t = Table(converted, colWidths=widths, hAlign="LEFT", repeatRows=1 if header else 0)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), COLORS["violet_dark"] if header else COLORS["white"]),
                ("TEXTCOLOR", (0, 0), (-1, 0), COLORS["white"] if header else COLORS["ink"]),
                ("GRID", (0, 0), (-1, -1), 0.45, COLORS["line"]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FFFEFF")),
            ]
        )
    )
    return t


def chip(text, bg, fg):
    return Table(
        [[Paragraph(text, ParagraphStyle("chip", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=fg, alignment=TA_CENTER))]],
        colWidths=[44 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.Color(bg.red, bg.green, bg.blue, alpha=0.9)),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        ),
    )


def metric(value, label, note):
    return Table(
        [
            [Paragraph(value, styles["MetricNumber"])],
            [Paragraph(label, styles["MetricLabel"])],
            [Paragraph(note, styles["Small"])],
        ],
        colWidths=[48 * mm],
        style=TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.6, COLORS["line"]),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        ),
    )


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(COLORS["paper"])
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setStrokeColor(colors.HexColor("#EEE6F8"))
    canvas.setLineWidth(0.8)
    canvas.line(MARGIN_X, PAGE_HEIGHT - 12 * mm, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 12 * mm)
    canvas.line(MARGIN_X, 11 * mm, PAGE_WIDTH - MARGIN_X, 11 * mm)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(COLORS["violet_dark"])
    canvas.drawString(MARGIN_X, PAGE_HEIGHT - 9 * mm, "MARKET VILLA PARTNER PRD")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(COLORS["muted"])
    canvas.drawRightString(PAGE_WIDTH - MARGIN_X, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(COLORS["ink"])
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(COLORS["violet"])
    canvas.circle(PAGE_WIDTH * 0.18, PAGE_HEIGHT * 0.82, 88, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#10B981"))
    canvas.circle(PAGE_WIDTH * 0.86, PAGE_HEIGHT * 0.18, 125, stroke=0, fill=1)
    canvas.setFillColor(colors.Color(1, 1, 1, alpha=0.08))
    canvas.roundRect(18 * mm, 28 * mm, PAGE_WIDTH - 36 * mm, PAGE_HEIGHT - 56 * mm, 18, stroke=1, fill=1)
    canvas.restoreState()


def build_story():
    story = []

    logo_block = []
    if LOGO.exists():
        logo_block.append(Image(str(LOGO), width=34 * mm, height=34 * mm))
        logo_block.append(Spacer(1, 10))

    story.extend(
        logo_block
        + [
            Spacer(1, 54),
            p("PRODUCT REQUIREMENTS DOCUMENT", "CoverEyebrow"),
            p("Market Villa Partner PRD", "CoverTitle"),
            p(
                "A partner-facing product brief for a commerce platform that helps small businesses create polished mini websites, list products, receive WhatsApp inquiries, and grow through discovery.",
                "CoverSubtitle",
            ),
            Table(
                [[chip("Product-led", COLORS["mint_soft"], COLORS["ink"]), chip("WhatsApp-ready", COLORS["violet_soft"], COLORS["violet_dark"]), chip("Partner-ready", COLORS["gold_soft"], COLORS["ink"])]],
                colWidths=[50 * mm, 50 * mm, 50 * mm],
                hAlign="CENTER",
                style=TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]),
            ),
            Spacer(1, 42),
            p("Prepared for potential Market Villa partners", "CoverSubtitle"),
            p("Version 1.0 - June 17, 2026", "CoverEyebrow"),
            PageBreak(),
        ]
    )

    story += [
        p("1. Executive Summary", "SectionTitle"),
        p(
            "Market Villa is a lightweight storefront and business presence platform for small businesses that sell primarily through WhatsApp. The product gives a business owner a clean public store page, product catalog, themes, a dashboard, basic analytics, billing, and admin controls without requiring a full e-commerce setup.",
        ),
        p(
            "This PRD defines the partner-ready direction for Market Villa: what the product does now, what is required for launch stability, where partner integrations can create value, and how success should be measured.",
        ),
        Spacer(1, 8),
        Table(
            [[
                metric("SMBs", "Primary Market", "Food, fashion, beauty, retail, phone/accessories, and local sellers."),
                metric("Products", "MVP Focus", "Product catalogs, public store pages, WhatsApp inquiry flow, and discovery."),
                metric("SaaS", "Business Model", "Subscription plans, featured visibility, domain add-ons, and partner channels."),
            ]],
            colWidths=[54 * mm, 54 * mm, 54 * mm],
            hAlign="CENTER",
            style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]),
        ),
        Spacer(1, 12),
        p("Partner Proposition", "SubTitle"),
        bullet("Help partners onboard merchants into a ready-made storefront system instead of building websites from scratch."),
        bullet("Create new revenue paths through subscriptions, domains, featured visibility, merchant enablement, and future WhatsApp/AI integrations."),
        bullet("Give small businesses a practical digital presence that works with their existing selling behavior."),
        PageBreak(),
    ]

    story += [
        p("2. Product Vision And Opportunity", "SectionTitle"),
        p(
            "Many small businesses need a professional online presence, but full e-commerce can be too complex, expensive, or operationally heavy. Market Villa intentionally sits between a social media page and a full online store: it gives customers a trusted place to browse and gives owners a simple workspace to update products and share links.",
        ),
        p("Problem Statements", "SubTitle"),
        bullet("Business owners often rely on scattered WhatsApp statuses, Instagram posts, and manual replies to show products."),
        bullet("Customers cannot easily browse a current product list, store information, or contact action in one clean place."),
        bullet("Local merchants need practical tools before they need advanced checkout, warehousing, or complex POS integrations."),
        bullet("Partners need a repeatable, low-friction platform for onboarding and supporting many small businesses."),
        p("Market Villa Response", "SubTitle"),
        bullet("A polished public mini-site per business, reachable through a simple store URL."),
        bullet("Product-only catalog management for launch simplicity."),
        bullet("WhatsApp-ready inquiry and order handoff instead of forcing a new sales behavior."),
        bullet("Admin center for platform oversight, pricing, domains, visibility, and subscription controls."),
    ]

    story += [
        Spacer(1, 10),
        table(
            [
                ["User", "Need", "Product Response"],
                ["Business owner", "Create a trusted store page quickly.", "Onboarding, profile, product catalog, themes, shareable store link."],
                ["Public customer", "Browse products and contact the seller.", "Published store page, product cards, WhatsApp action, search/discovery."],
                ["Platform admin", "Manage businesses and monetization.", "Admin center, pricing, domain requests, visibility controls, subscription tools."],
                ["Partner/reseller", "Onboard and grow merchants at scale.", "Roadmap for reseller/agency accounts, analytics, and merchant enablement."],
            ],
            [30 * mm, 58 * mm, 72 * mm],
        ),
        PageBreak(),
    ]

    story += [
        p("3. Product Scope", "SectionTitle"),
        p("MVP Scope", "SubTitle"),
        bullet("Authentication for business owners and protected dashboard access."),
        bullet("Business profile setup: name, slug, category, description, location, WhatsApp, logo, cover, and theme."),
        bullet("Product catalog management: add, edit, delete, image, price, category, availability, and featured state."),
        bullet("Public store page with responsive design, product search, categories, and WhatsApp checkout handoff."),
        bullet("Store directory and Smart Search for public discovery."),
        bullet("Admin center for platform overview, business management, pricing, revenue, visibility, and domains."),
        bullet("Paystack-based subscription/payment foundation."),
        bullet("Basic analytics: store views, WhatsApp clicks, product counts, and visible activity signals."),
        p("Out Of Scope For MVP", "SubTitle"),
        bullet("Services marketplace features. Services have been removed from active scope; `/dashboard/services` redirects to Products."),
        bullet("Wallet/settlement system unless Market Villa begins processing customer payments directly."),
        bullet("Staff permissions until RLS, audit logs, and invitation flows are fully designed."),
        bullet("Full AI semantic search and WhatsApp Cloud automation until post-launch foundations are stable."),
        Spacer(1, 10),
        table(
            [
                ["Area", "Launch Requirement", "Partner Relevance"],
                ["Storefronts", "Fast, clean public pages for merchants.", "Partner can onboard many merchants quickly."],
                ["Products", "Simple product catalog only.", "Keeps merchant training light."],
                ["WhatsApp", "Inquiry/order handoff through WhatsApp.", "Matches how many SMBs already sell."],
                ["Billing", "Subscription and visibility revenue paths.", "Creates commercial alignment for partners."],
                ["Admin", "Operational controls and merchant oversight.", "Supports partner operations and support teams."],
            ],
            [34 * mm, 70 * mm, 56 * mm],
        ),
        PageBreak(),
    ]

    story += [
        p("4. Functional Requirements", "SectionTitle"),
        table(
            [
                ["Feature", "Requirement", "Acceptance Criteria", "Priority"],
                ["Business onboarding", "Create or configure a business workspace with profile and WhatsApp details.", "Owner can complete profile and reach dashboard without support.", "P0"],
                ["Product catalog", "CRUD products with image, price, category, description, and availability.", "Products appear correctly on public store page.", "P0"],
                ["Public store page", "Slug-based page with responsive layout and product-only catalog.", "Published stores load on mobile and desktop with clear CTAs.", "P0"],
                ["WhatsApp flow", "Generate clear WhatsApp inquiry/order messages from store actions.", "Customer can contact seller with useful context.", "P0"],
                ["Store discovery", "Directory and Smart Search for stores/products.", "Search returns relevant results and no-result guidance.", "P1"],
                ["Billing", "Paystack initialize, verify, webhook, subscription status, and admin override.", "Payments update records and plan state reliably.", "P1"],
                ["Admin center", "Manage businesses, pricing, revenue, domain requests, and visibility.", "Admin can find, review, and update platform records.", "P1"],
                ["Analytics", "Track views, WhatsApp clicks, and basic storefront activity.", "Owner sees useful activity without fake revenue metrics.", "P1"],
            ],
            [28 * mm, 54 * mm, 58 * mm, 18 * mm],
        ),
        Spacer(1, 10),
        p("Non-Functional Requirements", "SubTitle"),
        bullet("Mobile-first performance: pages should feel lightweight on low-end mobile devices."),
        bullet("Readable UI: text contrast must pass practical readability checks on public, dashboard, and admin surfaces."),
        bullet("Security: tenant isolation must be enforced through Supabase RLS and server-side checks."),
        bullet("Reliability: payment and webhook flows must handle duplicate references, wrong amounts, failed payments, and retries."),
        bullet("Accessibility: forms need labels, focus states, readable sizes, and clear empty/error states."),
        PageBreak(),
    ]

    story += [
        p("5. Architecture And Integrations", "SectionTitle"),
        p(
            "The current implementation uses Next.js for public pages, dashboard, admin surfaces, API routes, and server actions. Supabase provides authentication, Postgres, and storage. Paystack supports subscription/payment flows. Vercel hosts the application. Future integrations can include AI search, WhatsApp Cloud API, CRM, and partner/reseller dashboards.",
        ),
        table(
            [
                ["Layer", "Current Role", "Launch Requirement"],
                ["Frontend", "Next.js routes for marketing, stores, dashboard, and admin.", "Responsive, route-protected, and visually stable on mobile."],
                ["Data", "Supabase Postgres records for profiles, businesses, products, payments, domains, and events.", "Exported/reviewed migrations and RLS policies for all launch tables."],
                ["Auth", "Supabase Auth plus role checks for admin/business users.", "Forgot password, route protection, and owner isolation tests."],
                ["Payments", "Paystack initialize, verify, webhook, and subscription enforcement routes.", "Live-mode QA, webhook signature testing, and failure-state handling."],
                ["Storage", "Business images for logos, covers, and products.", "Bucket creation and owner-folder policies reviewed."],
                ["AI/Support", "Support assistant API and widget.", "Keep as support tool now; semantic discovery is post-launch."],
            ],
            [30 * mm, 65 * mm, 65 * mm],
        ),
        Spacer(1, 8),
        p("Partner Integration Opportunities", "SubTitle"),
        bullet("Merchant onboarding channel: partner refers or manages businesses entering Market Villa."),
        bullet("Domain and branding support: partner assists businesses with custom domains and professional setup."),
        bullet("Payment and subscription operations: partner can help distribute and support plan upgrades."),
        bullet("Future reseller dashboard: partner can manage assigned merchants, activity, plans, and support status."),
        bullet("Future WhatsApp/API automation: partner can sponsor messaging templates, CRM follow-ups, and order workflows."),
        PageBreak(),
    ]

    story += [
        p("6. Roadmap", "SectionTitle"),
        table(
            [
                ["Phase", "Product Work", "Exit Criteria"],
                ["Now - Launch hardening", "Complete RLS/security proof, mobile QA, Paystack live tests, plan enforcement, SEO metadata, legal review.", "Core flows work end-to-end and launch blockers are closed."],
                ["Beta", "Onboard 3-5 real businesses across food, fashion, beauty, phone/accessories, and retail.", "Feedback cycle completed; owners can add products and share stores without handholding."],
                ["Commercial launch", "Public plans, subscription enforcement, featured visibility, domains, support process, monitoring.", "Businesses can subscribe, upgrade, and request visibility/domain services."],
                ["Partner growth", "Partner onboarding playbook, reporting, reseller/agency accounts, merchant training assets.", "Partner can onboard and support merchants at scale."],
                ["V2 growth", "AI discovery, WhatsApp Cloud API, CRM/follow-up automation, richer analytics, staff permissions.", "Growth features are built on stable security and billing foundations."],
            ],
            [35 * mm, 72 * mm, 53 * mm],
        ),
        Spacer(1, 10),
        p("Launch Readiness Gates", "SubTitle"),
        bullet("Business owner can sign up, create a store, add products, choose theme, publish, and share link."),
        bullet("Public customer can browse products and contact seller through WhatsApp."),
        bullet("Admin can review businesses, pricing, revenue, domains, and visibility requests."),
        bullet("Payments are tested across monthly, yearly, webhook, failed, duplicate, and wrong-amount scenarios."),
        bullet("Security review confirms users cannot access or mutate another business owner's data."),
        PageBreak(),
    ]

    story += [
        p("7. Success Metrics", "SectionTitle"),
        table(
            [
                ["Metric", "Why It Matters", "Initial Target Direction"],
                ["Business activation", "Measures whether owners finish setup.", "Profile + first product + shared store link."],
                ["Published stores", "Shows supply growth.", "Increase weekly during beta and launch."],
                ["Product catalog depth", "Shows merchant usefulness.", "At least 5 products per active store where applicable."],
                ["WhatsApp clicks", "Measures customer intent.", "Track per store and per discovery source."],
                ["Search usage", "Shows discovery value.", "Log queries, no-result searches, and clicked results."],
                ["Paid conversion", "Validates SaaS model.", "Track plan upgrades, renewal, failed payment recovery."],
                ["Partner merchant count", "Measures partner channel traction.", "Track merchants onboarded and retained by partner."],
            ],
            [38 * mm, 62 * mm, 60 * mm],
        ),
        Spacer(1, 10),
        p("Partner Reporting Needs", "SubTitle"),
        bullet("Merchant count by status: draft, published, active, paid, suspended."),
        bullet("Store activity: views, WhatsApp clicks, products, shares, and search appearances."),
        bullet("Revenue activity: plans, upgrades, renewals, visibility packages, and domain add-ons."),
        bullet("Support indicators: setup blockers, failed payments, domain request status, and unresolved tickets."),
        PageBreak(),
    ]

    story += [
        p("8. Risks, Dependencies, And Decisions", "SectionTitle"),
        table(
            [
                ["Risk", "Impact", "Mitigation"],
                ["Incomplete RLS/security proof", "Could expose or allow mutation of tenant data.", "Export/create complete Supabase migrations and run role-based access tests."],
                ["Payment edge cases", "Could create wrong subscriptions or failed renewals.", "Test Paystack initialize, verify, webhook, duplicates, wrong amount, and failed payment states."],
                ["Mobile heaviness", "Could reduce adoption among small business owners.", "Keep dashboard compact, reduce gradients/effects, test on mobile hardware."],
                ["Partner scope creep", "Could delay core launch.", "Keep partner features staged after launch unless they support onboarding directly."],
                ["Support burden", "Owners may need guidance during setup.", "Use onboarding checklist, empty states, help sheets, and partner training assets."],
            ],
            [42 * mm, 55 * mm, 63 * mm],
        ),
        Spacer(1, 10),
        p("Open Decisions For Partner Discussion", "SubTitle"),
        bullet("Will the partner onboard merchants, finance subscriptions, manage support, provide domains, or co-sell plans?"),
        bullet("Should partner merchants have a branded setup flow or a standard Market Villa onboarding flow?"),
        bullet("What commercial model applies: referral fee, revenue share, wholesale plans, or managed service pricing?"),
        bullet("Which integrations matter first: Paystack, WhatsApp Cloud API, CRM, analytics export, or reseller dashboard?"),
        PageBreak(),
    ]

    story += [
        p("9. Partner Collaboration Model", "SectionTitle"),
        p(
            "Market Villa is best positioned as a merchant enablement layer. A partner can help with acquisition, setup, training, billing support, domain activation, or vertical-specific rollout. The product should remain simple for business owners while giving partners enough operational visibility to manage their merchant base.",
        ),
        table(
            [
                ["Partner Role", "What Partner Does", "What Market Villa Provides"],
                ["Referral partner", "Introduces businesses and tracks conversion.", "Storefront platform, plans, activation reporting."],
                ["Onboarding partner", "Sets up profiles, products, themes, and store links.", "Dashboard tools, checklist, admin visibility, training material."],
                ["Managed service partner", "Handles ongoing updates, domains, support, and growth campaigns.", "Admin controls, future reseller dashboard, visibility packages."],
                ["Integration partner", "Connects payment, messaging, analytics, or CRM workflows.", "API-ready roadmap, event data model, commercial integration path."],
            ],
            [38 * mm, 61 * mm, 61 * mm],
        ),
        Spacer(1, 12),
        KeepTogether(
            [
                Table(
                    [[Paragraph("Recommended Next Step", styles["Callout"])]],
                    colWidths=[160 * mm],
                    style=TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, -1), COLORS["mint_soft"]),
                            ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#99F6E4")),
                            ("LEFTPADDING", (0, 0), (-1, -1), 10),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                            ("TOPPADDING", (0, 0), (-1, -1), 8),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                        ]
                    ),
                ),
                Table(
                    [[Paragraph("Run a controlled partner beta with a small merchant cohort, use the launch readiness gates in this PRD, and decide the partner commercial model after real onboarding data is reviewed.", styles["Body"])]],
                    colWidths=[160 * mm],
                    style=TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                            ("BOX", (0, 0), (-1, -1), 0.7, COLORS["line"]),
                            ("LEFTPADDING", (0, 0), (-1, -1), 10),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                            ("TOPPADDING", (0, 0), (-1, -1), 8),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                        ]
                    ),
                ),
            ]
        ),
    ]

    return story


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=MARGIN_X,
        leftMargin=MARGIN_X,
        topMargin=MARGIN_TOP + 4 * mm,
        bottomMargin=MARGIN_BOTTOM + 4 * mm,
        title="Market Villa Partner PRD",
        author="Market Villa",
        subject="Product Requirements Document for potential Market Villa partners",
    )
    story = build_story()
    doc.build(story, onFirstPage=cover, onLaterPages=header_footer)
    print(OUT)


if __name__ == "__main__":
    main()
