# Tala & Tide Beach Resort

Built for John Dos Ancheta. Static HTML5, CSS3, and vanilla JavaScript; eight complete pages. Open `index.html`, or serve this folder with a simple local HTTP server. No build step or framework is required. Images, videos, and fonts are local; the OpenStreetMap embed and external links need an internet connection.

## Concept and design

Beach resort in Pagudpud. Audience: Families, groups of friends, and couples who want a relaxed beach break with easy-to-compare group options. Brand and contacts are fictional. The property map is deliberately a public town reference, never a false business pin. The teal/coral coastal layout and Poppins/Nunito express the concept. Mobile menus, bounded layouts, visible focus, and reduced-motion support protect usability.

## Form handoff

The user requested placeholders. `js/form-config.js` therefore has an empty endpoint. Booking and contact forms validate fields, create a truthful inquiry draft, and offer copy/download. They do not send email, store personal data, make reservations, or collect payment information.

To activate real delivery, obtain an approved Formspree endpoint and set `endpoint` to `https://formspree.io/f/YOUR_REAL_ID`. Both forms use that endpoint. Review the recipient and service privacy settings. Update the displayed fictional contacts and draft-mode notices. Submit a consented test and confirm receipt before evaluation. Do not claim live form functionality until that step succeeds. The endpoint is a public form identifier, not a secret key.

## Local verification and final submission

See `QA-REPORT.md` for checks actually performed. Local delivery is requested; there is no deployed URL, submission QR code, or Classroom upload. Before submission, host the complete folder over HTTPS, replace the reserved `.example` origin in `sitemap.xml` with its real origin, add `Sitemap: https://REAL_DOMAIN/sitemap.xml` to `robots.txt`, verify forms and embeds, generate a 1000×1000 or larger QR code to the real homepage, and scan on two phones. Keep that URL stable during evaluation.

## Sources and assets

All 12 photographs are local, individually credited on `gallery.html#photo-credits`, and documented in `images/photo-manifest.json`. The original 12-second photo film uses the same licensed photographs. No images are shared with the other client sites. Destination references appear on `travel-info.html#sources`; travel durations and budgets are estimates. The SVG logo and favicon are original brand motifs.

## Defense notes

1. Introduce the concept and target travelers, then explain why the navigation, typography, colors, and layout suit them.
2. Show an offering card and compare its rate, capacity, inclusions, duration, and availability.
3. Open a package itinerary and explain what its sample price covers and excludes.
4. Demonstrate Group Cost Calculator, then follow its prefilled inquiry link.
5. Show form validation and explain draft mode honestly. A service endpoint is necessary for real delivery.
6. Filter the gallery, open a photograph, use arrow keys and Escape, and point out photographer credits.
7. Show the reference map and guide, explaining sourced destination facts versus estimates and fictional property details.
8. Demonstrate the mobile menu and mention keyboard focus, alt text, and reduced-motion support.

Tourism tools demonstrated: inquiry preparation, customer calls to action, product presentation, digital itinerary, contact form, interactive map, social-platform integration, labeled sample feedback, promotional offer, credited photo/video presentation, FAQ, engagement planner, metadata, and email/telephone quick links. Real delivery and submission remain a separate handoff step.

Students should review and make their own content/design decisions, confirm instructor approval for AI/outside help, and understand every demonstration. This package does not assert that such approval has already occurred.

## Public deployment

GitHub Pages: https://CharlesManalo.github.io/tala-and-tide-resort/

Source repository: https://github.com/CharlesManalo/tala-and-tide-resort

Published from the root of the `main` branch. Push changes to `main` to update the website. Inquiry forms remain in draft mode until a real endpoint is configured. Earlier local-stage notes describe the original delivery; deployment verification is recorded in DEPLOYMENT-REPORT.md.
