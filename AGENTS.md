# AGENTS.md - Agent Configuration for Scribbble

## Build/Lint/Test Commands

- Build frontend: `npm run build`
- Lint code: `npm run lint`
- Lint and fix: `npm run lint:fix`
- Develop backend: `npm run develop_backend`
- Develop frontend: `npm run develop_frontend`
- Start server: `npm start`

## Code Style Guidelines

### Imports
- Use absolute imports for better readability
- Group imports by type (node modules, relative imports)

### Formatting
- Use tabs for indentation (4 spaces)
- Single quotes for strings
- Trailing commas for better diffs
- Arrow function parentheses: always

### Types
- Use TypeScript for new components
- Add JSDoc annotations for existing JS files

### Naming Conventions
- Use camelCase for variables and functions
- PascalCase for components and classes
- Use descriptive names for better readability

### Error Handling
- Use custom HTTP error classes in `source/backend/errors/http.mjs`
- Handle errors gracefully in UI with error boundaries

### Other Conventions
- Use Immer for immutable state updates
- Follow TailwindCSS class naming conventions
- Use React Sprout for routing

## Copilot Instructions

- Follow the architecture overview in .github/copilot-instructions.md
- Use the dual-rendering pattern for new features
- Be mindful of the file-based content storage system
- Always use assertAccessibleDirectoryForUsername() before file operations

## Linting and Formatting

- ESLint config in .eslintrc
- Prettier config in prettier.config.js
- Babel config in .babelrc

## TailwindCSS Configuration

- Custom configuration in tailwind.config.js
- Dark mode support with tailwindcss-dark-mode plugin
- Component-specific styles in source/frontend/components/
