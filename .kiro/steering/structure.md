# Project Structure

```
.kiro/
  steering/       # AI assistant steering rules
  specs/          # Feature specs (requirements, design, tasks)

app/              # Next.js App Router pages & layouts
  (auth)/         # Auth-related pages (login)
  (main)/         # Main app pages (dashboard, transactions, etc.)
  api/            # API routes
  layout.tsx      # Root layout
  globals.css     # Global styles + Tailwind theme

components/
  ui/             # shadcn/ui components (button, card, dialog, etc.)
  [feature]/      # Feature-specific components

db/
  schema.ts       # Drizzle ORM schema definitions
  index.ts        # Database connection
  migrations/     # Generated SQL migrations
  seed.ts         # Seed data (default categories)

lib/
  utils.ts        # Utility functions (cn, formatters, etc.)
  validations.ts  # Shared Zod schemas

services/         # Business logic layer
  transaction.ts
  jar.ts
  goal.ts
  report.ts
  ai.ts
  notification.ts

hooks/            # Custom React hooks

tests/            # Test setup & utilities
  setup.ts
```

## Conventions
- File naming: kebab-case for files, PascalCase for components
- Imports use `@/` alias for project root
- API routes follow RESTful conventions
- Server Components by default, "use client" only when needed
