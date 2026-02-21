# Navid AI Frontend
ChatGPT-like frontend built on Next.js 16 App Router, with ShadCN, Framer Motion, React Query, Zustand, and MSW (mock-first API mode).

## What Was Implemented
- Full app shell with authenticated workspace and responsive sidebar/drawer navigation.
- Public/auth/protected route structure with onboarding and route guards.
- Auth pages for login, signup, forgot password, and reset password.
- Chat pages for new conversation and conversation detail (`/chat/[conversationId]`).
- Streaming-like assistant response behavior in mock mode.
- Multimodal composer support (images + docs), attachment validation, upload states.
- Settings pages for profile and preferences (theme + default model).
- Help center page with searchable mock articles.
- Shared reusable component system grouped by domain.
- Typed API contract layer with Zod schemas and a unified API client abstraction.
- Remote state handled by React Query; local UI/draft state handled by Zustand.
- MSW-based mock backend with auth/chat/settings/help handlers and in-memory DB.
- ShadCN/Tailwind v4 design tokens and global theme variables (light/dark).

## Tech Stack
- Next.js 16 (App Router + Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4 + ShadCN UI
- Framer Motion
- @tanstack/react-query
- Zustand
- Zod
- MSW (Mock Service Worker)
- react-hook-form + zod resolver
- next-themes + sonner

## Route Map
| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public-only | Sign in (email/password + Google) |
| `/signup` | Public-only | Create account |
| `/forgot-password` | Public-only | Request password reset |
| `/reset-password` | Public-only | Complete password reset |
| `/onboarding` | Auth-only | First-time setup (name/theme/model) |
| `/chat` | Auth + onboarding complete | Chat home, new conversation flow |
| `/chat/[conversationId]` | Auth + onboarding complete | Conversation detail, stream/edit/regenerate/delete |
| `/settings/profile` | Auth + onboarding complete | Profile management |
| `/settings/preferences` | Auth + onboarding complete | Theme + default model |
| `/help` | Auth + onboarding complete | Searchable help articles |

## Component Architecture
- `src/features/auth/components/*`: auth cards/forms/password/oAuth controls + route guards.
- `src/features/chat/components/*`: composer, messages, attachments, model selector, stream controls.
- `src/features/workspace/components/*`: sidebar, conversation list, user menu, workspace shell.
- `src/features/settings/components/*`: profile form, preferences form, theme toggle.
- `src/features/landing/layout/*`: landing layout primitives (header/nav).
- `src/features/landing/sections/*`: page sections (hero/features/workflow/cta).
- `src/features/landing/visuals/*`: shader palette and background visuals.
- `src/components/shared/*`: page header, section card, loading/error/confirm components.
- `src/components/ui/*`: ShadCN primitives (button, input, form, dialog, dropdown, etc).

## State Management
| Layer | Library | Scope |
| --- | --- | --- |
| Remote/server state | React Query | Session, models, conversations, messages, settings, help, mutations |
| Query key standardization | React Query + key factory | `src/lib/query-keys.ts` |
| Local UI state | Zustand | Sidebar collapse/mobile drawer in `src/stores/ui-store.ts` |
| Local draft state | Zustand | Per-conversation draft + attachments in `src/stores/draft-store.ts` |

## API + Contracts
- Typed API interfaces in `src/lib/api/types.ts`.
- HTTP wrapper and consistent API error shape in `src/lib/api/http.ts`.
- API client abstraction in `src/lib/api/client.ts`.
- Domain Zod contracts in `src/lib/contracts/*`:
- `src/lib/contracts/auth.ts`
- `src/lib/contracts/chat.ts`
- `src/lib/contracts/settings.ts`
- `src/lib/contracts/help.ts`
- `src/lib/contracts/common.ts`

## Mock-First Data Layer
- MSW setup: `src/mocks/browser.ts`, `src/mocks/server.ts`, `src/mocks/index.ts`
- Domain handlers: `src/mocks/handlers/auth.ts`, `src/mocks/handlers/chat.ts`, `src/mocks/handlers/settings.ts`, `src/mocks/handlers/help.ts`
- In-memory DB: `src/mocks/data/db.ts`, `src/mocks/data/errors.ts`
- Service worker asset: `public/mockServiceWorker.js`

## API Mode
- Default behavior is mock mode.
- Set `NEXT_PUBLIC_API_MODE=live` to disable MSW interception and use real backend endpoints.
- Set `NEXT_PUBLIC_API_URL` to point to the backend origin (for example `http://127.0.0.1:8000`).
- Current live-mode streaming is adapter-ready but simplified (mock mode simulates token streaming).

## Auth and Guards
- Public-only redirect guard: `src/features/auth/components/public-only-guard.tsx`
- Session-required guard: `src/features/auth/components/require-session.tsx`
- Onboarding-required guard: `src/features/auth/components/require-onboarding-complete.tsx`

## Attachment Rules
- Max attachments per message: `10`
- Max file size per attachment: `10MB`
- Allowed types: png, jpg/jpeg, webp, gif, pdf, txt, md
- Validation helper: `src/features/chat/lib/attachment-validation.ts`

## Theme and Design Tokens
- Global theme/token file: `src/app/globals.css`
- Includes light/dark token sets and `@theme inline` mapping for Tailwind v4.
- Focus ring, radius, shadows, and surface tokens are centralized there.

## Project Structure
```text
src/
  app/
    (auth)/
    (protected)/
      (workspace)/
    globals.css
    layout.tsx
  components/
    providers/
    shared/
    ui/
  features/
    auth/
    chat/
    help/
    landing/
      layout/
      sections/
      visuals/
    settings/
    workspace/
  lib/
    api/
    contracts/
    constants.ts
    query-keys.ts
  mocks/
    data/
    handlers/
    browser.ts
    index.ts
    server.ts
  stores/
```

## Development
Install dependencies:
```bash
pnpm install
```

Run dev server:
```bash
pnpm dev
```

Build:
```bash
pnpm build
```

Start production server:
```bash
pnpm start
```

Lint:
```bash
pnpm lint
```

## Mock Login (for quick local testing)
- Email: `demo@navid.ai`
- Password: `password123`

## Notable Config
- `next.config.ts` pins Turbopack root to project directory to avoid wrong-root module resolution issues.
- `components.json` configured for ShadCN + Tailwind v4.

## Troubleshooting
If colors/styles look stale:
1. Stop dev server.
2. Delete `.next` folder.
3. Restart with `pnpm dev`.
4. Hard refresh browser (`Ctrl+Shift+R`).

If you see `.next/dev/lock` error:
1. Ensure no other `next dev` process is running.
2. Remove the lock file.
3. Restart dev server.
