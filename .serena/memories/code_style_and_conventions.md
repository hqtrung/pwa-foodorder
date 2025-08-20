# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with `"strict": true`
- **Target**: ES2017
- **JSX**: Preserve (handled by Next.js)
- **Module Resolution**: Bundler strategy
- **Path Mapping**: `@/*` maps to `./src/*`
- **Type Checking**: Comprehensive with no build errors ignored in development

## React/Next.js Patterns

### Component Structure
- Functional components with hooks
- TypeScript interfaces for props
- Default exports for page components
- Named exports for utility components
- forwardRef pattern for UI components (e.g., Button)

### Naming Conventions
- **Components**: PascalCase (e.g., `MenuPage`, `CheckoutForm`)
- **Files**: PascalCase for components, camelCase for utilities
- **Directories**: camelCase (e.g., `checkout/`, `ui/`)
- **Props Interfaces**: ComponentNameProps pattern
- **Custom Hooks**: useHookName pattern

### State Management
- Zustand stores with TypeScript interfaces
- Immer for immutable updates
- Store files named with Store suffix (e.g., `cartStore.ts`)

## Styling Conventions

### Tailwind CSS Usage
- Utility-first approach with Tailwind CSS
- Custom design system with CSS custom properties
- Responsive design patterns (`responsive-*` classes)
- Component variants using clsx for conditional classes

### Design System
- **Colors**: Primary (orange), Secondary (coral), Accent (mint), Gray scale
- **Typography**: Font families for different languages (Vietnamese, CJK)
- **Animations**: Custom keyframe animations (fadeIn, slideUp, float)
- **Touch Targets**: Minimum 44px height for mobile accessibility

## Code Organization

### Import Ordering
1. React and React-related imports
2. Third-party libraries
3. Internal components and utilities
4. Type imports (when needed)

### Component Props
- Destructured props with defaults
- Spread remaining props (...props)
- Optional props clearly marked with `?`
- Boolean props with default values

### Error Handling
- Try-catch blocks for async operations
- Graceful fallbacks for UI components
- Error boundaries for React components

## File Naming Patterns
- **Components**: PascalCase.tsx
- **Hooks**: useCamelCase.ts
- **Utilities**: camelCase.ts
- **Types**: camelCase.ts or index.ts
- **Stores**: camelCaseStore.ts

## Internationalization
- Translation keys use dot notation (e.g., `common.actions.save`)
- All user-facing strings internationalized
- Language-specific font handling
- Locale-based routing with [locale] parameter