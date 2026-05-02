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
- **Persistence**: AsyncStorage keys `@linkit/diaries/v1`, `@linkit/entries/v1`, `@linkit/owned-packs/v1`. Mutations use functional `setState` + ref-based atomic computation + serialized write queue to avoid stale-closure lost-update races, gated on hydration.
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
