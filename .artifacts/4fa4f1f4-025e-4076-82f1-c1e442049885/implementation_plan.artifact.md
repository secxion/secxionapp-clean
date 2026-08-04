# Implementation Plan: Home Page & Component Branding Refinement

This plan applies the "Neon-Premium" aesthetic across the Home page, removing legacy borders, "sentimental glows", and technical jargon to create a sturdy, full-screen professional experience.

## User Review Required

> [!IMPORTANT]
> **Component Rebrand**: `NetBlog`, `HiRateSlider`, and `LastMarketStatus` are being completely overhauled to match the dark-translucent and gold standard. White backgrounds and heavy yellow/gray borders will be removed.

> [!TIP]
> **Full Screen Layout**: I am ensuring all components on the Home page breathe across the available width (`max-w-7xl`), removing any restrictive "notebook" containers.

## Proposed Changes

### 1. Home Dashboard (`Home.js`)
- Standardize section widths to `max-w-7xl`.
- Refine `glass-card` usage to ensure "sturdy" architecture without excess shadows.

### 2. Latest Updates (`NetBlog.js`)
- **Aesthetic**: Replace white card backgrounds and heavy yellow borders with `bg-white/5` and `border-white/10`.
- **Color Palette**: Replace all "pink" and "rainbow" gradients with professional `brand-gold` and `white`.
- **Typography**: Apply `font-spaceGrotesk` and tracking-widest to labels.

### 3. Market Rates Strip (`HiRateSlider.js`)
- **Visuals**: Transition from a white/gray strip to a sleek, dark-translucent overlay.
- **Branding**: Use `brand-gold` for exchange rates and remove all legacy borders.

### 4. Market Activity (`LastMarketStatus.js`)
- **Aesthetic**: Remove all white containers and heavy borders. Apply the "Neon-Premium" glassmorphism.
- **Sturdiness**: Clean up the status indicators (icons/text) to be strictly professional (Done, Processing, Cancelled).

### 5. Home Hero & Footer
- **Hero**: Ensure responsive "view auto" height logic and sturdy bottom spacing.
- **Footer**: Align the floating navigation bar with the new static, non-glowing aesthetic.

## Verification Plan

### Manual Verification
- **Visual Audit**: Confirm the page background is unified deep charcoal without white "blocks".
- **Interaction Check**: Verify all buttons and tabs use the `brand-gold` state instead of legacy colors.
- **Responsive Check**: Ensure the wide layout scales correctly from mobile to large desktop.
