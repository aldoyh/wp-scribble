# Scribbble Copilot Instructions

## Architecture Overview

Scribbble is a **dual-rendering blogging platform** with desktop app capabilities:

- **Backend**: Express.js API (`source/backend/`) with SQLite + automated migrations
- **Frontend**: React SPA (`source/frontend/`) using Snowpack bundler  
- **Static Generation**: Server-side React rendering for SEO (dual-mode architecture)
- **Desktop App**: Electron wrapper with native features and system integration
- **Settings System**: Comprehensive user settings with desktop-specific options
- **File Storage**: Markdown + images in `content/{username}/{slug}/` directories

## Critical Development Workflows

### Setup & Dependencies
```bash
npm install --legacy-peer-deps  # Install dependencies (handles React experimental version)
npm install @babel/plugin-syntax-top-level-await --save-dev --legacy-peer-deps  # Required for transpilation
```

### Development Workflow
```bash
# 1. Install dependencies and transpile frontend for SSR
npm install --legacy-peer-deps
node scripts/transpile-frontend.mjs

# 2. Start both servers (use separate terminals)
npm run develop_backend    # Backend: http://localhost:4000 (with fixtures)
npm run develop_frontend   # Frontend: http://localhost:8081 (proxies to backend)

# 3. Production build
npm run build              # Builds frontend to build/frontend/
npm run lint               # ESLint check for .jsx/.mjs files
```

### Frontend Transpilation for SSR
**CRITICAL**: Frontend React components must be transpiled for backend SSR usage:
```bash
# MUST run this after ANY frontend changes affecting SSR pages
node scripts/transpile-frontend.mjs
```
Files in `source/frontend/pages/` → `source/backend/frontend/pages/` (JSX→ESM)

**Key SSR Files to Watch:**
- `pages/home.jsx`, `pages/login.jsx`, `pages/article.jsx`, `pages/profile.jsx`  
- Any component used in static page generation

## Unique Patterns & Conventions

### File-Based Content + Security Pattern
```javascript
// ALWAYS validate directory access before file operations
assertAccessibleDirectoryForUsername(articlePath, username);
// Prevents path traversal attacks, ensures user can only access their content
```

### Busboy Multipart Upload Pipeline
Complex image handling in articles/profiles using streaming approach:
1. Frontend: `blob:` URLs + localStorage for temporary storage
2. Backend: Busboy streams to `os.tmpdir()` 
3. Process: AST traversal replaces blob URLs with filenames
4. Final: Move temp files to `content/{username}/{slug}/`

Example pattern in `source/backend/routes/articles.mjs`:
```javascript
busboy.on('file', async (fieldname, file, filename) => {
  // Stream to temp directory
});
busboy.on('field', (fieldname, value) => {
  fields[fieldname] = JSON.parse(value);  // JSON-encoded form fields
});
```

### React-Sprout Routing Pattern
Uses `react-sprout` (not React Router) with data loading:
```javascript
// Route definition with data loader
<Article path=":username/:slug/" data={getArticleData} />

// Data loader function
export async function getArticleData({ username, slug }) {
  return await get(`/api/users/${username}/articles/${slug}`);
}

// Component accesses via hook
function Article() {
  let { article, author } = useData();
}
```

### Markdown AST Processing Chain
```
Frontend: Markdown → MDAST → HAST → React (with syntax highlighting)
Backend:  Markdown → MDAST → visit() → transform → save to disk
```
- Uses `unist-util-visit` for AST traversal
- `@mapbox/rehype-prism` for syntax highlighting
- Custom `hastToReact()` utility converts HAST to React elements

## Database & Authentication Patterns

### SQLite with Environment Switching
```javascript
// Development uses copied production DB
await Filesystem.copyFile(productionDatabasePath, developmentDatabasePath);
// Automatic migration system in database.mjs module
```

### Email-Based Authentication Flow
1. POST `/login` → generates email token → sends magic link
2. GET `/api/login?token=...` → validates → creates session cookie
3. Session middleware validates cookie on requests → sets `request.user`
4. Global middleware blocks unauthorized requests after auth routes

### Username Assignment (One-Time Only)
```javascript
// Users can ONLY set username once during first article creation
if (user.username == undefined) {
  // Validate and set username permanently
}
```

## Static Generation System

### Dual-Rendering Architecture
Articles exist in 2 modes simultaneously:
1. **SPA Route**: `/:username/:slug/` (React components)
2. **Static HTML**: `content/{username}/{slug}/index.html` (SEO-optimized)

When articles are published, triggers cascade:
```javascript
await updateArticlePage(articleId);     // Generate article HTML
await updateProfilePage(username);      // Regenerate profile page  
await updateFeed(username);            // Update RSS feed
```

### Admin Subdomain Routing  
```javascript
// Frontend entry point detects subdomain
const regex = /(admin)\.(localhost|scribbble\.io)/;
if (hostname.match(regex)) render = <Admin />; 
```

### Build System & Dependencies

### Snowpack Configuration (`snowpack.config.js`)
- **Dev**: Proxies `/api/*` → `localhost:4000`, serves `content/` as static
- **Prod**: Serves from `build/frontend/`  
- **Routes**: SPA fallback to `index.html`, special routes for `/login`, `/export`

### Critical Dependencies
- **React**: Uses experimental version `0.0.0-experimental-7f28234f8` (for concurrent features)
- **react-sprout**: Custom routing library (not React Router) - provides data loading patterns
- **busboy**: Streaming multipart form processing with 100 file, 10MB limits
- **mdast-util-***: Markdown AST manipulation pipeline
- **immer**: Immutable state updates (used extensively in frontend)
- **tailwindcss-dark-mode**: Custom dark mode plugin
- **PostCSS 8+**: Required for build process

### Version Compatibility Notes
- Must use `--legacy-peer-deps` for npm installs due to experimental React version
- Babel configuration requires top-level-await plugin for ESM transpilation

## Error Handling & Security

### HTTP Error Classes
```javascript
// Shared error classes between frontend/backend
throw new NotFoundError(`No article found with slug "${slug}"`);
// Frontend ErrorBoundary catches and renders appropriate pages
```

### Path Security Pattern
```javascript
// Always validate before file operations
let relativePath = Path.relative(userDirectory, directory);
if (relativePath.startsWith('..')) throw new Error('Invalid path');
```

## Production Considerations

- PM2 process management (`pm2.config.js`)
- Database switching: `production.sqlite` vs `development.sqlite`
- Static file serving: `static/` → `build/frontend/` → `content/`
- Email delivery via sendmail in production, console logs in development

## Key Debugging Points

1. **Frontend not updating?** → Run `scripts/transpile-frontend.mjs` after changes
2. **Images not uploading?** → Check Busboy limits (100 files, 10MB each)
3. **Static pages broken?** → Verify database triggers regenerate HTML files
4. **Auth issues?** → Check session middleware token validation
5. **Build failing?** → Ensure all dependencies installed (`npm install`)

When modifying this codebase, always consider both SPA navigation AND static file generation impacts.