# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm generate     # Static site generation
pnpm preview      # Preview production build

pnpm seed:directus        # Seed Directus CMS with initial data
pnpm seed:directus:reset  # Reset and re-seed Directus data
```

## Architecture

**Kaitz** is a fantasy literary archive website — the central metaphor is an ancient magical library. Content is organized as rooms, objects, and artifacts rather than standard web pages.

### Stack
- **Frontend:** Nuxt 4 (Vue 3, SSR), SCSS, anime.js
- **CMS:** Directus at `kaitz-cms.moonwitch.art` — all content (stories, chapters, news, diary, series, themes) lives here
- **Styling:** SCSS with design tokens (deep violet `#090511`/`#2b0f3f`, magenta `#b042c9`, moon silver `#d6d6e6`, parchment `#e8dcc4`), Cormorant Garamond font

### Directory Layout
- `app/` — active Nuxt frontend (components, composables, pages, layouts, assets)
- `server/api/` — Nuxt server routes; all proxy to Directus via `server/utils/directus.ts`
- `types/` — shared TypeScript interfaces
- `scripts/` — Directus seed utilities
- `src/` — legacy SvelteKit code, **not active**; ignore for new work

### Data Flow
All data fetching goes through Nuxt server routes (`/api/*`) which call Directus. Client-side composables (`app/composables/use*.ts`) wrap `useAsyncData()` to call these routes. Never call Directus directly from the client.

Runtime config in `nuxt.config.ts`:
- `DIRECTUS_URL` — public, used client-side (the CMS base URL)
- `DIRECTUS_ADMIN_TOKEN` — private, server-only

### Component Naming Conventions
Components follow the library/fantasy metaphor: `HallScene`, `FeaturedStoryPedestal`, `NewsNoticeBoard`, `DiaryLectern`, `ThemesShelf`, `RuneCompass`, `RuneMenu`, `ParchmentFrame`, `ParchmentSurface`. Continue this naming convention.

### Routing
File-based Nuxt routing under `app/pages/`:
- `/` — main Hall (library entrance)
- `/story/[slug]` — story detail
- `/diary/[slug]` — diary entry
- `/news/[slug]` — news item

### Implementation Plan
See `claude-context/implementation-plan.md` for the phase-by-phase build order and detailed specs for pending features.

### What's Pending
Entrance sequence (opening doors), DiaryLectern completion, ThemesShelf completion, all detail pages (story/diary/news), Stories section page, Trilogy altar, Newsletter wax-seal form, static pages, PWA.
