# CLAUDE.md

This file provides guidance to Claude Code when working with this food ordering PWA project.

## Project Overview

This is a Next.js-based Progressive Web Application (PWA) for food ordering with the following key features:

- Multi-language support (English, French, Italian, Japanese, Vietnamese, Chinese)
- Checkout flow with delivery and table service options
- Order tracking functionality
- Mobile-responsive design
- PWA capabilities with service workers

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Internationalization**: Next.js i18n
- **PWA**: Service Worker implementation

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   └── [locale]/          # Internationalized routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── checkout/         # Checkout-related components
│   ├── layout/           # Layout components
│   └── modals/           # Modal components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── styles/               # Additional styles

messages/                 # Translation files
├── en.json              # English translations
├── fr.json              # French translations
├── it.json              # Italian translations
├── ja.json              # Japanese translations
├── vi.json              # Vietnamese translations
└── zh.json              # Chinese translations
```

## Key Components

- `CheckoutPage.tsx`: Main checkout flow component
- `MenuPage.tsx`: Product menu display
- `OrderTrackingPage.tsx`: Order status tracking
- `CartPage.tsx`: Shopping cart management

## Development Notes

- The project uses a unified checkout page approach
- Mobile-first responsive design
- Translation files are maintained for all supported languages
- Service workers handle PWA functionality

## Common Tasks

### Adding New Features
1. Create components in appropriate directory
2. Update translations in all language files
3. Test mobile responsiveness
4. Ensure PWA compatibility

### Translation Updates
- All user-facing text should be internationalized
- Update all language files simultaneously
- Use proper translation keys following existing patterns

### Testing
- Test across different device sizes
- Verify PWA functionality
- Test all language variants