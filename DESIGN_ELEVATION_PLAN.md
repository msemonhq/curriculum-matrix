# Design Elevation Plan

## Current Design System Analysis
The current application features a dark-mode focused aesthetic with a cyan accent color (`#00c4db`), heavily relying on `framer-motion` for animations and Tailwind CSS for styling.

### Key Strengths:
1.  **Consistent Dark Theme:** A robust set of surface colors (`surface.base`, `surface.elevated`, `surface.overlay`, `surface.subtle`) provides a solid foundation for depth.
2.  **Typography:** Utilizing 'Geist' and 'Geist Mono' alongside carefully tuned scales (display, heading, title, body, caption, micro).
3.  **Modern UI Elements:** Glassmorphism (`bg-surface-elevated/70 backdrop-blur-md`), rounded corners (`rounded-2xl`, `rounded-3xl`), and glow effects (`shadow-glow-accent`, `shadow-glow-sm`).
4.  **Animations:** Subtle and smooth component transitions, staggered lists, and spring-based animations in SVG elements and modal sheets.

### Areas for Elevation:

#### 1. Color Palette & Hierarchy
- **Issue:** While `#00c4db` is strong, the UI might feel slightly monotone in complex views without secondary complementary colors. Status colors (success, warning, danger) exist but could be integrated more fluidly into non-status contexts.
- **Action:** Introduce a deliberate secondary accent color (e.g., a deep violet or subtle indigo) to distinguish interactive states from primary actions. Refine the `line` (border) colors to reduce harshness.

#### 2. Micro-Interactions & Feedback
- **Issue:** The active scale down (`active:scale-[0.98]`) is present on buttons and interactive cards, but haptic-like visual feedback or ripple effects are missing.
- **Action:**
  - Implement a subtle unified focus ring system (`focus-visible:ring-accent/70` is a good start, but ensure it's globally consistent).
  - Enhance tap targets with subtle background highlight transitions (`hover:bg-surface-overlay`).
  - Introduce skeleton loading states for asynchronous data (if any).

#### 3. Depth & Shadows
- **Issue:** The glow shadows (`shadow-glow-accent`, `shadow-glow-sm`) are nice but might lack directional realism.
- **Action:** Refine drop shadows to have multi-layered properties for more realistic elevation (e.g., combining a tight dark shadow with a diffused lighter shadow). Enhance the `glass` utility class with a subtle border gradient for premium feel.

#### 4. Typography Hierarchy
- **Issue:** Text colors (`ink.primary`, `ink.secondary`, `ink.tertiary`) are well defined, but line heights in denser data components could be optimized for better readability.
- **Action:** Implement more explicit kerning/tracking adjustments for `display` and `heading` elements to create a more polished, editorial feel. Ensure tabular data strictly adheres to `tabular-nums` (already implemented via the `.tabular` class).

#### 5. Motion & Transitions
- **Issue:** Current framer-motion transitions are good, but there's room for a more unified motion system.
- **Action:**
  - Standardize animation durations and easing curves (e.g., standard, emphasized, decelerated) across the app to create a cohesive rhythm.
  - Implement page transition variants (e.g., shared element transitions for navigation).

## Implementation Roadmap

### Phase 1: Foundation Tweaks (1-2 Days)
- Update `tailwind.config.js` to include a refined shadow system and secondary accent colors.
- Adjust base typography spacing in `index.css`.
- Standardize focus and hover states across all interactive components (Button, Card, IconButton, Inputs).

### Phase 2: Component Polish (2-3 Days)
- Redesign the `Card` component's `glass` variant for better edge definition.
- Enhance the `ProgressBar` and `AnimatedNumber` with smoother interpolation and potential glow states.
- Refine input fields (Select, TextInput, TextArea) with better active/focus styling.

### Phase 3: Motion & Interaction (2-3 Days)
- Create a global `animations.ts` to store standard framer-motion variants.
- Implement shared element transitions for moving from the Dashboard to the Curriculum.
- Add micro-animations to icons (e.g., CheckCircle completing).

## Summary
The current design is strong, modern, and clean. This elevation plan focuses on refinement—turning a "good" UI into a "premium" app experience through meticulous attention to micro-interactions, depth, and consistent motion.
