# Design.md

## Color Palette (3 Core Unified System)

### 1. Primary Action Accent — Royal Indigo
- **Main Accent**: `#6366F1`
- **Hover / Active**: `#4F46E5`
- **Light Tint Background**: `#EEF2FF`
- **Subtle Border**: `#C7D2FE`
- **Gradient**: `linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)`
- **Usage**: Primary action buttons, active navigation pills, progress stepper lines, input focus glow rings.

### 2. Secondary Status Accent — Emerald Green
- **Main Accent**: `#10B981`
- **Hover / Active**: `#059669`
- **Light Tint Background**: `#ECFDF5`
- **Subtle Border**: `#A7F3D0`
- **Gradient**: `linear-gradient(135deg, #10B981 0%, #059669 100%)`
- **Usage**: Secondary status buttons, verified attendance badges, live GPS geofence indicators.

### 3. Structural Neutral Base — Deep Slate & Off-White
- **Heading & Primary Text**: `#0F172A` (Deep Slate)
- **Body & Secondary Text**: `#475569` (Slate Gray)
- **Muted Label Text**: `#64748B`
- **Page Background**: `#F8FAFC` (Soft Off-White)
- **Card Surface Background**: `#FFFFFF` (Pure Crisp White)
- **Border**: `#E2E8F0` (Light Slate)

---

## Typography

### Font Families
- **Primary Headings & Badges**: `'Outfit', sans-serif`
- **Subtitles & Body Copy**: `'Plus Jakarta Sans', sans-serif`
- **Code & Console Outputs**: `'Consolas', 'Courier New', monospace`

### Scale & Weights
- **Page Title (`h1`)**: `3.2rem` (51px), Weight: 800, Line-Height: 1.15, Letter-Spacing: `-0.03em`.
- **Section Title (`h2`)**: `2.1rem` (33px), Weight: 800, Line-Height: 1.2, Letter-Spacing: `-0.02em`.
- **Card Title (`h3`)**: `1.3rem` (20px), Weight: 800, Line-Height: 1.3.
- **Subtitle / Label (`h4`/`p`)**: `0.94rem` - `1.05rem` (15px-17px), Weight: 500-600, Line-Height: 1.6.

---

## Spacing & Layout Principles
- **Grid Layout**: 2-Card Featured Service Grid (`maxWidth: 1150px`), 3-Card Hall Grid (`repeat(3, 1fr)`), 4-Card Feature/Metric Grid (`repeat(4, 1fr)`).
- **Hero Section Padding**: `36px 24px 40px` (Balanced vertical height, eliminating empty white gaps).
- **Corner Radius Scale**:
  - Buttons & Inputs: `12px` - `14px`
  - Standard Cards: `20px` - `24px`
  - Hero Containers: `28px`
  - Pill Badges: `20px` / `9999px`

---

## Component Style Guidelines

### 1. Primary Buttons (`.btn-primary`)
- Background: `linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)`
- Text Color: `#FFFFFF`
- Box Shadow: `0 4px 14px rgba(99, 102, 241, 0.25)`
- Hover Effect: `translateY(-2px)` with shadow `0 8px 20px rgba(99, 102, 241, 0.35)`

### 2. Cards (`.card` / Glassmorphic Containers)
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Border Radius: `20px` / `24px`
- Box Shadow: `0 4px 16px rgba(15, 23, 42, 0.04)`

### 3. Form Inputs (`.form-control`, `.form-select`)
- Background: `#F8FAFC`
- Border: `1px solid #E2E8F0`
- Color: `#0F172A`
- Focus State: Background `#FFFFFF`, Border `#6366F1`, Box Shadow `0 0 0 4px rgba(99, 102, 241, 0.15)`

---

## Accessibility & Contrast Notes
- **Contrast Enforcement**: All text headings over dark or gradient backgrounds MUST specify `className="text-white"` and `style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF' }}` to prevent dark color inheritance.
- **Interactive Tap Targets**: Minimum button height of `44px` on mobile screens for easy touch interaction.
