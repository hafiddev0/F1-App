# Copilot Instructions for F1 App

## Project Overview

F1 App is a web application for enthusiasts of Formula 1 using OpenF1 API that provides detailed Formula 1 telemetry, timing, and session data. 🏎️

### Tech Stack

- **Framework**: [Angular/TypeScript]
- **Language**: [TypeScript/JavaScript]
- **Build Tool**: [Webpack/Next.js]
- **Package Manager**: [npm]
- **Backend**: [None]
- **Database**: [None]

## Build, Test & Lint Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Stop development server
# Ctrl+C
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a single test file
npm test -- path/to/test.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="component name"

# Generate coverage report
npm test -- --coverage
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix linting errors automatically
npm run lint -- --fix

# Format code with Prettier
npm run format

# Type check (TypeScript)
npm run type-check
```

### Building

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Directory Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components (or routes)
├── hooks/           # Custom Angular hooks
├── services/        # API calls and external service integrations
├── store/           # State management RxJs
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
├── styles/          # Global styles and theme configuration
└── App.ts          # Root component
```

### Key Architectural Patterns

- **Component-driven**: Break UI into small, reusable components
- **Separation of concerns**: Keep components focused on presentation, move logic to hooks/services
- **State management**: I use RxJs for state management and data flow
- **API integration**: I use services to handle API calls and data fetching, keeping components clean and focused on UI
- **Routing**: I use Angular Router for navigation between pages, with route guards for authentication and authorization where necessary

## Code Conventions

### Component Structure

```typescript
// Functional components with TypeScript
export interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Logic here
  return <div>{prop1}</div>;
};
```

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.ts`)
- **Utilities/Hooks**: camelCase (e.g., `useUserData.ts`, `formatDate.ts`)
- **Types**: PascalCase (e.g., `User.types.ts`)
- **Styles**: Match component name (e.g., `UserProfile.module.css`)

### Imports & Exports

- Prefer named exports for components and utilities
- Use path aliases (if configured) to avoid `../../../../` imports
- Group imports: external libraries, internal components, then utilities

### Testing

- Test file location: Colocate test files with source (`Component.test.ts` next to `Component.ts`)
- Use descriptive test names that explain behavior
- Prioritize testing user interactions over implementation details
- Mock API calls, not components

## Development Workflow

### Before Starting Work

1. Ensure dependencies are installed: `npm install`
2. Start the dev server: `npm run dev`
3. Open browser to local dev URL (typically `http://localhost:3000`)

### While Developing

- Keep the dev server running in one terminal
- Watch tests in another: `npm test -- --watch`
- Run linter before committing: `npm run lint`

### Before Committing

```bash
npm run lint -- --fix    # Auto-fix lint issues
npm run type-check       # Verify TypeScript
npm test                 # Ensure tests pass
npm run build            # Verify build succeeds
```

## Common Tasks

### Adding a New Page/Component

1. Create component file in `src/components/`
2. Define TypeScript interface for props
3. Write component logic
4. Create corresponding `.test.ts` file
5. Add routing if it's a page-level component

### Fetching Data from API

1. Create service function in `src/services/` (e.g., `userService.ts`)
2. Create custom hook in `src/hooks/` to wrap the service (e.g., `useUser.ts`)
3. Use hook in component: `const { data, loading, error } = useUser(id)`

### Styling Components

- Use Tailwind CSS for utility-first styling

## Important Notes

- [Add any gotchas, performance considerations, or non-obvious patterns specific to this codebase]
- [Document any complex business logic or unusual architectural decisions]
- [Note any deprecated patterns to avoid]

## Useful References

- [Link to main README if it exists]
- [Link to design documentation]
- [Link to API documentation]
- [Link to any internal wiki or runbooks]
