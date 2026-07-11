---
name: Warm Urban Transit
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f0eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2dc'
  on-surface: '#1c1c18'
  on-surface-variant: '#534434'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0ea'
  outline: '#867461'
  outline-variant: '#d8c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#ffb95f'
  secondary: '#895033'
  on-secondary: '#ffffff'
  secondary-container: '#feb28f'
  on-secondary-container: '#794227'
  tertiary: '#665f3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#bab189'
  on-tertiary-container: '#4a4424'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb694'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#6d391e'
  tertiary-fixed: '#ede3b8'
  tertiary-fixed-dim: '#d1c79d'
  on-tertiary-fixed: '#201c02'
  on-tertiary-fixed-variant: '#4d4727'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2dc'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 48px
---

## Brand & Style

The brand personality is energetic, dependable, and deeply human. Moving away from the harsh, high-contrast aesthetics of traditional transport apps, this design system focuses on the warmth of the journey and the community behind it. It targets a broad demographic of daily commuters who value speed but crave a friendlier, more accessible service experience.

The design style is **Modern Minimalist with Tactile Warmth**. It utilizes generous whitespace, soft depth, and a vibrant accent color to create an interface that feels both professional and inviting. The emotional response should be one of "reliable sunshine"—an optimistic, stress-free approach to urban mobility.

## Colors

The palette transitions from cold blacks to organic, sun-drenched earth tones. 

- **Primary (Sunset Amber):** `#f59e0b`. Used for primary actions, active states, and brand identifiers. It carries the "Traffic Yellow" legacy but with a warmer, more modern glow.
- **Secondary (Earth Brown):** `#451a03`. Used for primary headings and body text to provide high legibility without the starkness of pure black.
- **Tertiary (Soft Sand):** `#fef3c7`. Used for subtle highlights, secondary buttons, and badge backgrounds.
- **Neutral (Warm White):** `#fffcf5`. The core background color, providing a soft, cream-like canvas that reduces eye strain compared to pure white.
- **Functional Colors:** Success states use a warm forest green, while error states utilize a muted terracotta red to maintain the organic feel.

## Typography

The typography strategy pairs **Plus Jakarta Sans** for headlines with **Be Vietnam Pro** for body text. Plus Jakarta Sans provides a soft, rounded geometric structure that feels optimistic and bold. Be Vietnam Pro is chosen for its contemporary feel and exceptional readability in functional contexts like transit schedules and ride details.

Headlines should use tight letter spacing and heavy weights to establish a clear hierarchy. Body text should maintain generous line heights to ensure the interface feels open and breathable. Mobile headlines are scaled down slightly to prevent awkward line breaks on smaller devices.

## Layout & Spacing

The design system utilizes a **Fluid Grid** model with an 8px baseline rhythm. 

- **Desktop:** 12-column grid with 24px gutters and 48px side margins.
- **Tablet:** 8-column grid with 16px gutters and 32px side margins.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.

Content blocks should favor vertical stacking on mobile, utilizing "Soft Sand" (`#fef3c7`) dividers or subtle container elevations to separate logical sections. Spacing between major sections (e.g., "Where to?" and "Recent Trips") should use the `lg` (40px) token to maintain an uncrowded, premium feel.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layers**. Instead of traditional grey shadows, this system uses low-opacity shadows tinted with the Earth Brown secondary color (`rgba(69, 26, 3, 0.08)`) to maintain the warm aesthetic.

- **Level 0 (Base):** Warm White background.
- **Level 1 (Cards):** Slight elevation with a 4px blur shadow. Used for list items and secondary information.
- **Level 2 (Interactive):** Distinct elevation with an 8px blur shadow. Used for primary cards and floating action buttons.
- **Level 3 (Modals/Overlays):** Deep elevation with a 24px blur shadow and a subtle 1px border in Earth Brown at 5% opacity.

Background blurs (Glassmorphism) are used sparingly for navigation bars to let the underlying warm colors bleed through.

## Shapes

The shape language is defined by a friendly, generous corner radius. 

- **Standard Buttons & Inputs:** Use the `rounded-lg` (1rem) setting to feel approachable but structured.
- **Container Cards:** Use the `rounded-xl` (1.5rem) setting to create a soft, protective feel for grouped content.
- **Utility Elements:** Small badges or tags use a fully pill-shaped radius to distinguish them from interactive buttons.

This high degree of roundedness removes the "industrial" feel of traditional transit apps, leaning into a more lifestyle-oriented aesthetic.

## Components

### Buttons
- **Primary:** Sunset Amber background with Earth Brown text. High contrast, bold weight.
- **Secondary:** Soft Sand background with Earth Brown text. No border.
- **Ghost:** Transparent background with Earth Brown text and a 1.5px border at 10% opacity.

### Cards
Cards are the primary container. They feature a white background (slightly brighter than the Warm White page background), `rounded-xl` corners, and Level 1 or 2 shadows. Content inside cards should have `md` (24px) internal padding.

### Input Fields
Inputs use a very subtle Soft Sand fill with an Earth Brown border that increases in opacity when focused. Labels are positioned above the field in `label-md` style.

### Chips & Badges
Used for vehicle types (Boda, XL, Delivery). These are pill-shaped with Soft Sand backgrounds and Earth Brown text. Active states toggle to Sunset Amber.

### Floating Action Button (FAB)
The primary "Book Now" or "Current Ride" button should be a large Sunset Amber circle with a Level 3 shadow, positioned in the bottom right of the mobile view.