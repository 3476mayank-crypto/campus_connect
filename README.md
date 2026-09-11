# Campus Connect

A full-stack platform connecting students and campus communities through real-time collaboration and resource sharing.

## Quick Start

### Prerequisites
- Node.js 24+
- PostgreSQL
- pnpm

### Installation & Development

```bash
# Install dependencies
pnpm install

# Set up environment
export DATABASE_URL="postgresql://user:password@localhost:5432/campus_connect"

# Run the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# Full typecheck
pnpm run typecheck

# Build all packages
pnpm run build
```

## Stack

- **Runtime**: Node.js 24, TypeScript 5.9
- **Package Manager**: pnpm workspaces
- **API**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (v4), drizzle-zod
- **API Codegen**: Orval (OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI Styling**: Tailwind CSS, Framer Motion

## Project Structure

```
campus_connect/
├── artifacts/          # Built applications
│   └── api-server/     # Express API server
├── lib/                # Shared TypeScript libraries
├── scripts/            # Utility and setup scripts
├── package.json        # Root workspace config
├── pnpm-workspace.yaml # Workspace and dependency catalog
└── tsconfig.base.json  # Base TypeScript config
```

## Core Commands

| Command | Purpose |
|---------|---------|
| `pnpm --filter @workspace/api-server run dev` | Run API server in dev mode |
| `pnpm run typecheck` | Type-check all packages |
| `pnpm run build` | Build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API types from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Apply DB schema changes (dev only) |

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `NODE_ENV` — Set to `development` or `production` (default: `development`)

## Architecture

- **Monorepo**: pnpm workspaces manage shared dependencies and libraries
- **Type Safety**: Full TypeScript with strict mode enabled
- **API-First**: OpenAPI spec defines API contracts; Orval generates hooks and validators
- **Database**: Drizzle ORM with migrations for version control
- **Security**: Supply-chain attack defense via `minimumReleaseAge` in pnpm-workspace.yaml

## Contributing

1. Make changes in feature branches
2. Run `pnpm run typecheck` to ensure type safety
3. Run `pnpm run build` before committing
4. Push to a branch and open a Pull Request

## Support

For detailed development notes, see `replit.md`.

---

**Status**: 🚀 Active hackathon project  
**License**: MIT
