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
OUT = ROOT / "output" / "pdf" / "market-villa-app-prd.pdf"
LOGO = ROOT / "public" / "market-villa-logo.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_X = 18 * mm

INK = colors.HexColor("#241436")
VIOLET = colors.HexColor("#7C3AED")
PLUM = colors.HexColor("#35124D")
MINT = colors.HexColor("#10B981")
MINT_SOFT = colors.HexColor("#D9FFF3")
LILAC = colors.HexColor("#F3E8FF")
PAPER = colors.HexColor("#FCFAFF")
MUTED = colors.HexColor("#6B5D7C")
LINE = colors.HexColor("#DED3EE")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=34, leading=39, textColor=colors.white, alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle("CoverSub", parent=styles["BodyText"], fontName="Helvetica", fontSize=12.5, leading=18, textColor=colors.HexColor("#F6EFFF"), alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle("Eyebrow", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=8.5, leading=11, textColor=MINT, alignment=TA_CENTER, spaceAfter=8))
styles.add(ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=18, leading=22, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=15, textColor=PLUM, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.7, leading=14.5, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle("Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle("Cell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.9, leading=10.4, textColor=INK))
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
    canvas.circle(44 * mm, PAGE_HEIGHT - 58 * mm, 72, stroke=0, fill=1)
    canvas.setFillColor(MINT)
    canvas.circle(PAGE_WIDTH - 30 * mm, 42 * mm, 95, stroke=0, fill=1)
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
    canvas.drawString(MARGIN_X, PAGE_HEIGHT - 9 * mm, "MARKET VILLA APP PRD")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_WIDTH - MARGIN_X, 7 * mm, f"Page {doc.page}")
    canvas.restoreState()


story = []
if LOGO.exists():
    story.append(Image(str(LOGO), width=34 * mm, height=34 * mm))
    story.append(Spacer(1, 12))

story += [
    Spacer(1, 70),
    p("PRODUCT REQUIREMENTS DOCUMENT", "Eyebrow"),
    p("Market Villa App PRD", "CoverTitle"),
    p("A simple product brief for a mobile-first storefront platform that helps small businesses create polished product pages and receive WhatsApp inquiries.", "CoverSub"),
    Table([[chip("Mobile-first", MINT_SOFT), chip("Product-only MVP", LILAC), chip("WhatsApp-ready", colors.HexColor("#FFF7D6"))]], colWidths=[48 * mm, 48 * mm, 48 * mm], hAlign="CENTER"),
    Spacer(1, 48),
    p("Version 1.0 - June 17, 2026", "Eyebrow"),
    PageBreak(),
]

story += [
    p("1. Product Overview", "H1"),
    p("Market Villa helps small businesses create a clean mini website where customers can view products, understand the business, and start a WhatsApp inquiry or order conversation."),
    p("The product should feel light, practical, and trustworthy. It should not feel like a heavy enterprise dashboard. The main design priority is a compact mobile experience that lets a business owner update their store quickly."),
    p("Core Product Promise", "H2"),
    bullet("Create a professional store page without technical skills."),
    bullet("List products with images, prices, categories, and availability."),
    bullet("Share one clean store link with customers."),
    bullet("Let customers move from browsing to WhatsApp inquiry quickly."),
    bullet("Give admins simple tools to manage businesses, plans, pricing, domains, and visibility."),
    Spacer(1, 8),
    table([
        ["Product Area", "What It Should Do"],
        ["Public website", "Explain Market Villa, show stores, and help visitors start or browse."],
        ["Business dashboard", "Let owners manage profile, products, theme, billing, domain, analytics, and settings."],
        ["Public store page", "Show the business and product catalog clearly on mobile and desktop."],
        ["Admin center", "Give platform operators business, billing, pricing, visibility, and domain controls."],
    ], [42 * mm, 118 * mm]),
    PageBreak(),
]

story += [
    p("2. MVP Scope", "H1"),
    p("The MVP should stay focused on products, storefronts, discovery, WhatsApp handoff, and basic business management."),
    table([
        ["Feature", "Requirement", "Priority"],
        ["Signup and login", "Business owners can create an account, log in, and access their dashboard.", "P0"],
        ["Business profile", "Owners can update name, slug, description, category, location, WhatsApp, logo, cover, and theme.", "P0"],
        ["Products", "Owners can add, edit, delete, publish/unpublish, categorize, price, and image products.", "P0"],
        ["Public store page", "Customers can browse a published store, search products, view categories, and contact the business.", "P0"],
        ["WhatsApp checkout", "Cart or product inquiry creates a useful WhatsApp message for the seller.", "P0"],
        ["Store discovery", "Visitors can browse live stores and use Smart Search where relevant.", "P1"],
        ["Dashboard analytics", "Owners see basic activity such as views, WhatsApp clicks, products, and orders/inquiries.", "P1"],
        ["Admin center", "Admins can manage businesses, pricing, revenue, domains, visibility, and platform status.", "P1"],
    ], [38 * mm, 92 * mm, 20 * mm]),
    Spacer(1, 10),
    p("Out Of Scope For This Version", "H2"),
    bullet("Services marketplace or service booking features."),
    bullet("Wallets, settlements, or direct customer payment processing."),
    bullet("Staff permissions and activity logs."),
    bullet("Full CRM, automation, and WhatsApp Cloud API workflows."),
    bullet("Advanced AI semantic search beyond current support/search foundations."),
    PageBreak(),
]

story += [
    p("3. Key User Flows", "H1"),
    table([
        ["Flow", "Steps", "Success State"],
        ["Business onboarding", "Sign up -> create business -> complete profile -> add first product -> choose theme -> share store.", "Owner has a presentable store link."],
        ["Product management", "Open Products -> add/edit product -> upload image -> set price/category -> save.", "Product appears correctly on public store page."],
        ["Customer browsing", "Open store link -> search/browse products -> add item or contact seller -> WhatsApp opens.", "Customer sends a clear inquiry/order message."],
        ["Store discovery", "Open Stores -> browse featured/live stores -> search -> open store page.", "Visitor finds a relevant business quickly."],
        ["Admin review", "Open admin center -> search business -> review status, subscription, domain, visibility.", "Admin can understand and act on platform activity."],
    ], [38 * mm, 76 * mm, 46 * mm]),
    Spacer(1, 10),
    p("Important Empty States", "H2"),
    bullet("No products yet: explain the value and show a strong Add Product action."),
    bullet("No orders/inquiries yet: encourage sharing the store link."),
    bullet("No analytics yet: explain that activity appears after store visits and WhatsApp clicks."),
    bullet("No search results: suggest different store/product keywords."),
    PageBreak(),
]

story += [
    p("4. UX And Visual Direction", "H1"),
    p("Market Villa should feel like a modern mobile commerce management app: light, compact, fast, and useful. Purple remains the brand anchor, but mobile dashboard surfaces should avoid heavy gradients and oversized decorative panels."),
    table([
        ["Area", "Direction"],
        ["Typography", "Use tight, readable sans-serif body text. Keep headings clear but not oversized inside dashboards."],
        ["Mobile background", "Use a flat warm purple background for mobile dashboard surfaces, not gradients."],
        ["Cards", "Use compact white cards with subtle borders and minimal shadows."],
        ["Buttons", "Use clear primary actions, smaller radius, readable labels, and icon support where helpful."],
        ["Navigation", "Mobile should use bottom navigation plus a More/settings hub instead of a purple sidebar."],
        ["Search", "Smart Search should appear in the navbar only on individual store pages."],
        ["Support widget", "Use a small chat bubble icon without a heavy circular floating background."],
        ["Contrast", "Avoid light text on light backgrounds and dark text on dark backgrounds. Fix section-level overrides when needed."],
    ], [38 * mm, 122 * mm]),
    Spacer(1, 10),
    p("Design Principles", "H2"),
    bullet("Make the first action obvious on every screen."),
    bullet("Use short, practical copy instead of marketing-heavy explanations inside the app."),
    bullet("Prefer product-first workflows over service or booking complexity."),
    bullet("Keep mobile screens dense but breathable: compact cards, clear labels, less decoration."),
    PageBreak(),
]

story += [
    p("5. Success Metrics And Launch Checklist", "H1"),
    table([
        ["Metric", "Why It Matters"],
        ["Activated businesses", "Shows whether owners can complete setup and publish a useful store."],
        ["Published stores", "Measures usable supply on the platform."],
        ["Products per store", "Shows catalog usefulness and merchant effort."],
        ["Store views", "Shows customer traffic."],
        ["WhatsApp clicks", "Measures buying or inquiry intent."],
        ["Search usage", "Shows discovery value and helps improve ranking/no-result states."],
        ["Paid upgrades", "Validates subscription and visibility monetization."],
    ], [44 * mm, 116 * mm]),
    Spacer(1, 10),
    p("Launch Checklist", "H2"),
    bullet("Signup, login, onboarding, product creation, store publishing, and WhatsApp flow work end-to-end."),
    bullet("Dashboard and public store pages are readable and polished on mobile."),
    bullet("Admin center can manage businesses, pricing, visibility, domains, and revenue views."),
    bullet("Paystack initialize, verify, webhook, failed payments, and duplicate references are tested."),
    bullet("Supabase RLS, storage rules, and owner isolation are reviewed before full launch."),
    bullet("Legal pages, help pages, sitemap, robots, and production environment variables are reviewed."),
    Spacer(1, 12),
    Table(
        [[p("Recommended next step: run a small beta with real businesses, observe setup friction, and refine mobile onboarding, empty states, product management, and public store readability before a wider launch.", "Body")]],
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
    title="Market Villa App PRD",
    author="Market Villa",
    subject="Simple product requirements document for the Market Villa app",
)
doc.build(story, onFirstPage=cover, onLaterPages=header_footer)
print(OUT)
