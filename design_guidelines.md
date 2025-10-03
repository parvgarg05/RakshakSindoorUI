# Rakshak Sindoor - Design Guidelines

## Design Approach

**Hybrid Tactical-Civilian System**: This dual-portal security application requires distinct visual languages for soldiers (tactical/authoritative) and civilians (warm/accessible) while maintaining a unified design foundation. Drawing from military command systems and humanitarian crisis response interfaces, with Material Design principles for component consistency.

**Core Design Principle**: Trust through clarity - every element must communicate security, reliability, and immediate actionability in high-stress situations.

---

## Dual Portal Visual Identity

### Soldier Portal Theme
- **Primary Colors**: 
  - Background: 220 15% 12% (deep tactical slate)
  - Surface: 220 12% 18% (command panel gray)
  - Primary: 210 100% 45% (authority blue)
  - Critical: 0 85% 50% (alert red)
  - Success: 142 76% 36% (secure green)
  
- **Accent**: 45 93% 47% (warning amber) - use sparingly for urgent actions only
- **Typography**: Sharp, sans-serif hierarchy - Rajdhani for headers (military stencil feel), Inter for body
- **Visual Language**: Sharp edges, high contrast, grid-based layouts, military-grade precision

### Civilian Portal Theme  
- **Primary Colors**:
  - Background: 210 20% 98% (soft white)
  - Surface: 210 15% 95% (neutral card)
  - Primary: 210 85% 55% (approachable blue)
  - Alert: 10 90% 55% (warm alert orange)
  - Safe: 142 71% 45% (reassuring green)

- **Accent**: 200 80% 50% (calm cyan) - for community/chat features
- **Typography**: Friendly, readable - Noto Sans for universal language support
- **Visual Language**: Rounded corners (8px), softer shadows, welcoming spacing

---

## Typography System

### Soldier Portal
- **Headers**: Rajdhani Bold - 32px/28px/24px (h1/h2/h3)
- **Body**: Inter Regular - 16px (body), 14px (secondary)
- **Tactical Labels**: Inter Medium - 12px uppercase tracking-wide
- **Code Language**: JetBrains Mono - 14px (encrypted messages)

### Civilian Portal  
- **Headers**: Noto Sans SemiBold - 32px/24px/20px
- **Body**: Noto Sans Regular - 16px (body), 14px (secondary)
- **Multi-language**: Ensure consistent line-height 1.6 for Devanagari/Arabic scripts
- **Emphasis**: Noto Sans Medium for important safety information

---

## Layout & Spacing System

**Tailwind Spacing Scale**: Consistent use of 2, 4, 8, 12, 16, 24 units
- Map panels: p-4 (mobile), p-6 (desktop)
- Dashboard cards: p-6 (mobile), p-8 (desktop)  
- Section spacing: py-12 (mobile), py-16 (desktop)
- Button padding: px-6 py-3 (standard), px-8 py-4 (primary CTA)

**Grid System**:
- Soldier dashboard: Asymmetric 3-column (2fr 5fr 3fr) - left controls, center map, right activity
- Civilian dashboard: Centered max-w-7xl with 2-column cards on desktop
- Mobile: Single column stack with fixed bottom navigation bar

---

## Core Component Library

### Buttons
**Soldier Variant**:
- Primary: bg-[hsl(210,100%,45%)] sharp corners, uppercase text, bold weight
- Danger: bg-[hsl(0,85%,50%)] with confirmation modal requirement
- Outline: border-2 border-current backdrop-blur-sm (on map overlays)

**Civilian Variant**:
- Primary: bg-[hsl(210,85%,55%)] rounded-lg, sentence case
- Secondary: bg-[hsl(210,15%,95%)] text-[hsl(210,85%,55%)]
- Outline: border-2 border-current backdrop-blur-md (on hero/images)

### Cards
**Soldier Command Cards**: 
- Dark bg-[hsl(220,12%,18%)] border-l-4 border-[color-by-priority]
- Sharp shadow-lg, minimal padding
- Status indicators: colored pip dots (8px) top-right

**Civilian Community Cards**:
- Light bg-white rounded-xl shadow-md
- Soft hover: shadow-xl transform scale-[1.02] transition
- Icon leading (24px) with title/description stack

### Map Interface Elements
**Toolbar Controls** (both portals):
- Floating fab buttons: 56px circle, absolute positioned
- Backdrop filter blur for legibility over map
- Icon-only on mobile, icon+label on desktop (≥md)
- Soldier: sharp circles, Civilian: rounded-full

**Markers & Zones**:
- SOS Hotspot: Pulsing red marker with radiating rings animation
- Evacuation Zone: Translucent polygon fill with dashed border
- Medical Hub: Green cross icon (32px) with label callout
- Route Lines: Solid 4px stroke with directional arrows

### Notification System
**Dual Icon Badges**:
- Soldier Global Alert: Bell icon top-right, red badge counter
- Civilian Chat: Message bubble icon, blue badge counter
- Priority visual: Threats (red), Evacuation (orange), SOS (red pulse), General (blue)

**Notification Modal**:
- Soldier: Full-height side drawer (right), dark theme, sortable list
- Civilian: Centered modal max-w-2xl, light theme, acknowledge-only
- Each item: Icon (24px), severity color stripe, timestamp, action buttons

### Encryption Visualizer
**Message Display**:
- Encrypted state: Monospace font, blur filter, lock icon prefix
- Decrypt button: "Translate to [Language]" with language flag icon
- Decrypted state: Normal font, unlock icon, language badge
- Side-by-side view (desktop): Encrypted left | Decrypted right

### Language Switcher
- Dropdown with flag icons: 🇬🇧 EN | 🇮🇳 HI | العربية UR | ကက KSH
- Persistent per user, instant UI update
- Mobile: Bottom sheet selector, Desktop: Compact dropdown

---

## Responsive Breakpoints

**Mobile-First Strategy**:
- `base`: Single column, bottom nav, 16px horizontal padding
- `md` (768px): 2-column grids, side navigation revealed
- `lg` (1024px): 3-column soldier layout, expanded map toolbars
- `xl` (1280px): Full dashboard complexity, charts visible

**Touch Targets**:
- Minimum 44px tap areas for all interactive elements
- Map controls: 56px FABs with 16px spacing between
- List items: 64px height for cards with actions

---

## Landing Page Structure

**Hero Section** (60vh on mobile, 80vh on desktop):
- Split dual-portal design: Soldier left (dark gradient) | Civilian right (light)
- Centered vertical divider with app logo
- Each side: Portal title, icon (128px), "Enter" button
- Background: Tactical hexagon pattern (soldier) | Soft topographic lines (civilian)

**Important Channel Feed** (below hero):
- Fixed header "आपातकालीन सूचना / Emergency Updates" 
- Scrollable encrypted messages with decrypt controls
- Visual language indicator (code symbols vs readable text)

**Statistics Dashboard**:
- 4 metric cards in 2x2 grid (mobile: 1 column)
- Live activity chart (line graph, 24h window, Recharts)
- Color-coded severity: Critical red, Warning amber, Safe green

**Location & Language Bar** (sticky top):
- Compact: Flag dropdown | Current location pill | Offline indicator
- Dark theme for consistency across portals

---

## Animation & Interactions

**Micro-interactions** (subtle, purposeful):
- Card hover: shadow-md → shadow-xl (200ms ease)
- Button press: scale(0.98) active state
- Notification badge: Pulse animation for unread
- Map marker placement: Drop-in bounce effect

**Page Transitions**:
- Portal switch: 300ms fade with slight slide
- Modal entry: Scale from 0.95 + fade
- Drawer: Slide from edge (right for notifications)

**Critical: NO distracting animations on**:
- Emergency alerts (instant display)
- SOS markers (immediate visibility)
- Evacuation routes (static, clear paths)

---

## Offline/Online States

**Offline Indicator**:
- Persistent banner top: "ऑफ़लाइन मोड / Offline Mode" with cloud-off icon
- Color: 45 93% 47% (warning amber) background
- Sync status: "Last synced: [timestamp]"

**Data Loading States**:
- Map: Gray placeholder with loading spinner (until tiles load)
- Messages: Skeleton screens (3 pulse-shimmer lines)
- Charts: Empty state with "Connecting..." message

---

## Accessibility & Security Visual Cues

**Encryption Status**:
- Locked message: 🔒 prefix, blue-gray background
- Decrypting: Loading spinner + "Decrypting..." text
- Decrypted: 🔓 prefix, normal background, fade-in effect

**Role Indicators**:
- Soldier badge: Orange shield icon always visible in header
- Civilian badge: Blue person icon in header
- Admin actions: Double confirmation modals with "Type DELETE to confirm" input

**Language Support**:
- RTL support for Urdu (flex-row-reverse, text-right)
- Devanagari line-height 1.75 (Hindi)
- Fallback fonts: system-ui for unsupported glyphs

---

## Images & Media

**Hero Background**:
- Soldier portal: Tactical command center imagery (desaturated, overlaid with dark gradient)
- Civilian portal: Kashmir landscape (mountains, valleys, warm filter, light overlay)
- Both: CSS backdrop-filter blur on content for legibility

**Map Imagery**:
- Google Maps satellite view as base layer
- Offline fallback: Leaflet with cached OSM tiles (low-res acceptable)
- Custom markers: SVG icons (32px) with drop shadows for depth

**Community Posts**:
- User avatars: Colored initials (24 hues based on user ID)
- Optional post images: 16:9 cards with lazy loading
- Evacuation route visuals: Illustrated path overlays (green arrows)

---

## Priority Hierarchy

**Visual Weight by Importance**:
1. **Critical Alerts**: Largest text (24px), red background, top position, pulse animation
2. **Evacuation Info**: 20px bold, orange border, prominent placement
3. **SOS Hotspots**: Map layer z-index highest, 40px pulsing markers
4. **Community Chats**: Standard cards, blue accents, normal hierarchy
5. **General Info**: 14px regular, gray text, below-fold acceptable

**Color Priority**:
- Red (#E53E3E): Life-threatening (SOS, critical alerts)
- Orange (#DD6B20): Evacuation urgency
- Blue (#3182CE): Information, guidance
- Green (#38A169): Safe zones, medical hubs
- Gray: Non-critical, background elements

This design system ensures a trustworthy, accessible, and actionable interface for high-stakes emergency communication while maintaining distinct visual identities for soldiers and civilians.