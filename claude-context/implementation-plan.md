# Kaitz — Implementation Plan

## Project Summary

A fantasy literary archive website for an author, built with **Nuxt 4 + Vue 3 + SCSS + anime.js**, connected to a **Directus CMS** backend. The visual metaphor is an ancient magical library — rooms, artifacts, and objects instead of pages and lists.

---

## Current State

### Done
- Root layout with animated background (ink gradients, radial moon glow)
- `RuneCompass` + `RuneMenu` — radial navigation, fully animated via anime.js
- Home/Hall page with responsive grid
- `HallScene` — atmospheric fog, motes, light shafts, vignette
- `FeaturedStoryPedestal` — featured story showcase
- `NewsNoticeBoard` — pinned notes with tilt/hover effects
- All API routes (stories, news, diary, themes, series, chapters, pages)
- All composables for data fetching
- Full SCSS design system (variables, mixins, Cormorant Garamond font)
- Directus CMS integration

### Stubs / Missing
- Story detail page (`/story/[slug]`)
- Diary entry page (`/diary/[slug]`)
- News article page (`/news/[slug]`)
- `DiaryLectern` component (exists, content unclear)
- `ThemesShelf` component (exists, content unclear)
- Entrance sequence (opening doors animation)
- Stories section / shelves page
- Trilogy altar page/section
- About, Imprint, Privacy static pages
- Newsletter/wax-seal form
- PWA configuration

---

## Design System Reference

| Token | Value | Use |
|---|---|---|
| `$ink-950` | `#090511` | Deepest background |
| `$ink-900` | `#12081f` | Secondary bg |
| `$accent-500` | `#b042c9` | Glow, runes, accent |
| `$moon-100` | `#d6d6e6` | Primary text |
| `$parchment-100` | `#e8dcc4` | Parchment surfaces |

**Fonts:** Cormorant Garamond (serif, all weights loaded)
**Animations:** anime.js for interactive; CSS keyframes for ambient
**Breakpoints:** mobile → tablet (`48rem`) → desktop (`72rem`)

---

## Implementation Phases

---

### Phase 1 — Entrance Sequence (High Impact / Visitor First Impression)

**Goal:** Two ornate wooden doors open on first visit. Skip on return visits via `localStorage`.

**File:** `app/components/EntranceSequence.vue` + integrate in `app/app.vue`

**Implementation:**

1. Create `EntranceSequence.vue`:
   - Full-viewport overlay (`position: fixed; inset: 0; z-index: 1000`)
   - Two door panels (left + right halves) as `div`s with CSS parchment/wood gradients and arcane engraving borders
   - Fog element at bottom using existing `HallScene` fog technique
   - Moonlight "leak" through center crack using a narrow radial gradient strip
   - "Enter the Archive" button/text that triggers the open animation
   - On click: anime.js rotates left door `rotateY(-110deg)` and right door `rotateY(110deg)` with `perspective` parent, then fades overlay out
   - After animation resolves: remove component from DOM, write `kaitz_entered: true` to `localStorage`

2. In `app/app.vue`:
   - Check `localStorage` on mount; show `EntranceSequence` only if key absent
   - Respect `prefers-reduced-motion` — skip animation, show simple fade

**Accessibility fallback:** `@media (prefers-reduced-motion: reduce)` → instant fade-in, no door animation

---

### Phase 2 — Home Hall Components (Complete the Landing Page)

#### 2a. `DiaryLectern` — Personal Desk

**File:** `app/components/hall/DiaryLectern.vue`

**Visual:** Wooden desk surface with quill/ink aesthetic. Diary entries appear as open handwritten scrolls.

**Implementation:**
- Background: dark wood gradient (`linear-gradient` browns/dark)
- Header: "The Diary" with quill icon SVG or Unicode glyph
- Entry list: 3 most recent diary entries from `useDiary()`
- Each entry: title, date formatted as "moon phase + date" aesthetic, short excerpt (150 chars)
- "Older entries fade into shadow" — apply decreasing opacity to entries 2 and 3 (`opacity: 0.85`, `0.65`)
- Hover on entry: subtle scroll-unfurl scale (`scaleY: 1.02`) + glow
- Link to `/diary/[slug]` for each entry
- "Open the Desk" footer link → future `/diary` index page

#### 2b. `ThemesShelf` — Horizontal Shelves

**File:** `app/components/hall/ThemesShelf.vue`

**Visual:** Stone-engraved shelf titles, horizontal book rows per theme.

**Implementation:**
- Fetch themes via `useThemes()`; for each theme fetch associated stories via `useStories({ theme })`
- Each shelf: stone-texture header bar with `$moon-100` engraved title text
- Books: vertical rectangular cards (`~80px × 110px`), gradient spines, title rotated 90°
- Hover: breathing glow (`box-shadow: 0 0 12px $accent-500`) + slight `translateY(-3px)` lift
- Shelf row: horizontal scroll on mobile (`overflow-x: auto; scroll-snap-type: x mandatory`)
- Ambient color per theme: store a `color` field in Directus themes collection, use for shelf accent

---

### Phase 3 — Detail Pages

#### 3a. Story Detail Page

**File:** `app/pages/story/[slug].vue`

**Visual:** Parchment manuscript with page-edge chapter navigation.

**Implementation:**
- Fetch story + chapters via `useStory(slug)` + `useStoryChapters(slug)`
- Layout: centered column, max `52rem`, parchment surface background
- `ParchmentSurface` wrapper for content area
- Drop cap on first paragraph: `::first-letter { font-size: 4rem; float: left; line-height: 0.8 }`
- Chapter navigation: "page edge" tabs on right side — vertical list of chapter numbers, styled as dog-eared page corners
- Footnotes/marginal notes: `<aside>` with `position: absolute; right: -14rem` on desktop, inline on mobile. Handwritten-style font, slight tilt
- CSS `border-image` parchment frame on content block (or replicate with inset `box-shadow` layers)
- Reading progress tracked in `localStorage` per story slug

#### 3b. Diary Entry Page

**File:** `app/pages/diary/[slug].vue`

**Visual:** Desk surface, open scroll, candlelight.

**Implementation:**
- Fetch entry via `useDiaryEntry(slug)`
- Background: same wooden desk gradient as `DiaryLectern`
- Candle flicker: small SVG flame element, CSS `@keyframes flicker` (random `opacity` + `scaleY` variation via multi-step keyframe)
- Entry rendered in `ParchmentSurface` scroll container with slight rotation (`rotate(0.3deg)`)
- Mood tags as moon-phase symbols: map tag values → Unicode symbols (🌑🌒🌓🌔🌕) or SVG rune icons
- "Previous / Next Entry" navigation as scroll-edge links

#### 3c. News Article Page

**File:** `app/pages/news/[slug].vue`

**Visual:** Parchment broadsheet / notice.

**Implementation:**
- Fetch item via `useNewsItem(slug)`
- `ParchmentSurface` full-width notice layout
- Wax seal stamp in top corner (decorative CSS circle with `$accent-500` glow)
- Pin head at top center (matches `NewsNoticeBoard` aesthetic)
- Date formatted in archaic style (e.g., "On the 4th day of March, MMXXVI")
- Back link: "Return to the Notice Board"

---

### Phase 4 — Stories Section (The Shelves)

**File:** `app/pages/stories/index.vue`

**Visual:** A full hall of horizontal shelves, each shelf a theme wing.

**Implementation:**
- Full-page atmospheric background (reuse `HallScene`)
- Page header: "The Stacks" or "Story Wing" with `HallHeader`
- One horizontal shelf section per theme (from `useThemes()`)
- Each book card (`~100px × 140px`):
  - Spine gradient (use theme accent color)
  - Title text rotated 90° (truncated at 2 lines)
  - Hover: `translateY(-6px)` lift + glow bloom
  - Click → `/story/[slug]`
- Empty shelf state: "No tomes yet in this wing" placeholder
- Shelf label: stone-engraved header bar

---

### Phase 5 — Trilogy Altar

**File:** `app/pages/trilogy.vue` (or section in `index.vue`)

**Visual:** Three massive tomes on a triangular altar. Locked by default, each opens on interaction.

**Implementation:**
- Fetch trilogy series via `useSeries()` filtered to trilogy type
- Layout: three items in CSS `clip-path` triangle arrangement — use `position: absolute` with calculated top/left for each corner
- Each tome:
  - Large book graphic (CSS + gradient, arcane symbol overlay)
  - Default state: "locked" — grayscale filter, closed-book posture
  - Hover: remove filter, symbol glows, tagline fades in
  - Click: book "opens" — anime.js `scaleX` to simulate page spread, then link to story
- Constellation lines: SVG `<line>` elements connecting tome centers, `stroke-dasharray` animated draw-on
- Reading progress: fetch `localStorage` for each story slug, render progress bar on cover

---

### Phase 6 — Newsletter (Wax-Sealed Letter)

**File:** `app/components/NewsletterLetter.vue` + `app/pages/newsletter.vue`

**Visual:** Envelope with wax seal. User "breaks" seal to reveal form.

**Implementation:**
- Envelope SVG (or CSS-only) with flap fold using `clip-path` triangles
- Wax seal: circular `div` with `$accent-500` radial gradient, arcane sigil SVG inside
- Interaction:
  - Click seal: anime.js `rotate(45deg)` + `scale(0)` on seal (crack effect)
  - Envelope flap: animate `rotateX(-180deg)` with `perspective` to "open"
  - Form slides up from envelope body: `translateY` + `opacity`
- Form fields: name + email, styled as ink-on-parchment (`border-bottom` only, no box)
- Submit: form posts to Directus or third-party (Mailchimp/Resend)
- Confirmation: glowing rune SVG animates in, text "The letter has been sealed and sent"

---

### Phase 7 — Static Pages

**Files:** `app/pages/about.vue`, `app/pages/imprint.vue`, `app/pages/privacy.vue`

All fetch from `/api/pages/[key]` (already implemented in server).

- `about.vue`: "The Archivist" desk scene, author bio on parchment scroll
- `imprint.vue` + `privacy.vue`: Simple parchment surface, markdown-rendered content

---

### Phase 8 — PWA

**File:** `nuxt.config.ts` additions, `public/manifest.json`

**Implementation:**
- Add `@vite-pwa/nuxt` module
- `manifest.json`:
  - `name: "Kaitz – The Living Archive"`
  - `theme_color: "#2b0f3f"`
  - `background_color: "#090511"`
  - Icons: arcane sigil in 192px + 512px variants (create SVG → PNG)
- Offline page (`public/offline.html`): candlelight single candle, "The archive sleeps. Return when the connection stirs."
- Service worker strategy: `StaleWhileRevalidate` for API; `CacheFirst` for fonts/images
- "Candlelight Mode" label for offline indicator in the UI (small candle icon in footer)

---

## Component Dependency Map

```
app.vue
└── EntranceSequence.vue          [Phase 1]
└── layouts/default.vue
    ├── RuneCompass.vue            [Done]
    ├── RuneMenu.vue               [Done]
    └── pages/
        ├── index.vue              [Mostly Done]
        │   ├── HallScene.vue      [Done]
        │   ├── HallHeader.vue     [Done]
        │   ├── FeaturedStoryPedestal.vue  [Done]
        │   ├── NewsNoticeBoard.vue        [Done]
        │   ├── DiaryLectern.vue           [Phase 2a]
        │   └── ThemesShelf.vue            [Phase 2b]
        ├── story/[slug].vue               [Phase 3a]
        ├── diary/[slug].vue               [Phase 3b]
        ├── news/[slug].vue                [Phase 3c]
        ├── stories/index.vue              [Phase 4]
        ├── trilogy.vue                    [Phase 5]
        ├── newsletter.vue                 [Phase 6]
        ├── about.vue                      [Phase 7]
        ├── imprint.vue                    [Phase 7]
        └── privacy.vue                    [Phase 7]
```

---

## Directus CMS Requirements

The following fields/collections may need additions or verification in Directus:

| Collection | Required Fields |
|---|---|
| `stories` | `slug`, `title`, `synopsis`, `status`, `theme` (relation), `series` (relation), `cover_image` |
| `chapters` | `story` (relation), `number`, `title`, `content`, `footnotes` |
| `diary` | `slug`, `title`, `date`, `content`, `excerpt`, `mood_tag` |
| `news` | `slug`, `title`, `date`, `content`, `excerpt`, `featured` |
| `themes` | `slug`, `title`, `accent_color` |
| `series` | `slug`, `title`, `tagline`, `symbol_image`, `type` (`trilogy`\|`series`), `stories` (relation) |
| `pages` | `key`, `title`, `content` |

---

## Priority Order

| Priority | Phase | Rationale |
|---|---|---|
| 1 | Phase 1 — Entrance Sequence | First thing visitors see; sets the tone |
| 2 | Phase 2 — Home Hall components | Completes the landing page |
| 3 | Phase 3 — Detail pages | Required for basic content browsing |
| 4 | Phase 4 — Stories section | Core content discovery |
| 5 | Phase 5 — Trilogy altar | High-impact showcase feature |
| 6 | Phase 6 — Newsletter | Audience building |
| 7 | Phase 7 — Static pages | Legal / author identity |
| 8 | Phase 8 — PWA | Enhancement, not core |

---

## Notes & Conventions

- Always check `prefers-reduced-motion` before adding any animation (pattern established in existing components)
- Use anime.js for interactive/triggered animations; CSS keyframes for ambient/looping effects
- All new components should use `<style lang="scss" scoped>` and import variables via `@use '@/assets/styles/variables' as *`
- Parchment surfaces: use `ParchmentSurface.vue` wrapper rather than reimplementing grain texture
- Glow pattern: `box-shadow: 0 0 Xpx rgba($accent-500, 0.Y)` — keep consistent
- Mobile-first: start with single-column, add complexity at `48rem` and `72rem`
- Link routing: use `<NuxtLink>` not `<a>` for internal navigation
