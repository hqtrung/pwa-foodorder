# Development Patterns and Guidelines

## Component Architecture Patterns

### Page Components
- Located in `src/app/[locale]/*/page.tsx`
- Import and render corresponding component from `src/components/`
- Handle internationalization with locale parameter
- Example: `src/app/[locale]/menu/page.tsx` renders `MenuPage` component

### UI Component Patterns
- Reusable components in `src/components/ui/`
- Use forwardRef for components that need ref forwarding
- Consistent prop interfaces with optional variants
- clsx for conditional CSS classes

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
}
```

### State Management Patterns
- Zustand stores for global state
- Custom hooks for component-specific logic
- React Hook Form for form state
- Immer for immutable updates

## Service Layer Pattern
- Firebase services in `src/services/`
- API abstraction in `src/lib/`
- Error handling and fallbacks
- Caching strategies for offline functionality

## Internationalization Patterns
- Translation keys with dot notation
- Structured translation files by feature area
- Language-specific font loading
- RTL support considerations

## Mobile-First Design Patterns
- Responsive breakpoints
- Touch-friendly interface (44px minimum touch targets)
- Progressive enhancement
- Accessibility considerations

## PWA Implementation Patterns
- Service worker for caching
- Offline functionality
- App-like experience
- Push notifications (if implemented)

## Firebase Integration Patterns
- Firestore for real-time data
- Authentication (if implemented)
- Cloud functions integration
- Security rules validation

## Error Handling Patterns
- Graceful degradation
- User-friendly error messages
- Fallback UI components
- Network error handling

## Performance Optimization Patterns
- Code splitting with Next.js
- Image optimization
- Bundle analysis
- Lazy loading components