# minor.stevenheijn.nl

Read-only one-pager (Next.js 16, App Router, Tailwind v4, Vercel) that shows the HBO-ICT minor portfolio: per sprint the learning outcomes with argumentation, the executed stories with acceptance and quality criteria, and evidence. UI copy is Dutch.

## Data contract — do not change without an explicit instruction

The content is **not** edited here. S-Base (`~/Development/S-Base`, module `minor`) is the only source of truth. When a self-evaluation is saved in S-Base, n8n fetches a sanitized snapshot and commits it to this repo on `main`, which makes Vercel deploy.

- Only data source: `data/minor-snapshot.json`. Written by n8n. Never edit it by hand, except the empty initial one.
- `public/minor/` holds evidence files (images, documents) and is also written by n8n.
- Protected, do not rename, move or delete: `data/minor-snapshot.json`, `public/minor/`, `src/types/snapshot.ts`, `src/lib/snapshot.ts`, `src/lib/snapshot.test.ts`, `fixtures/snapshot.sample.json`.
- Do not add or restore: a database, login or sessions, API routes that store data, file uploads, writes to the filesystem at runtime, GitHub sync from the app, or any `GITHUB_TOKEN` / `AUTH_*` env var. The previous admin app was removed on purpose; it lives in git history only.
- Changing the snapshot format means changing S-Base (`backend/src/modules/minor/public-snapshot.ts`), the n8n workflow (`docs/n8n/minor-publish.workflow.json` in S-Base) and `src/types/snapshot.ts` together, and bumping `version`. `parseSnapshot` fails the build on an invalid snapshot, so Vercel keeps the last good deploy.
- Keep `main` as the deploy branch. Do not change the Vercel project settings (Git integration, build command, root directory).
- Names of people (peer help, feedback authors) are stripped by S-Base. Do not add them back to the types or the UI.

Pages and styling may change freely as long as they only read the snapshot.

## Commands

| Command | What |
|---------|------|
| `bun install` | Install dependencies |
| `bun dev` | Dev server on `:3000` |
| `bun test` | Snapshot contract tests |
| `bun run build` | Production build (validates the snapshot) |

## Design

Black background, white text, zinc greys, Signal Green `#00e3a4` used sparingly, Oatmeal serif for the single `h1`, Epilogue for body text, JetBrains Mono for small labels. No nested cards. Tap targets are at least 44×44 px. Everything works on mobile and desktop.
