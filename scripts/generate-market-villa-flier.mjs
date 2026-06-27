import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const logoPath = path.join(root, "public", "market-villa-logo.png");
const outSvgPath = path.join(root, "public", "market-villa-free-setup-flier.svg");
const outPngPath = path.join(root, "public", "market-villa-free-setup-flier.png");

const logoBase64 = fs.readFileSync(logoPath).toString("base64");
const logoDataUrl = `data:image/png;base64,${logoBase64}`;

const width = 1080;
const height = 1350;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff7f0"/>
      <stop offset="0.48" stop-color="#f5ecff"/>
      <stop offset="1" stop-color="#ead9ff"/>
    </linearGradient>
    <linearGradient id="purple" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#3b0764"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241436"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#241436" flood-opacity="0.18"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#241436" flood-opacity="0.12"/>
    </filter>
    <style>
      .brand { font-family: Inter, Manrope, Arial, sans-serif; fill: #241436; }
      .headline { font-family: Inter, Manrope, Arial, sans-serif; fill: #241436; font-size: 72px; font-weight: 800; letter-spacing: -4px; }
      .sub { font-family: Inter, Manrope, Arial, sans-serif; fill: #5b4b6b; font-size: 32px; font-weight: 500; letter-spacing: -0.5px; }
      .small { font-family: Inter, Manrope, Arial, sans-serif; fill: #6f607d; font-size: 24px; font-weight: 600; }
      .cardTitle { font-family: Inter, Manrope, Arial, sans-serif; fill: #241436; font-size: 25px; font-weight: 800; letter-spacing: -0.5px; }
      .cardText { font-family: Inter, Manrope, Arial, sans-serif; fill: #6f607d; font-size: 21px; font-weight: 700; letter-spacing: -0.2px; }
      .caps { font-family: Inter, Manrope, Arial, sans-serif; fill: #7c3aed; font-size: 22px; font-weight: 800; letter-spacing: 7px; }
      .white { font-family: Inter, Manrope, Arial, sans-serif; fill: #ffffff; }
      .mutedWhite { font-family: Inter, Manrope, Arial, sans-serif; fill: rgba(255,255,255,0.72); }
    </style>
  </defs>

  <rect width="1080" height="1350" fill="url(#bg)"/>
  <circle cx="966" cy="126" r="220" fill="#7c3aed" opacity="0.13"/>
  <circle cx="116" cy="1175" r="260" fill="#14b8a6" opacity="0.09"/>

  <g transform="translate(80 70)">
    <image href="${logoDataUrl}" x="0" y="0" width="118" height="118" preserveAspectRatio="xMidYMid meet"/>
    <text class="brand" x="140" y="50" font-size="34" font-weight="800" letter-spacing="-1.3">Market Villa</text>
    <text class="small" x="140" y="86">Free business website setup</text>
  </g>

  <g transform="translate(80 230)">
    <text class="caps" x="0" y="0">FOR BUSINESS OWNERS</text>
    <text class="headline" x="0" y="112">Own a website</text>
    <text class="headline" x="0" y="194">for your</text>
    <text class="headline" x="0" y="276">business, free.</text>
    <text class="sub" x="0" y="350">Get assisted setup in minutes.</text>
    <text class="sub" x="0" y="395">Launch a clean storefront and</text>
    <text class="sub" x="0" y="440">receive WhatsApp inquiries.</text>
  </g>

  <g filter="url(#shadow)" transform="translate(665 340)">
    <rect x="0" y="0" width="330" height="640" rx="46" fill="url(#screen)"/>
    <rect x="28" y="32" width="274" height="576" rx="32" fill="#fbf7ff"/>
    <rect x="52" y="62" width="226" height="116" rx="28" fill="url(#purple)"/>
    <circle cx="82" cy="105" r="20" fill="#ffffff" opacity="0.9"/>
    <rect x="112" y="88" width="126" height="14" rx="7" fill="#ffffff" opacity="0.85"/>
    <rect x="112" y="116" width="92" height="10" rx="5" fill="#ffffff" opacity="0.5"/>
    <rect x="52" y="210" width="226" height="46" rx="23" fill="#ffffff" stroke="#eadff5"/>
    <circle cx="76" cy="233" r="10" fill="#7c3aed" opacity="0.9"/>
    <rect x="96" y="226" width="116" height="12" rx="6" fill="#9ca3af"/>
    <g transform="translate(52 292)">
      <rect x="0" y="0" width="98" height="128" rx="22" fill="#fff"/>
      <rect x="14" y="14" width="70" height="54" rx="14" fill="#ede9fe"/>
      <rect x="14" y="84" width="62" height="10" rx="5" fill="#241436"/>
      <rect x="14" y="104" width="42" height="8" rx="4" fill="#7c3aed"/>
      <rect x="128" y="0" width="98" height="128" rx="22" fill="#fff"/>
      <rect x="142" y="14" width="70" height="54" rx="14" fill="#dcfce7"/>
      <rect x="142" y="84" width="58" height="10" rx="5" fill="#241436"/>
      <rect x="142" y="104" width="46" height="8" rx="4" fill="#14b8a6"/>
    </g>
    <rect x="52" y="462" width="226" height="58" rx="29" fill="#7c3aed"/>
    <text class="white" x="165" y="499" font-size="20" font-weight="800" text-anchor="middle">Order on WhatsApp</text>
  </g>

  <g transform="translate(80 770)">
    <rect x="0" y="0" width="540" height="92" rx="28" fill="#ffffff" filter="url(#softShadow)"/>
    <circle cx="48" cy="46" r="22" fill="#ede9fe"/>
    <path d="M39 47 L46 54 L59 38" fill="none" stroke="#7c3aed" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text class="cardTitle" x="88" y="39">No developer needed</text>
    <text class="cardText" x="88" y="68">We help you set it up fast.</text>

    <rect x="0" y="118" width="540" height="92" rx="28" fill="#ffffff" filter="url(#softShadow)"/>
    <circle cx="48" cy="164" r="22" fill="#dcfce7"/>
    <path d="M39 165 L46 172 L59 156" fill="none" stroke="#059669" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text class="cardTitle" x="88" y="157">Products, prices, and photos</text>
    <text class="cardText" x="88" y="186">Presented in one professional link.</text>

    <rect x="0" y="236" width="540" height="92" rx="28" fill="#ffffff" filter="url(#softShadow)"/>
    <circle cx="48" cy="282" r="22" fill="#fef3c7"/>
    <path d="M39 283 L46 290 L59 274" fill="none" stroke="#d97706" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text class="cardTitle" x="88" y="275">Built for WhatsApp sales</text>
    <text class="cardText" x="88" y="304">Customers can inquire immediately.</text>
  </g>

  <g transform="translate(80 1170)">
    <rect x="0" y="0" width="920" height="96" rx="48" fill="url(#purple)" filter="url(#shadow)"/>
    <text class="white" x="460" y="60" font-size="31" font-weight="900" text-anchor="middle">Create your free business page today</text>
  </g>

  <text class="brand" x="540" y="1302" font-size="24" font-weight="800" text-anchor="middle">Call or WhatsApp: 08036882822</text>
  <text class="small" x="540" y="1332" font-size="20" font-weight="700" text-anchor="middle">Market Villa • Professional storefronts for everyday businesses</text>
</svg>`;

fs.writeFileSync(outSvgPath, svg);

await sharp(Buffer.from(svg))
  .png()
  .toFile(outPngPath);

console.log(outPngPath);
