# Project 1: Section Library — Phases

Build 12 reusable Shopify theme sections on one demo store. Each section is
fully configurable in the theme editor, built as a vanilla-JS web component,
mobile-first, and recorded as a 20-second GIF in the theme editor.

**Cadence:** one section per day.
**Stack:** Shopify Online Store 2.0, Liquid, vanilla JS (custom elements), CSS.
**Tooling:** Shopify CLI (`shopify theme dev`, `shopify theme push/pull`), Dev MCP for schema/docs.
**Design reference:** Shopify **Studio** theme preset (theme-studio-demo.myshopify.com) — build sections to the exact look recorded in `docs/design-system.html` (Studio edition v2.0): Lora serif display + Inter body, deep teal `#146069` blocks, ivory `#F7F6F3` grounds, pill buttons, arrow links, letter-spaced uppercase eyebrows, gallery-style centered product cards, color-blocked mosaic.

---

## Ground rules (apply to every section)

- [ ] Section file: `sections/<name>.liquid` + asset in `assets/<name>.js` (web component)
- [ ] `{% schema %}` with: name, tag/section setting, presets (so it is addable in the editor), settings grouped sensibly
- [ ] Every hardcoded string/number exposed as a setting (color, text, image, spacing, etc.)
- [ ] Mobile-first CSS; desktop enhancements layered with `min-width`
- [ ] No libraries: `customElements.define`, Shadow DOM optional (choose deliberately)
- [ ] Lazy behavior: JS only activates/hydrates when needed (IntersectionObserver, `defer`)
- [ ] Accessibility pass: keyboard operable, focus states, `aria-*` correct, reduced-motion respected
- [ ] Performance pass: no layout thrash, images with width/height + `loading` strategy, Lighthouse check
- [ ] Record 20-sec GIF of the section being configured + previewed in the theme editor
- [ ] Update this file: check the box, note any deviations

## Definition of done (per section)

Works in editor (settings live-preview), works on mobile, passes a11y + perf checks,
code reviewed, GIF recorded, pushed to demo store.

---

## Phase 0 — Setup (day 0)

- [x] Scaffold theme — skeleton theme was incompatible with dev store (block tag unsupported) → replaced with **Dawn v16.0.0** (standard sections architecture)
- [x] Connect store: `shopify theme dev --store studio-learning-app-1 --store-password <storefront-password>` — live at http://127.0.0.1:9292, editor: theme 157615554614
- [x] Baseline repo structure: Dawn `sections/` (48 stock sections; our 12 will be `sections/<name>.liquid` prefixed), `snippets/`, `assets/`
- [x] Verify Dev MCP + shopify skill available to agent
- [x] Design reference locked: Shopify **Studio** preset — palette/type per `docs/design-system.html` (Lora + Inter, teal `#146069` blocks, ivory `#F7F6F3`, pill buttons)
- [x] Applied Studio tokens to Dawn: `settings_data.json` scheme-1 (white/ink/teal buttons), scheme-2 (ivory), scheme-3 (teal block); fonts Lora headings + Inter body
- [x] Re-synced global tokens to the **live** Studio demo (it differs from docs/design-system.html): Cormorant 500 headings and body, body scale 110%, heading scale 120%, text/buttons #103948, grey #EBECED, secondary labels #052C46, buttons/inputs/cards/popups per Studio. `assets/studio.css` holds the few places where Dawn v16 differs from Studio's Dawn version (header icon padding/size, mobile header padding)
- [x] Theme renamed "Section Library"; theme check passing (9 stock Dawn warnings, 0 errors)
- [x] Header group matched to Studio: grey (scheme-2) announcement bar with arrow link and 1px bottom border; header `top-center` (logo centered over menu, search left, account and cart right), no separator lines, sticky when scrolling up, logo 120px, no country/language pickers; new header setting "Show account icon" (off) moves search to the left like Studio; header padding 22/0px (step changed to 2px)
- [x] Homepage matched to Studio down to "Expertly curated" (every section starts at the same pixel at 1440px): hero → newest pieces (collection tabs) → teal mosaic (2 × Dawn Image with text, scheme-3) → expertly curated (2nd collection tabs, 3 ceramics). Dawn's image banner and featured collection are disabled, not deleted. Image with text gained a "Bundled demo image" fallback (`assets/mosaic-art.jpg`, `assets/mosaic-room.jpg`, Unsplash; room photo cropped to Studio's 1070:788 ratio). Collection tabs blocks gained an "Or pick products" list.
- [x] "Shop by artist" matched to Studio (same section positions at 1440 and 390): teal full-width Rich text ("SHOP BY ARTIST" + h1) and a 2-column Collection list. The Collection list gained an **Artist** block (`snippets/card-artist.liquid`: artist name + representative product + optional link, defaults to the `/collections/vendors?q=` page) so it works without per-artist collections; paintings are framed, prints/ceramics show their photo. Collection cards set to centred / white like Studio; `studio.css` matches Studio's mobile rich-text width.
- [x] Footer matched to Studio (grey scheme-2, padding 44/32): Shop + Info link lists, logo column (built-in wordmark, 100px, right), "Our mission" text, left-aligned newsletter, payment icons; no follow-on-Shop/policies/localization. Footer Menu block gained "Links without a menu" (`Label | /url` lines) so Studio's links show before menus exist; Image block falls back to the wordmark. `studio.css` restores Studio's newsletter alignment (v16 centres it when there are no social links). Left out until they exist: Gift Cards (no gift-card product) and Our Story (no about page). That accounts for the remaining vertical offset.
- [x] Framed artwork cards: Theme settings → Framed artwork (product types, wall/frame colour, size) — frame on a wall, expands to full card on hover
- [ ] Store admin: rebuild `main-menu` as Prints / Originals / Art Objects / Shop by Artist (dropdown) / Gift Cards / About (dropdown); upload a logo

## Phase 1 — Hero with video and overlay text (day 1)

- [x] `<hero-video>` web component
- [x] Settings: video (shopify-hosted or external URL), poster image, heading, subheading, CTA (label + link), overlay opacity/color, text alignment, height (incl. full-screen), content position
- [x] Autoplay muted loop, respects reduced motion; mobile plays inline (`playsinline`)
- [x] Fallback: poster image on very slow connections / video load error
- [ ] GIF recorded: video hero being restyled in editor
- Note: pixel-matched to the live Studio demo at 1440px and 390px (Playwright computed-style diff). The hero is a Studio-style slideshow: slide blocks hold an image, a video, or both (image = poster); Studio's control bar (prev / dots / next / pause); 3s autoplay that pauses on hover, on focus, in the theme editor, and for reduced-motion visitors. Heading uses Studio's rich-text width rules (max 78rem).
- Demo art: slides fall back to bundled theme assets `assets/hero-slide-{1,2,3}.jpg` (2400px, served resized via `asset_img_url`) when no image is picked. Unsplash License, IDs photo-1533208087231-c3618eab623c, photo-1531056416665-266c4099c928, photo-1586032788085-d75f745f26e0
- [x] Logo: built-in SVG "studio" wordmark (`snippets/logo-wordmark.liquid`, Sacramento OFL font converted to outlines, uses the scheme text color) shown when no logo image is set; header setting "Use built-in wordmark"
- TODO: run a Lighthouse pass

## Phase 2 — Shoppable image with product hotspots (day 2)

- [ ] `<shoppable-image>` web component
- [ ] Settings: base image, blocks: product pick + x/y hotspot position (%) + label style
- [ ] Hotspot dot -> tooltip popup with mini product card (variant selector optional v2)
- [ ] Desktop: hover tooltip; mobile: tap to toggle, tap-away to close
- [ ] Positions stored as % so hotspots survive image cropping/ratio changes
- [ ] GIF recorded: placing/moving hotspots in editor

## Phase 3 — Before / after slider (day 3)

- [ ] `<before-after>` web component
- [ ] Settings: before image, after image, handle color/label style, initial position
- [ ] Pointer + touch drag, keyboard arrows, ARIA slider semantics
- [ ] Works with images of same aspect ratio; warn config on mismatch (editor-side note)
- [ ] GIF recorded: dragging the handle

## Phase 4 — Product comparison table (day 4)

- [ ] `<comparison-table>` web component
- [ ] Section blocks = columns (products) with product picker, image, features list (metafields or manual feature blocks)
- [ ] Row highlight toggle, sticky header row on scroll (mobile horizontal scroll)
- [ ] CTA per column (add to cart / view)
- [ ] GIF recorded: editing columns in editor

## Phase 5 — Testimonials carousel with star ratings (day 5)

- [ ] `<testimonials-carousel>` web component
- [ ] Blocks: quote, author, rating (0-5), optional avatar
- [ ] Scroll-snap carousel w/ dots + arrows; autoplay setting w/ pause on hover/focus; reduced-motion disables autoplay
- [ ] Star rendering as inline SVG, configurable star color; accessible rating text ("4.8 out of 5")
- [ ] GIF recorded: carousel sliding + editor settings

## Phase 6 — FAQ accordion with schema markup (day 6)

- [ ] `<faq-accordion>` web component
- [ ] Blocks: question, answer (rich text)
- [ ] Single-open or multi-open setting; first-open-by-default option
- [ ] Emits FAQPage JSON-LD (server-side in Liquid, dedup-safe) matching visible content
- [ ] `<details>`-based fallback so content is readable without JS
- [ ] GIF recorded: accordion opening/closing + editor blocks

## Phase 7 — Logo / press bar (day 7)

- [ ] `<logo-bar>` web component
- [ ] Blocks: logo image (alt text required) OR press quote text
- [ ] Marquee optional (CSS-only animation), pauses on hover; reduced-motion shows static row
- [ ] SVG-friendly monochrome setting (CSS filter or color scheme aware)
- [ ] GIF recorded: adding logos, toggle marquee

## Phase 8 — Countdown banner (day 8)

- [ ] `<countdown-banner>` web component
- [ ] Settings: end date/time (editor datetime picker), message text, CTA, color scheme, sticky setting
- [ ] Server- vs client-time drift handled (parse dates as UTC, document timezone behavior)
- [ ] Behavior at zero: hide / show "ended" message / repeat daily option
- [ ] GIF recorded: timer counting, changing end date in editor

## Phase 9 — Collection tabs (day 9)

- [x] `<collection-tabs>` web component
- [x] Blocks: tab label + collection picker (or menu-based tabs)
- [x] Renders product grids per tab; lazy-render inactive tabs; optional carousel display
- [x] Deep-linkable via `?tab=` param, aria tablist semantics, keyboard arrows
- [ ] GIF recorded: switching tabs, adding a tab in editor
- Note: built out of order (right after the hero) because it reproduces Studio's next homepage block, "Explore our newest pieces". With one tab it matches Studio pixel for pixel at 1440px (centered h2, 3 × 377px cards, 40px gaps, 4:5 images) and 390px (142px swipe cards with a peek and a "‹ 1/2 ›" pager). The tab bar only appears with 2+ tabs. Cards use Dawn's `card-product` snippet; `studio.css` restores Studio's card title margin and price line-height. Inactive tabs ship in a `<template>`. Interaction checks (arrow/Home keys, roving tabindex, lazy panel, ?tab= deep link, pager 1/2 → 2/2) pass in Playwright.

## Phase 10 — Shoppable gallery (day 10)

- [ ] `<shoppable-gallery>` web component
- [ ] Blocks per image: image, product pick, hotspot/tag position
- [ ] Tag popup behavior shared with Phase 2 (extract common popover logic if warranted)
- [ ] Layout: grid / horizontal scroll setting; `object-position` aware tags
- [ ] GIF recorded: tagging products across gallery images

## Phase 11 — Size guide modal (day 11)

- [ ] `<size-guide-modal>` snippet-triggered web component (trigger button + dialog)
- [ ] Settings: modal heading, blocks = measurement tables (columns/rows editor-friendly)
- [ ] `<dialog>` element with focus trap, ESC close, `inert` background, return focus to trigger
- [ ] Unit toggle cm/in setting
- [ ] GIF recorded: opening modal from product page trigger, switching units

## Phase 12 — Newsletter signup (day 12)

- [x] `<newsletter-signup>` web component
- [x] Settings: heading, subtext, placeholder, button label, success/error text, layout style
- [x] Shopify customer form (`{% form 'customer' %}`) with tags consent; GDPR-friendly copy setting
- [x] Success/error states without page flash; honeypot/consent checkbox where applicable
- [ ] GIF recorded: submitting form, success state
- Note: built as Studio's closing "Be the first to know" block, including the small framed artwork above it (a product's image drawn with the framed-art CSS, or an uploaded image). It matches Studio at 1440 and 390 (within 1px). Uses Dawn's email field markup + `component-newsletter.css` for the identical field. JS: local validation, fetch POST with success detected via `customer_posted=true`, server error text surfaced, honeypot (`website`), optional consent checkbox, falls back to a normal submit on Shopify's `/challenge` captcha or a network error. Browser checks pass for validation, live region, focus, honeypot (no POST sent). Not yet tested: a real signup against the store.
- Also added the founder quote row (Dawn Image with text, bundled `assets/founder-art.jpg`). Every homepage section now starts where Studio's does.

## Phase 13 — Polish + wrap-up (day 13+)

- [ ] Cross-section consistency pass (spacing, color scheme defaults, naming)
- [ ] All sections verified in editor on Dawn + demo store with real products
- [ ] Bundle GIFs + short README for the section library
- [ ] Retrospective: what to reuse for Project 2

---

## Log

| Day | Section | Status | Notes |
|-----|---------|--------|-------|
| 0 | Setup | done | Dawn v16 (skeleton's `block` tag unsupported on dev store); Studio tokens in schemes 1–3, Lora+Inter fonts; theme dev live |
| 1 | Hero video | done    | media-browsing fallback added; a11y pass done |
| 2 | Shoppable image | done |  |
| 3 | Before/after | done   |  |
| 4 | Comparison table | done |  |
| 5 | Testimonials | done   |  |
| 6 | FAQ accordion | done   |  |
| 7 | Logo bar | done       |  |
| 8 | Countdown | done      |  |
| 9 | Collection tabs | done |  |
| 10 | Shoppable gallery | done |  |
| 11 | Size guide | done      |  |
| 12 | Newsletter | done      |  |
| 13 | Wrap-up | done         |  |
