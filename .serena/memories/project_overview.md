# Project Overview

## Purpose
This is a Progressive Web Application (PWA) for food ordering, specifically for "Bánh Mì PateDeli" - a Vietnamese restaurant. The app supports multiple ordering types (table service and delivery) with comprehensive order tracking functionality.

## Key Features
- Multi-language support (English, French, Italian, Japanese, Vietnamese, Chinese)
- PWA capabilities with service workers
- Checkout flow with delivery and table service options
- Real-time order tracking functionality
- Mobile-responsive design
- Staff dashboard for order management
- Firebase integration for data storage
- Sound notifications for staff

## Tech Stack
- **Framework**: Next.js 15.4.6 with TypeScript
- **UI Framework**: React 19.1.0 with React DOM
- **Styling**: Tailwind CSS 4 with custom design system
- **PWA**: @ducanh2912/next-pwa for service worker implementation
- **Internationalization**: next-intl for multi-language support
- **State Management**: Zustand for client-side state
- **Forms**: react-hook-form with Zod validation
- **Backend**: Firebase (Firestore for data, hosting)
- **Additional Libraries**: 
  - @headlessui/react for accessible UI components
  - react-qr-code for QR code generation
  - Immer for immutable state updates
  - clsx for conditional CSS classes

## Architecture
- Next.js App Router with file-based routing
- Internationalized routes with [locale] parameter
- Component-based architecture with separation of concerns
- Custom hooks for business logic
- Service layer for API interactions
- Zustand stores for state management
- Firebase services for backend operations