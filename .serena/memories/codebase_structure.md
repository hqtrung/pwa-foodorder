# Codebase Structure

## Root Directory
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration with PWA, i18n, and bundle analyzer
- `tsconfig.json` - TypeScript configuration with strict mode
- `tailwind.config.ts` - Tailwind configuration with custom design system
- `eslint.config.mjs` - ESLint configuration extending Next.js standards
- `firebase.json` - Firebase deployment configuration
- `CLAUDE.md` - Project-specific instructions for Claude

## Source Structure (`src/`)

### App Router (`src/app/`)
- `src/app/[locale]/` - Internationalized routes
  - `page.tsx` - Landing page
  - `menu/page.tsx` - Menu browsing
  - `cart/page.tsx` - Shopping cart
  - `checkout/page.tsx` - Checkout flow
  - `order/[orderId]/page.tsx` - Order tracking
  - `staff/page.tsx` - Staff dashboard
- `src/app/globals.css` - Global styles with CSS custom properties
- `src/app/layout.tsx` - Root layout component

### Components (`src/components/`)
- `src/components/ui/` - Reusable UI components (Button, Input, Modal, etc.)
- `src/components/layout/` - Layout components (Header, Footer, PageLayout)
- `src/components/checkout/` - Checkout-specific components
- `src/components/menu/` - Menu display components
- `src/components/cart/` - Cart-related components
- `src/components/order/` - Order tracking components
- `src/components/staff/` - Staff dashboard components
- `src/components/modals/` - Modal components
- Page-level components: `MenuPage.tsx`, `CheckoutPage.tsx`, etc.

### Business Logic
- `src/hooks/` - Custom React hooks for business logic
- `src/stores/` - Zustand state management stores
- `src/services/` - Firebase and API service layers
- `src/lib/` - Utility functions and data transformers

### Configuration & Data
- `src/config/` - Firebase config and app settings
- `src/data/` - Mock data and API interfaces
- `src/types/` - TypeScript type definitions
- `src/i18n/` - Internationalization configuration

## Translation Files (`messages/`)
- `en.json`, `fr.json`, `it.json`, `ja.json`, `vi.json`, `zh.json`
- Structured with nested objects for different app sections

## Public Assets (`public/`)
- PWA manifest and service worker files
- Static images and icons