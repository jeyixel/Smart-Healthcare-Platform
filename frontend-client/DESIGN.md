# Design System Document: The Clinical Precision Framework

## 1. Overview & Creative North Star: "The Digital Clinician"
The design system moves away from the cold, sterile templates typical of legacy healthcare software. Our Creative North Star is **"The Digital Clinician"**—an experience that feels as authoritative as a medical journal but as intuitive and calming as a premium wellness space. 

We break the "standard dashboard" look by rejecting rigid, boxed-in grids. Instead, we use **intentional asymmetry** and **tonal layering** to guide the eye. By utilizing high-contrast typography scales (the precision of *Manrope* against the utility of *Inter*) and overlapping surfaces, we create a sense of organized sophistication. This is not just a tool; it is a high-end editorial experience for medical professionals.

---

## 2. Colors: Tonal Depth over Borders
Our palette centers on `#1976D2`, but we elevate it through a sophisticated range of supporting tones.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Sectioning must be achieved through:
*   **Background Shifts:** e.g., A `surface-container-low` widget sitting on a `surface` background.
*   **Tonal Transitions:** Using subtle variations in the surface palette to define boundaries.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
*   **Level 0 (Base):** `surface` (#f9f9ff) for the main application background.
*   **Level 1 (Sections):** `surface-container-low` (#f2f3fc) for large sidebar areas or background groupings.
*   **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff) for high-priority data cards to make them "pop" against the background.

### The "Glass & Gradient" Rule
To avoid a flat, "out-of-the-box" feel, use **Glassmorphism** for floating elements (like dropdowns or modals). Utilize semi-transparent versions of `surface-container` colors with a `20px` backdrop-blur. 
*   **Signature Textures:** For primary CTAs and Hero Stats, apply a subtle linear gradient from `primary` (#005dac) to `primary_container` (#1976d2) at a 135-degree angle. This adds a "jewel-toned" depth that flat hex codes lack.

---

## 3. Typography: The Editorial Authority
We use a dual-font strategy to balance clinical precision with modern readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric clarity and authoritative weight. Use `display-lg` to `headline-sm` for patient names, primary metrics, and page titles. This conveys a "premium editorial" feel.
*   **Body & Labels (Inter):** The workhorse of the system. Used for all clinical data, form fields, and long-form notes. Its high x-height ensures readability in high-stress environments.

**Hierarchy Tip:** Always pair a `headline-md` (Manrope) with a `label-md` (Inter) in `on-surface-variant` color to create a clear, sophisticated data relationship.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often messy. This system uses **Tonal Layering** to convey hierarchy.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` section. The slight shift in brightness creates a soft, natural lift.
*   **Ambient Shadows:** When an element must "float" (e.g., a critical alert or floating action button), use a shadow with a `32px` blur and `4%` opacity, tinted with the `surface_tint` (#005faf) color. This mimics natural light passing through medical-grade glass.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

### Cards & Stats (The Precision Tile)
*   **Rule:** Forbid divider lines. Separate the "Stat Value" from the "Trend Label" using a `1.5rem` vertical spacing gap.
*   **Styling:** Use `surface-container-lowest` with an `xl` (0.75rem) corner radius. For top-tier metrics (e.g., Total Patients), use a subtle `primary_fixed` background.

### Navigation (The Departmental Sidebar)
*   **Visuals:** Use a "Surface-on-Surface" approach. The active state should not be a box, but a high-contrast `on-secondary-container` text color with a small `4px` vertical "pill" indicator in `primary`.

### Buttons
*   **Primary:** Gradient-filled (`primary` to `primary_container`) with `lg` (0.5rem) roundedness.
*   **Tertiary:** Text-only, using `primary` color. Reserved for secondary actions like "Cancel" or "View Archives."

### Input Fields
*   **Styling:** Instead of a full box, use a `surface-container-highest` background with a `sm` (0.125rem) bottom-only accent in `outline` when focused. This creates a "Form-as-a-Document" aesthetic.

### Additional Specialty Components
*   **Patient Status Chips:** Use `secondary_container` for neutral, `error_container` for urgent, and `tertiary_fixed` for specialized care. High-chroma, low-opacity backgrounds keep the UI professional.
*   **The "Vital" Sparkline:** Integrated directly into stat cards using the `primary` color—no axes or labels, just the trend line to maintain the clean, editorial look.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use `surface-container-highest` for "empty states" to maintain a sense of structure without using borders.
*   **Do** lean into `display-lg` for single, impactful numbers (e.g., "98% Occupancy").
*   **Do** ensure all interactive elements have at least a `12px` padding buffer to reflect the "breathing room" of a high-end experience.

### Don’t:
*   **Don’t** use pure black (#000000) for text. Always use `on-surface` (#181c21) to maintain a soft, premium contrast.
*   **Don’t** use standard 1px dividers to separate list items. Use an `8px` vertical gap and a background color shift on hover.
*   **Don’t** use sharp corners. Every element must adhere to the **Roundedness Scale** (default `0.25rem` to `0.75rem`) to ensure the system feels approachable and "human."