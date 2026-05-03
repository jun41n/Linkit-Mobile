# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### linkit (LinkIt 링킷) — Expo mobile app
Tuda-style 다꾸 diary + Setlog vertical video log with sticker store monetization. Korean UI, cream/pastel palette, handwritten Gaegu font.

- **3 bottom tabs**: 책장 (bookshelf) / 영상로그 (video log) / MY
- **Diary types** (`DiaryKind`): SOLO (혼자), SHARED (함께/교환일기), FAVORITE (즐겨)
- **Decoration canvas**: photos + draggable/pinchable/rotatable emoji stickers + freeform text overlays + pastel page backgrounds. Built with `react-native-gesture-handler` + `react-native-reanimated` (gestures use `runOnJS` to write back to React state).
- **Sticker store** (`/store`): 6 packs (2 free + 4 paid premium ₩2,900~₩4,900). Purchase flow simulated via `Alert.alert` confirm + AsyncStorage; PRO badges for paid packs.
- **Persistence — cloud sync**: Diaries, entries, and owned sticker packs are synced to PostgreSQL via the `@workspace/api-server` Express API, scoped to the Clerk `userId`. Tables use composite primary key `(userId, id)` so client-generated IDs cannot collide across tenants. Frontend uses generated React Query hooks from `@workspace/api-client-react`; `ApiAuthBridge` (in `lib/apiClient.tsx`, mounted in `app/_layout.tsx`) registers the Clerk `getToken()` so all requests carry an Authorization Bearer. Free packs are auto-granted on first load. PATCH payloads only include defined fields to avoid clobbering. Server enforces diary ownership when creating an entry. Sticker catalog (`PACKS`) remains client-side; only ownership is synced.
- **Key files**:
  - `app/_layout.tsx` — root stack + provider wiring
  - `context/DiariesContext.tsx`, `context/StickersContext.tsx` — state + persistence
  - `components/StickerCanvas.tsx` — gesture-driven decoration canvas
  - `components/StickerDrawer.tsx` — pack tabs + sticker grid
  - `components/DiaryBookCover.tsx` — book-cover visual
  - `app/(tabs)/index.tsx` (책장), `app/(tabs)/video.tsx`, `app/(tabs)/my.tsx`
  - `app/diary/new.tsx`, `app/diary/[id].tsx`
  - `app/entry/new.tsx` (글/다꾸/배경 toolbar), `app/entry/[id].tsx`
  - `app/store/index.tsx`, `app/store/[id].tsx`
  - `app/notifications.tsx`
  - `lib/apiClient.tsx` — sets API base URL + Clerk token bridge
- **Backend** (artifact `api-server`):
  - `lib/db/src/schema/{diaries,entries,ownedPacks}.ts` — Drizzle schemas, composite PK `(userId, id)`
  - `lib/api-spec/openapi.yaml` — OpenAPI source of truth for diaries / entries / owned-packs CRUD
  - `artifacts/api-server/src/middlewares/requireAuth.ts` — Clerk `getAuth()` → `req.userId`
  - `artifacts/api-server/src/routes/{diaries,entries,ownedPacks}.ts` — user-scoped routes
