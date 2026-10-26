---
name: NutriBalance
description: Warm editorial identity and a clear professional workspace for Mauricio Pelozo.
colors:
  forest: "#173f35"
  forest-hover: "#225647"
  ivory: "#f6f3eb"
  paper: "#fffefa"
  ink: "#243b33"
  muted: "#5c6c62"
  line: "#d8dfd5"
  sage: "#e8eee3"
  clay: "#955e44"
  error: "#983e31"
  white: "white"
  workspace-bg: "#f4f5ef"
  field-line: "#b9c5b8"
  status-green-bg: "#e3ece0"
  status-green-text: "#315b3c"
  status-amber-bg: "#f3e8d5"
  status-amber-text: "#745025"
typography:
  display:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "clamp(54px,5.8vw,88px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "clamp(36px,4.2vw,58px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.035em"
  workspace-title:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.035em"
  body:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  button:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "14px"
    fontWeight: 600
  field-label:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "13px"
    fontWeight: 600
  wordmark:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-.04em"
  signature:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "clamp(72px,7.4vw,106px)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-.04em"
rounded:
  control: "5px"
  panel: "12px"
  badge: "4px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-secondary-hover:
    backgroundColor: "{colors.sage}"
  text-link:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    typography: "{typography.button}"
    padding: "0"
  input-public:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
    height: "48px"
  workspace-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "25px"
  public-navigation:
    textColor: "{colors.ink}"
  wordmark:
    textColor: "{colors.forest}"
    typography: "{typography.wordmark}"
  status-green:
    backgroundColor: "{colors.status-green-bg}"
    textColor: "{colors.status-green-text}"
    rounded: "{rounded.badge}"
    padding: "6px 9px"
  status-amber:
    backgroundColor: "{colors.status-amber-bg}"
    textColor: "{colors.status-amber-text}"
    rounded: "{rounded.badge}"
    padding: "6px 9px"
  signature-panel:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.ivory}"
    padding: "30px"
---

# Design System: NutriBalance

## Overview

**Creative North Star: "A warm editorial consultation"**

NutriBalance pairs a personal, typographic identity with clear working surfaces. The approved direction is warm, editorial and professional: forest fields, ivory space, restrained clay accents and serif headlines carry Mauricio Pelozo's identity without a portrait or invented credentials. This north-star phrase describes the implemented direction; it is not a separate claim of an approved visual concept image.

The public site uses generous space, large type and alternating open and filled sections. The professional workspace uses the same palette and controls with denser Manrope headings, tables and actions. Motion supports state changes and one restrained signature entrance; the system respects reduced-motion preferences.

This is a source extraction from `app/styles/{tokens,foundation,fonts,public,workspace}.css`, shared public components and the stylesheet import order. It records implemented CSS, not browser measurements or newly captured screenshots. The public surface's composition contract remains in `.impeccable/surfaces/public.md`.

**Key Characteristics:**

- Forest and ivory establish the identity; clay marks emphasis and keyboard focus.
- Source Serif 4 carries editorial expression; Manrope carries controls and operational information.
- Flat paper panels, fine borders and measured density support readable tasks.
- A text-based wordmark and named professional establish identity without a photograph.

## Colors

The palette combines a deep forest anchor with warm pale surfaces and subdued natural accents. Frontmatter values are normative; the names below describe their application.

### Primary

- **Forest:** primary actions, wordmark, selected navigation, large public signature and booking surfaces.
- **Forest hover:** the shared primary button's hover background and border.

### Secondary

- **Clay:** the wordmark's point, editorial initials, small directional icons and keyboard focus. It is an accent rather than the main action fill.
- **Sage:** secondary-button hover, selected workspace navigation, request summary and supporting workspace regions.

### Neutral

- **Ivory:** public page and connection-screen canvas; light text on forest surfaces.
- **Paper:** request form, receipt, workspace cards, sidebar, topbar and inputs.
- **Ink:** primary reading text and workspace headings.
- **Muted:** supporting copy, captions and secondary information.
- **Line:** one-pixel divisions between sections, rows and panels.
- **Workspace background:** the slightly cooler professional canvas.
- **White:** text on the shared primary button.
- **Field line:** the public input stroke, visibly stronger than section dividers.

Error and green/amber status colors have functional roles. Public invalid fields and error copy use error; workspace badges use paired green or amber backgrounds and text. Keep their readable labels: a color alone does not communicate appointment status.

**The Shared Palette Rule.** Public and professional surfaces share the root identity tokens; their distinction comes from typography, composition and density.

## Typography

**Display Font:** Source Serif 4, with Georgia and serif fallbacks.

**Body Font:** Manrope, with a sans-serif fallback.

The serif is conversational and editorial; the sans serif keeps forms, navigation and patient information direct. Source Serif 4 normal and italic regular, plus Manrope regular and semibold, are self-hosted WOFF2 files with `font-display: swap`. The regular files for both families are preloaded by the root layout. Only those four faces are supplied; CSS values such as 500 on smaller labels are requested weights, not additional bundled font files.

### Hierarchy

- **Display:** the frontmatter display role governs the desktop public hero. At the public tablet breakpoint it becomes 65px; at the single-column breakpoint it uses `clamp(50px,9vw,76px)`; at the narrow breakpoint it is 49px.
- **Headline:** the frontmatter headline role is used in public approach, encounters and FAQ sections. Request, booking, closing and access headings have their own source-defined clamps or sizes rather than one forced universal size.
- **Workspace title:** the frontmatter workspace-title role governs operational page headings, reducing to 27px on mobile. Workspace section headings use Manrope semibold at 24px and 18px.
- **Body:** the global body role is the baseline. Public lead copy uses 16px/1.9; other public explanatory text commonly uses 14–15px/1.9. Hero copy is capped at 465px, with longer explanatory blocks generally capped near 500px.
- **Labels and buttons:** Manrope semibold distinguishes controls and field labels. Public inputs use 16px regular; workspace controls use 15px, increasing to 16px on mobile.
- **Wordmark:** regular serif, with italic “balance,” a clay point and a small Manrope “Mauricio Pelozo” line. It reduces to 29px at the narrow public breakpoint.
- **Signature:** large, tightly spaced serif text belongs to the forest signature composition; its italic emphasis remains regular weight. This expressive role does not govern workspace headings.

**The Two Reading Modes Rule.** Use serif public headlines and sans-serif operational headings; preserve serif identity in both wordmarks.

## Layout

Root spacing uses the frontmatter's source-defined scale, from the smallest step through the largest. The implementation also contains deliberate component measurements such as form padding, section gaps and control padding; do not round them to a fabricated universal grid.

Public header, main and footer share a maximum width of 1360px with desktop side padding of 48px, then 32px and 24px at the public breakpoints. The desktop hero uses unequal columns (`1.32fr` and `.8fr`) with a 64px gap. Open sections use fine horizontal rules; filled sections use forest or pale tonal surfaces. The request page has a 1280px maximum width and a two-column introduction/form layout; access has a 1200px maximum width.

Public breakpoints are 1100px, 800px and 480px. At 800px the hero, request and main explanatory regions become single-column, in-page header links hide, and the access aside hides. At 480px hero primary action spans the available width, professional header access hides, and request field pairs stack. The footer retains professional access. The public header is a compact flow layout, not a sticky header or a mobile drawer.

The operational shell has a 246px sidebar, a 73px topbar and main padding of 34px 32px 50px. At 1150px the sidebar reduces to 222px; at 950px principal dashboard columns stack; at 800px the sidebar becomes a toggled 250px mobile surface and the topbar becomes 66px. At 480px the main side padding is 16px. Workspace cards use 25px padding, reducing to 21px on mobile.

`workspace-legacy.css` retains prototype layout and supporting feature styles. It is imported before tokens, foundation and current workspace/public styles, so the current layers override the identity. Some compatibility selectors are global, not fully selector-isolated. Treat this file as compatibility support rather than the source for new palette, heading or card decisions; do not copy its old visual treatments into new public surfaces.

## Elevation & Depth

Primary content is flat: public sections use tonal contrast and fine rules; workspace cards, calendar cards and patient banners explicitly remove shadows. Paper on ivory or the workspace canvas supplies separation. The forest signature is an opaque field, not a floating card or image frame.

Compatibility styles retain a modal shadow (`0 25px 100px #12352533`) and an overlay (`#17352966`, with 5px backdrop blur). These express dialog stacking, not the default treatment for content panels. The sidecar records these retained values as extensions rather than introducing shadow primitives into the frontmatter.

**The Flat Content Rule.** Keep routine content panels flat; reserve the retained overlay depth for dialog layers.

## Shapes

Controls use the control radius; ordinary workspace panels and public request/receipt panels use the panel radius. Both are defined in frontmatter. Workspace status badges use the smaller badge radius. Public editorial filled sections are nearly square (2px); the signature panel has a distinctive `2px 2px 50px 2px` outline. That one curved corner is a signature treatment, not a replacement for the panel radius. Circular success symbols and avatars are existing functional exceptions.

One-pixel strokes define panels, fields and rows. The public field stroke is stronger than the general line token; its hover changes to forest. Workspace fields retain their own source stroke (`#bbc8b9`).

## Components

### Buttons

Clear, restrained controls carry the action. Shared primary buttons use forest with white text, the control radius, frontmatter padding and a minimum height of 48px. Their hover uses forest-hover without lifting or adding a shadow. Secondary buttons are transparent with a line stroke; hover uses sage and a forest stroke. Text actions are underlined, with a 44px minimum height.

Header actions use a compact 44px variant. Workspace buttons also use a 44px minimum height, 13px type and 11px 16px padding. On forest public booking surfaces, the action inverts to ivory with forest text. Disabled buttons use opacity .6 and a waiting cursor.

The shared state transition is 180ms. The arrow inside buttons has a separate 220ms ease-out translation of 2px right and 2px up. Keyboard focus uses a 3px clay outline with a 4px offset; clickable workspace rows use an inset offset of -3px. The inherited compatibility stylesheet has some more-specific focus selectors, so source declarations alone do not establish every final computed focus ring.

### Inputs / Fields

Public fields are paper, bordered, softly squared controls with 11px 12px padding and 48px height; textareas have a 110px minimum height and vertical resizing. Labels remain visible above fields. Hover changes the stroke to forest; `aria-invalid="true"` changes it to error, with adjacent error text. The request form groups fields under legends and fine dividers; its summary uses sage, and the submit action spans the form.

Workspace fields share the paper fill and control radius, with 46px minimum height. Preserve the visible labels and source-defined mobile text size. Do not infer validation rules from styling.

### Cards / Containers

Workspace content panels use paper, a line border, the panel radius and flat depth. Public request forms use the same surface and radius with 36px desktop padding, reducing to 25px 22px at the narrow breakpoint. Receipts are related panels with more generous top padding. Open editorial sections remain open; do not wrap every heading and paragraph in a card.

### Chips / Status Badges

Compact status badges use Manrope at 11px semibold with 6px 9px padding and the badge radius. Green and amber variants use their frontmatter pairs. These are information labels, not pill-shaped calls to action. Calendar event fills are separate source treatments; do not replace them mechanically with badge colors.

### Navigation

The public header combines the shared wordmark, modest text links and the primary request action. Text links use 13px Manrope and underline on hover; the navigation gap is 28px on desktop. A focusable skip link precedes the header. Responsive visibility follows Layout. The footer repeats the wordmark, professional access and academic disclosure rather than making those disclosures decorative.

The workspace sidebar uses 46px minimum-height navigation rows with sage/forest selection and control-like corners. Tabs use a forest text and bottom-border active treatment, rather than a filled pill. Preserve keyboard focus and semantic links or buttons when adding destinations.

### Signature Composition

The forest signature panel carries “A tu ritmo,” fine pale divisions and Mauricio Pelozo's name. It is typography, not an implied portrait, credential seal or testimonial. On desktop, when reduced motion is not requested, the panel has an 800ms ease-out clip-path entrance. At mobile sizes it becomes a compact two-column typographic arrangement. The global reduced-motion rule removes animations, transitions and smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** reuse the root forest, ivory, paper, ink, muted, line, sage and clay tokens across both surfaces.
- **Do** keep Source Serif 4 for editorial expression and Manrope for operational headings, controls and data.
- **Do** retain visible field labels, readable status labels, keyboard focus and reduced-motion support.
- **Do** preserve the typographic identity of Mauricio Pelozo and the clear academic disclosure.
- **Do** consult the public surface brief for page composition and the current stylesheets for exact responsive overrides.

### Don't:

- **Don't** add an unauthorized portrait, fabricated credentials, testimonials or claimed outcomes to establish authority.
- **Don't** turn every open editorial region into a rounded, shadowed card.
- **Don't** copy prototype palette, heading or elevation choices over the current token system.
- **Don't** describe a requested time preference as a guaranteed appointment; its confirmation state must remain legible.
- **Don't** claim visual browser verification or approved image concepts when the evidence is source and build only.
