# AGENTS.md

## Build, Lint, and Test Commands

```bash
# Development
npm run dev          # Start development server with hot reload

# Build
npm run build        # Build for production (TypeScript + Vite)

# Lint
npm run lint         # Run ESLint on all files
eslint src/          # Run ESLint on src directory
eslint src/App.tsx   # Run ESLint on specific file

# Preview
npm run preview      # Preview production build

# Install dependencies
npm install          # Install all dependencies
```

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` prefix for all internal imports
- Import from `@/components/ui` for shadcn/ui components
- Import from `@/lib/utils` for utility functions
- Group imports by category: React libraries → Third-party → Internal
- Prefer default imports for components, named imports for utilities and types

### TypeScript Configuration
- Enable strict mode in tsconfig.app.json
- Enable noUnusedLocals and noUnusedParameters
- Use `noUncheckedSideEffectImports` for safety
- Use `verbatimModuleSyntax` to prevent type errors from import reordering
- Use `allowImportingTsExtensions` for type-safe imports

### Naming Conventions

**Components**
- Use PascalCase for all components (e.g., `GameCard`, `useChessGame`)
- Export components using named exports
- Prefix hooks with `use` (e.g., `useChessGame`, `useStockfish`)

**Types and Interfaces**
- Use PascalCase for type names
- Use `interface` for component props, `type` for unions and complex types
- Export types from dedicated index files in the types directory

**Variables and Functions**
- Use camelCase for variables and functions
- Use descriptive names that indicate purpose
- Avoid abbreviations unless widely understood

**Constants**
- Use UPPERCASE_SNAKE_CASE for constant values
- Group related constants together at the top of components

### React Best Practices

**Component Structure**
- Keep components focused and single-purpose
- Use function components with hooks
- Export components using named exports
- Use TypeScript interfaces for props

**Hooks**
- Prefix custom hooks with `use`
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed to child components
- Keep hooks pure and dependency-aware

**State Management**
- Use React state for local component state
- Avoid lifting state unnecessarily
- Use `useState` with object destructuring for form fields
- Prefer controlled components over uncontrolled

**Styling**
- Use Tailwind CSS utility classes
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Follow the dark theme pattern (className="dark")
- Use semantic color names from Tailwind (zinc, green, red, etc.)

**Event Handling**
- Use arrow functions for inline handlers to preserve `this`
- Use `useNavigate` from react-router-dom for navigation
- Pass state to navigation using `state` property

### Error Handling

**Try-Catch Patterns**
- Wrap file operations and API calls in try-catch blocks
- Log errors appropriately but avoid exposing sensitive information
- Return safe defaults on failure (e.g., `{ moves: [], initialFen: chess.fen() }`)

**Type Guards**
- Use TypeScript's built-in type guards
- Validate inputs at the component boundary
- Use `as` assertions only when confident about types

**Component Boundaries**
- Handle errors gracefully in error boundaries
- Show user-friendly messages for failed operations
- Use fallback UI for loading/error states

### Component Patterns

**UI Components**
- Use shadcn/ui components from `@/components/ui`
- Use `cn()` utility for conditional styling
- Apply Tailwind classes for layout, spacing, and colors
- Use semantic variants (default, outline, ghost, etc.)

**Layout Components**
- Use Card components for grouping content
- Use Button components for actions
- Use Badge components for status indicators
- Use Separator components for visual separation

**Data Display**
- Use `text-zinc-900` for dark backgrounds
- Use `text-white` for primary text on dark backgrounds
- Use `text-zinc-500` for secondary text
- Use `text-zinc-400` for muted text
- Use `text-xs` for small labels

### File Organization

**Structure**
- Keep components in `src/components/`
- Keep hooks in `src/hooks/`
- Keep utilities in `src/lib/utils.ts`
- Keep types in `src/types/index.ts`
- Keep pages in `src/pages/`

**File Naming**
- Use PascalCase for component files (e.g., `GameCard.tsx`)
- Use camelCase for hook files (e.g., `useChessGame.ts`)
- Export components and hooks from their respective files

### ESLint Configuration
- Follow ESLint recommended rules
- Use `eslint-plugin-react-hooks` for React best practices
- Use `eslint-plugin-react-refresh` for Vite development
- Run lint before committing changes

### TypeScript Rules
- Enable all strict type checking
- Avoid `any` types when possible
- Use specific types instead of `object` or `unknown`
- Prefer `interface` for object shapes
- Use `enum` for fixed sets of related values