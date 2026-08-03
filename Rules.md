# Rules.md

## Approved & Avoided Libraries

### Approved Libraries
- **React 18 & Vite 8**: Core SPA web application framework.
- **react-router-dom v6**: SPA client routing.
- **lucide-react**: Lightweight SVG icons.
- **sweetalert2**: User-friendly alerts and feedback modals.
- **html2canvas & jspdf**: Client-side PDF receipt generation.
- **Express.js & Knex.js**: Lightweight REST API & SQL query builder.

### Avoided Libraries (DO NOT USE)
- **TailwindCSS**: Avoid Tailwind utility bloat unless explicitly requested. Use Vanilla CSS with design system tokens in `index.css`.
- **Moment.js**: Avoid due to bundle size. Use native JavaScript `Date` API.
- **jQuery / Bootstrap JS**: Avoid legacy DOM manipulating libraries.

---

## Coding Conventions

### File Naming & Structure
- Component files MUST use PascalCase (e.g. `BookingPortal.jsx`, `StudentAttendance.jsx`).
- Styles MUST be maintained in `index.css` using centralized CSS variables.
- All file paths MUST be written with forward slashes `/`.

### Code Hygiene & Documentation
- Preserve existing code comments and docstrings.
- Ensure every interactive element (buttons, inputs) has descriptive `id` or `aria-label` tags.
- Always include developer attribution: `Developed with ❤️ by Tushal Jadhav` and portfolio link `https://tushaljadhav-portfolio.netlify.app/`.

---

## Error Handling Rules
- Backend API endpoints MUST return structured JSON errors: `{ success: false, error: "Human readable message" }`.
- Frontend API calls MUST handle network errors gracefully using `try...catch` blocks and display clean SweetAlert toast messages.
- Form inputs MUST validate mandatory fields before submitting payload.

---

## Security & Geofence Rules
- **Geofence Enforcement**: Student attendance MUST verify device coordinates against Kirti College coordinates (`19.0222, 72.8304`) with maximum 100m threshold.
- **Input Sanitization**: All incoming payload parameters MUST be sanitized against SQL injection and XSS.
- **Admin Passwords**: Admin credentials MUST be hashed using `bcryptjs` with minimum salt rounds of 10.

---

## What the AI Should NEVER Do Without Asking
1. **NEVER modify database schema destructively** (e.g. dropping tables or removing production columns).
2. **NEVER change core branding text** (`© 2026 Kirti M. Doongursee College` and `Developed with ❤️ by Tushal Jadhav`).
3. **NEVER re-introduce manual approval gates** for venue bookings (instant booking rule MUST be preserved).

---

## Testing Expectations
- **Build Verification**: Every major change MUST be validated by running `npm run build` in `frontend/`.
- **Zero Console Errors**: SPA navigation MUST produce 0 unhandled promise rejections or react console errors.
