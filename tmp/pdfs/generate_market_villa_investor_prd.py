from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "market-villa-investor-product-brief.pdf"
LOGO = ROOT / "public" / "market-villa-logo.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_X = 18 * mm

INK = colors.HexColor("#241436")
PLUM = colors.HexColor("#35124D")
VIOLET = colors.HexColor("#7C3AED")
MINT = colors.HexColor("#10B981")
MINT_SOFT = colors.HexColor("#D9FFF3")
LILAC = colors.HexColor("#F3E8FF")
GOLD_SOFT = colors.HexColor("#FFF7D6")
PAPER = colors.HexColor("#FCFAFF")
MUTED = colors.HexColor("#675A78")
LINE = colors.HexColor("#DED3EE")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=32, leading=37, textColor=colors.white, alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle("CoverSub", parent=styles["BodyText"], fontName="Helvetica", fontSize=12.4, leading=18, textColor=colors.HexColor("#F6EFFF"), alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle("Eyebrow", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=MINT, alignment=TA_CENTER, spaceAfter=8))
styles.add(ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=15, textColor=PLUM, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.8, leading=14.5, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle("Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle("Cell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.9, leading=10.5, textColor=INK))
styles.add(ParagraphStyle("Head", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8.2, leading=10, textColor=colors.white))
styles.add(ParagraphStyle("Chip", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=INK, alignment=TA_CENTER))


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullet(text):
    return p(f"- {text}")


def table(rows, widths):
    body = []
    for r, row in enumerate(rows):
        body.append([Paragraph(str(cell), styles["Head" if r == 0 else "Cell"]) for cell in row])
    t = Table(body, colWidths=widths, hAlign="LEFT", repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PLUM),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
    ]))
    return t


def chip(text, bg):
    return Table([[Paragraph(text, styles["Chip"])]], colWidths=[43 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))


def cover(canvas, _doc):
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setFillColor(VIOLET)
    canvas.circle(42 * mm, PAGE_HEIGHT - 58 * mm, 76, stroke=0, fill=1)
    canvas.setFillColor(MINT)
    canvas.circle(PAGE_WIDTH - 28 * mm, 40 * mm, 96, stroke=0, fill=1)
    canvas.setFillColor(colors.Color(1, 1, 1, alpha=0.08))
    canvas.roundRect(18 * mm, 28 * mm, PAGE_WIDTH - 36 * mm, PAGE_HEIGHT - 56 * mm, 18, stroke=1, fill=1)
    canvas.restoreState()


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    canvas.setStrokeColor(colors.HexColor("#EEE6F8"))
    canvas.line(MARGIN_X, PAGE_HEIGHT - 12 * mm, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 12 * mm)
    canvas.line(MARGIN_X, 11 * mm, PAGE_WIDTH - MARGIN_X, 11 * mm)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(PLUM)
    canvas.drawString(MARGIN_X, PAGE_HEIGHT - 9 * mm, "MARKET VILLA PRODUCT BRIEF")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_WIDTH - MARGIN_X, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


story = []
if LOGO.exists():
    story.append(Image(str(LOGO), width=34 * mm, height=34 * mm))
    story.append(Spacer(1, 12))

story += [
    Spacer(1, 66),
    p("INVESTOR PRODUCT BRIEF", "Eyebrow"),
    p("Market Villa", "CoverTitle"),
    p("A mobile-first storefront platform for small businesses that need a polished product page, simple business tools, and a direct path from browsing to WhatsApp inquiry.", "CoverSub"),
    Table([[chip("Small business commerce", MINT_SOFT), chip("Product storefronts", LILAC), chip("WhatsApp selling", GOLD_SOFT)]], colWidths=[48 * mm, 48 * mm, 48 * mm], hAlign="CENTER"),
    Spacer(1, 50),
    p("Version 1.0 - June 17, 2026", "Eyebrow"),
    PageBreak(),
]

story += [
    p("1. What Market Villa Is", "H1"),
    p("Market Villa is a lightweight commerce presence platform for small businesses. It gives each business a clean mini website where customers can browse products, understand the business, and start a WhatsApp conversation with clear buying intent."),
    p("The app is designed for merchants who are not ready for a complex e-commerce operation but need something more trusted, organized, and shareable than social media posts or WhatsApp status updates."),
    p("The Product In One Sentence", "H2"),
    p("Market Villa turns a small business into a polished, searchable, WhatsApp-ready storefront in minutes."),
    p("Who It Serves", "H2"),
    bullet("Small retailers selling fashion, beauty, food, phones, accessories, home items, and local products."),
    bullet("Business owners who already sell through WhatsApp and need a better way to present products."),
    bullet("Customers who want a simple page to browse products before contacting a seller."),
    bullet("Platform operators who need tools to manage businesses, plans, payments, visibility, and domains."),
    Spacer(1, 8),
    table([
        ["Audience", "Need", "Market Villa Experience"],
        ["Business owner", "A professional store link without technical setup.", "Dashboard, profile setup, product catalog, themes, and shareable store URL."],
        ["Customer", "A clear way to browse and contact a seller.", "Public store page, product search, product cards, and WhatsApp action."],
        ["Platform operator", "Visibility into business activity and monetization.", "Admin center for businesses, pricing, revenue, domains, and visibility."],
    ], [34 * mm, 58 * mm, 68 * mm]),
    PageBreak(),
]

story += [
    p("2. What The App Should Look Like", "H1"),
    p("Market Villa should feel modern, light, and business-ready. The visual language should communicate trust and ease: premium enough for a public customer, but simple enough for a merchant to manage daily on a phone."),
    table([
        ["Surface", "Visual Direction"],
        ["Public homepage", "Premium but direct. It should quickly explain the value, show real storefront examples, and guide visitors to create or explore stores."],
        ["Stores page", "Clean directory of live businesses with strong search, readable cards, and clear store entry points."],
        ["Public store page", "Product-first storefront with business identity, cover image, catalog, product search, categories, and WhatsApp contact actions."],
        ["Mobile dashboard", "Compact, bright, and light. Flat warm-purple background, white cards, minimal shadows, practical actions, and no heavy sidebar."],
        ["Admin center", "Readable operational dashboard with strong contrast, clear navigation, and scan-friendly business controls."],
    ], [38 * mm, 122 * mm]),
    Spacer(1, 10),
    p("Design Personality", "H2"),
    bullet("Clean and premium, but not cold."),
    bullet("Mobile-first and compact, but not cramped."),
    bullet("Product-focused, practical, and action-oriented."),
    bullet("Purple-led brand identity supported by bright mint, soft lilac, white surfaces, and high-contrast text."),
    bullet("Buttons and cards should feel familiar to mobile commerce users: clear labels, useful icons, and obvious next actions."),
    PageBreak(),
]

story += [
    p("3. What The App Should Do", "H1"),
    p("Market Villa should make the path from business setup to customer inquiry feel short and natural. The core product flow is: create a business, add products, publish a store, share the link, receive WhatsApp inquiries, and track activity."),
    table([
        ["Capability", "App Behavior"],
        ["Business setup", "The owner creates a business profile with name, category, description, location, WhatsApp number, logo, cover image, and theme."],
        ["Product management", "The owner adds and edits products with images, prices, categories, descriptions, and availability status."],
        ["Public storefront", "Customers open a store link, browse products, search within the catalog, and understand the business at a glance."],
        ["WhatsApp handoff", "Customer actions create a useful WhatsApp inquiry or order message that includes product/order context."],
        ["Store discovery", "Visitors can browse live stores and search for businesses or products across Market Villa."],
        ["Business dashboard", "Owners can view setup progress, quick actions, basic analytics, products, orders/inquiries, billing, themes, domains, and settings."],
        ["Admin center", "Operators can monitor businesses, manage pricing, review revenue, handle visibility requests, and manage domain requests."],
    ], [42 * mm, 118 * mm]),
    Spacer(1, 10),
    p("Core User Journey", "H2"),
    bullet("Owner signs up and creates a business workspace."),
    bullet("Owner adds profile details and first products."),
    bullet("Owner chooses a storefront style and publishes the store."),
    bullet("Owner shares the store link across WhatsApp, Instagram, and other channels."),
    bullet("Customer browses the store and starts a WhatsApp inquiry or order."),
    bullet("Owner tracks product count, views, WhatsApp clicks, and store readiness from the dashboard."),
    PageBreak(),
]

story += [
    p("4. Product Modules", "H1"),
    table([
        ["Module", "Purpose", "Experience Goal"],
        ["Marketing site", "Explain Market Villa and convert visitors.", "Clear promise, strong visuals, simple CTAs."],
        ["Store directory", "Help customers discover businesses.", "Searchable, readable, and fast."],
        ["Public store", "Give each business a customer-facing page.", "Product-first, trusted, mobile-ready."],
        ["Dashboard home", "Show business health and next actions.", "Compact overview with setup progress and quick links."],
        ["Products", "Manage the catalog.", "Fast product entry, clear empty states, easy editing."],
        ["Orders/inquiries", "Support WhatsApp-led selling.", "Clear inquiry/order summaries and action history."],
        ["Themes", "Let owners choose a storefront style.", "Visual previews, plan-aware theme access, simple selection."],
        ["Billing", "Manage plans and payments.", "Readable plan status, upgrade path, payment history."],
        ["Analytics", "Show basic store activity.", "Views, WhatsApp clicks, products, and customer interest signals."],
        ["Admin center", "Operate the platform.", "Scan-friendly controls for businesses, pricing, revenue, domains, and visibility."],
    ], [32 * mm, 58 * mm, 70 * mm]),
    PageBreak(),
]

story += [
    p("5. Business Model And Growth Potential", "H1"),
    p("Market Villa can grow as a SaaS platform for small businesses, with optional visibility and setup services layered around the core storefront product."),
    table([
        ["Revenue Path", "Description"],
        ["Subscription plans", "Businesses pay for theme access, store features, visibility controls, and platform tools."],
        ["Featured visibility", "Businesses can pay for better placement across discovery surfaces."],
        ["Custom domains", "Businesses can request domain setup and yearly management."],
        ["Managed setup", "Market Villa can support businesses that want help setting up a polished page."],
        ["Future automation", "WhatsApp Cloud API, CRM follow-ups, AI discovery, and merchant growth tools can expand revenue over time."],
    ], [44 * mm, 116 * mm]),
    Spacer(1, 10),
    p("Why It Can Matter", "H2"),
    bullet("It targets businesses that already sell online informally but lack a trusted storefront."),
    bullet("It keeps the merchant workflow familiar by using WhatsApp instead of forcing a full checkout behavior too early."),
    bullet("It creates a public discovery layer for local businesses and products."),
    bullet("It can expand from storefronts into analytics, visibility, domains, CRM, and automation."),
    PageBreak(),
]

story += [
    p("6. Success Signals", "H1"),
    table([
        ["Signal", "Meaning"],
        ["Business activation", "Owners complete setup, add products, and share their store link."],
        ["Published stores", "The platform has usable customer-facing supply."],
        ["Products per store", "Businesses are investing real catalog effort."],
        ["Store views", "Shared links and discovery are creating traffic."],
        ["WhatsApp clicks", "Customers are showing buying or inquiry intent."],
        ["Search usage", "Customers are using Market Villa to discover stores/products."],
        ["Paid upgrades", "Businesses see enough value to pay for better features or visibility."],
        ["Retention", "Businesses return to update products and manage their store."],
    ], [42 * mm, 118 * mm]),
    Spacer(1, 12),
    Table(
        [[p("Product North Star: help small businesses move from scattered product posts to a trusted, searchable, WhatsApp-ready storefront that customers can browse and act on.", "Body")]],
        colWidths=[160 * mm],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), MINT_SOFT),
            ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#99F6E4")),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]),
    ),
]

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(
    str(OUT),
    pagesize=A4,
    leftMargin=MARGIN_X,
    rightMargin=MARGIN_X,
    topMargin=22 * mm,
    bottomMargin=20 * mm,
    title="Market Villa Investor Product Brief",
    author="Market Villa",
    subject="Investor-facing product brief for the Market Villa app",
)
doc.build(story, onFirstPage=cover, onLaterPages=header_footer)
print(OUT)
