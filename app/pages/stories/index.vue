<script setup lang="ts">
import { useStories, type Story } from "~/composables/useStories";
import { useSeries }               from "~/composables/useSeries";
import { animate }                 from "animejs/animation";

useSeoMeta({ title: "Die Schriften — Library of Kaitz" });

const { data: stories } = await useStories();
const { data: allSeries } = await useSeries();

// ── Group stories by series ──────────────────────────────────────────────────

interface Shelf {
  seriesId: string | number | null;
  title:    string;
  synopsis?: string | null;
  type?:    string | null;
  stories:  Story[];
}

const shelves = computed<Shelf[]>(() => {
  if (!stories.value) return [];
  const result: Shelf[] = [];

  // Series shelves (in Directus sort_order)
  for (const s of allSeries.value ?? []) {
    const matching = stories.value.filter(
      st => st.series === s.id || st.series === String(s.id)
    );
    if (matching.length) {
      result.push({ seriesId: s.id, title: s.title, synopsis: s.synopsis, type: s.type, stories: matching });
    }
  }

  // Standalone shelf
  const assigned = new Set((allSeries.value ?? []).map(s => String(s.id)));
  const alone = stories.value.filter(st => !st.series || !assigned.has(String(st.series)));
  if (alone.length) {
    result.push({ seriesId: null, title: "Einzelwerke", stories: alone });
  }

  return result;
});

// ── Animations ───────────────────────────────────────────────────────────────

const hdEl     = ref<HTMLElement | null>(null);
const shelfEls = ref<(HTMLElement | null)[]>([]);

function setShelf(el: HTMLElement | null, i: number) {
  shelfEls.value[i] = el;
}

let hasAnimated = false;

// watchPostEffect fires after every DOM flush, so refs are always bound when it runs.
// requestAnimationFrame ensures the browser has painted before we start animating.
watchPostEffect(() => {
  if (!shelves.value.length || hasAnimated) return;
  hasAnimated = true;
  requestAnimationFrame(() => {
    if (hdEl.value) {
      animate(hdEl.value, {
        opacity: [0, 1], translateY: [24, 0],
        duration: 640, ease: "outCubic", delay: 180,
      });
    }
    shelfEls.value.forEach((el, i) => {
      if (!el) return;
      animate(el, {
        opacity: [0, 1], translateY: [28, 0],
        duration: 700, ease: "outCubic",
        delay: 500 + i * 180,
      });
    });
  });
});

// ── Book interaction ──────────────────────────────────────────────────────────

const router     = useRouter();
const tappedBook = ref<string | null>(null);
const bookEls: Record<string, HTMLElement> = {};

const hoveredBook = ref<string | null>(null);
let hoverLeaveTimer: ReturnType<typeof setTimeout> | null = null;

function onBookHoverEnter(slug: string): void {
  if (hoverLeaveTimer) { clearTimeout(hoverLeaveTimer); hoverLeaveTimer = null; }
  hoveredBook.value = slug;
}

function onBookHoverLeave(): void {
  hoverLeaveTimer = setTimeout(() => {
    hoveredBook.value = null;
    hoverLeaveTimer = null;
  }, 100);
}

// Mid-colour of each hue — used for the full-screen cover overlay
const BOOK_BG: Record<number, string> = {
  0: '#7a3820', 1: '#4e2c14', 2: '#9e6030', 3: '#c4963e',
  4: '#6e5024', 5: '#5c3c22', 6: '#846030', 7: '#3c2410',
};

function isTouchPrimary(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function expandIntoBook(slug: string, el: HTMLElement, hue: number): void {
  const vW   = window.innerWidth;
  const vH   = window.innerHeight;
  // Use CSS layout dimensions (un-transformed); rotated 90° the book is
  // offsetHeight wide × offsetWidth tall.
  const oW = el.offsetHeight; // landscape width
  const oH = el.offsetWidth;  // landscape height
  // Always open from the true viewport center so the spine is perfectly centered.
  const cx = vW / 2;
  const cy = vH / 2;
  const maxReach    = Math.sqrt((vW / 2) ** 2 + (vH / 2) ** 2);
  const scaleNeeded = Math.ceil((maxReach * 2) / Math.min(oW, oH)) + 2;
  const bookColor   = BOOK_BG[hue] ?? '#1a0a38';

  // Outer wrap — centered in viewport
  const wrap = document.createElement('div');
  wrap.style.cssText =
    `position:fixed;z-index:9999;` +
    `left:${Math.round(cx - oW / 2)}px;top:${Math.round(cy - oH / 2)}px;` +
    `width:${oW}px;height:${oH}px;` +
    `pointer-events:none;will-change:transform;perspective:400px;`;

  // Parchment pages with edge vignettes and page-curl shading around spine
  const pages = document.createElement('div');
  pages.style.cssText =
    `position:absolute;inset:0;border-radius:2px;` +
    `background:linear-gradient(to right,` +
      `#241205 0%,` +        /* hard dark left vignette */
      `#7a4e1c 5%,` +        /* edge shadow */
      `#b8883c 12%,` +       /* warm amber */
      `#cca060 22%,` +       /* parchment mid */
      `#d4aa6a 32%,` +       /* lighter page surface */
      `#b07830 42%,` +       /* page curving toward spine */
      `#6e3e10 47%,` +       /* deep gutter shadow left */
      `#3e2008 50%,` +       /* spine center (darkest) */
      `#6e3e10 53%,` +       /* deep gutter shadow right */
      `#b07830 58%,` +       /* page curving toward spine */
      `#d4aa6a 68%,` +       /* lighter page surface */
      `#cca060 78%,` +       /* parchment mid */
      `#b8883c 88%,` +       /* warm amber */
      `#7a4e1c 95%,` +       /* edge shadow */
      `#241205 100%` +       /* hard dark right vignette */
    `);`;

  // Left cover half — rotates back from spine (right edge = hinge)
  const coverL = document.createElement('div');
  coverL.style.cssText =
    `position:absolute;left:0;top:0;width:50%;height:100%;border-radius:2px 0 0 2px;` +
    `background:${bookColor};transform-origin:right center;will-change:transform;`;

  // Right cover half — rotates back from spine (left edge = hinge)
  const coverR = document.createElement('div');
  coverR.style.cssText =
    `position:absolute;right:0;top:0;width:50%;height:100%;border-radius:0 2px 2px 0;` +
    `background:${bookColor};transform-origin:left center;will-change:transform;`;

  wrap.appendChild(pages);
  wrap.appendChild(coverL);
  wrap.appendChild(coverR);
  document.body.appendChild(wrap);

  // Phase 1: Covers hinge open, revealing parchment pages
  animate(coverL, { rotateY: [0, -140], duration: 440, ease: 'inOutCubic' });
  animate(coverR, {
    rotateY: [0, 140],
    duration: 440,
    ease: 'inOutCubic',
    complete: () => {
      // Phase 2: Remove covers, expand parchment to fill viewport
      coverL.remove();
      coverR.remove();
      animate(wrap, {
        scale: [1, scaleNeeded],
        duration: 500,
        ease: 'inCubic',
        complete: () => {
          router.push(`/story/${slug}`);
          setTimeout(() => {
            animate(wrap, {
              opacity: [1, 0],
              duration: 300,
              ease: 'outQuad',
              complete: () => { wrap.remove(); },
            });
          }, 600);
        },
      });
    },
  });
}

function onBookClick(slug: string, hue: number): void {
  const el = bookEls[slug];
  if (!el) return;

  if (isTouchPrimary()) {
    if (tappedBook.value === slug) {
      tappedBook.value = null;
      expandIntoBook(slug, el, hue);
    } else {
      tappedBook.value = slug;      // first tap: pull book out
    }
  } else {
    expandIntoBook(slug, el, hue); // desktop: expand immediately on click
  }
}

function onPageClick(e: MouseEvent): void {
  if (!isTouchPrimary() || !tappedBook.value) return;
  if (!(e.target as HTMLElement).closest('.book')) tappedBook.value = null;
}
</script>

<template>
  <section class="stacks-page" @click="onPageClick">
    <HallScene>

      <!-- ── Loading / empty ─────────────────────────────────────────────── -->
      <div v-if="!shelves.length" class="stacks-status">
        <span class="stacks-status__text">Die Schriften werden geborgen…</span>
      </div>

      <div v-else class="stacks">

        <!-- ── Page header ──────────────────────────────────────────────── -->
        <header ref="hdEl" class="stacks-hd" style="opacity:0">
          <div class="stacks-hd__rules" aria-hidden="true">
            <span class="stacks-hd__rule"></span>
            <span class="stacks-hd__gem" aria-hidden="true"></span>
            <span class="stacks-hd__rule"></span>
          </div>
          <h1 class="stacks-hd__title">Die Schriften</h1>
          <p class="stacks-hd__sub">Alle Werke der Bibliothek von Kaitz</p>
          <div class="stacks-hd__rules" aria-hidden="true">
            <span class="stacks-hd__rule"></span>
            <span class="stacks-hd__gem" aria-hidden="true"></span>
            <span class="stacks-hd__rule"></span>
          </div>
        </header>

        <!-- ── Bookshelves ──────────────────────────────────────────────── -->
        <div
          v-for="(shelf, si) in shelves"
          :key="shelf.seriesId ?? 'standalone'"
          :ref="el => setShelf(el as HTMLElement | null, si)"
          class="shelf"
          style="opacity:0"
        >
          <!-- Shelf label -->
          <div class="shelf__label">
            <span class="shelf__label-rule" aria-hidden="true"></span>
            <div class="shelf__label-inner">
              <span class="shelf__label-gem" aria-hidden="true"></span>
              <h2 class="shelf__label-title">{{ shelf.title }}</h2>
              <span v-if="shelf.type" class="shelf__label-type">{{ shelf.type }}</span>
            </div>
            <span class="shelf__label-rule" aria-hidden="true"></span>
          </div>

          <!-- Synopsis (series only) -->
          <p v-if="shelf.synopsis" class="shelf__synopsis">{{ shelf.synopsis }}</p>

          <!-- Books -->
          <div class="shelf__bay" role="list">
            <a
              v-for="(story, bi) in shelf.stories"
              :key="story.id"
              :ref="(el: any) => { if (el) bookEls[story.slug] = el as HTMLElement }"
              :href="`/story/${story.slug}`"
              class="book"
              :class="[`book--hue${(si * 3 + bi) % 8}`, {
                'is-pulled':  tappedBook === story.slug,
                'is-hovered': hoveredBook === story.slug,
                'is-dimmed':  hoveredBook !== null && hoveredBook !== story.slug,
              }]"
              role="listitem"
              :aria-label="story.title"
              @click.prevent="onBookClick(story.slug, (si * 3 + bi) % 8)"
              @mouseenter="onBookHoverEnter(story.slug)"
              @mouseleave="onBookHoverLeave()"
            >
              <span class="book__spine-edge" aria-hidden="true"></span>
              <span class="book__pages-edge" aria-hidden="true"></span>
              <span class="book__title">{{ story.title }}</span>
              <span class="book__ornament" aria-hidden="true">◆</span>
            </a>
          </div>

          <!-- Wooden shelf plank -->
          <div class="shelf__plank" aria-hidden="true">
            <div class="shelf__plank-face"></div>
            <div class="shelf__plank-edge"></div>
          </div>
        </div>

      </div>

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.stacks-page { min-height: 100vh; }

// ── Status ────────────────────────────────────────────────────────────────────

.stacks-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.stacks-status__text {
  font-family: $font-serif;
  font-style: italic;
  color: rgba($moon-100, 0.62);
  font-size: 1.05rem;
}

// ── Stacks wrapper ────────────────────────────────────────────────────────────

.stacks {
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 1.5rem 6rem;

  @media (min-width: $bp-desktop) {
    padding: 6rem 3rem 7rem;
  }
}

// ── Page header ───────────────────────────────────────────────────────────────

.stacks-hd {
  text-align: center;
  margin-bottom: 4rem;
  will-change: transform, opacity;
}

.stacks-hd__rules {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 0.7rem 0;
}

.stacks-hd__rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to var(--dir, right), transparent, rgba($moon-100, 0.20));

  &:last-child { --dir: left; }
}

.stacks-hd__gem {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba($accent-500, 0.80);
  box-shadow: 0 0 10px rgba($accent-500, 0.50);
}

.stacks-hd__title {
  font-family: $font-serif;
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 3.8rem);
  letter-spacing: 0.16em;
  color: $moon-100;
  margin: 0.3rem 0 0.5rem;
  text-shadow: 0 0 40px rgba($accent-500, 0.28);
}

.stacks-hd__sub {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.88rem;
  letter-spacing: 0.12em;
  color: rgba($moon-100, 0.58);
  margin: 0;
}

// ── Individual shelf section ──────────────────────────────────────────────────

.shelf {
  margin-bottom: 3.6rem;
  will-change: transform, opacity;
}

// ── Shelf label ───────────────────────────────────────────────────────────────

.shelf__label {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.shelf__label-rule {
  flex: 1;
  height: 1px;
  background: rgba($moon-100, 0.12);
}

.shelf__label-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.9rem;
  border: 1px solid rgba($moon-100, 0.10);
  border-radius: 3px 2px 4px 2px / 2px 3px 2px 3px;
  background: rgba($ink-900, 0.60);
  backdrop-filter: blur(4px);
  flex-shrink: 0;
}

.shelf__label-gem {
  width: $sigil-sm;
  height: $sigil-sm;
  border-radius: 999px;
  background: rgba($accent-500, 0.75);
  box-shadow: 0 0 8px rgba($accent-500, 0.40);
  flex-shrink: 0;
}

.shelf__label-title {
  font-family: $font-serif;
  font-size: 0.80rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba($moon-100, 0.78);
  margin: 0;
}

.shelf__label-type {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.78rem;
  color: rgba($moon-100, 0.56);
  letter-spacing: 0.06em;
  border-left: 1px solid rgba($moon-100, 0.15);
  padding-left: 0.6rem;
  margin-left: 0.1rem;
}

.shelf__synopsis {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.85rem;
  color: rgba($moon-100, 0.55);
  text-align: center;
  margin: 0 0 0.9rem;
  letter-spacing: 0.04em;
  line-height: 1.55;
}

// ── Book bay (the row of spines) ──────────────────────────────────────────────

.shelf__bay {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  padding: 0 2px;
  flex-wrap: wrap;
  min-height: 186px;
  perspective: 900px;
}

// ── Book spine card ───────────────────────────────────────────────────────────

.book {
  position: relative;
  width: 88px;
  height: 186px;
  border-radius: 1px 4px 4px 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  transform-origin: center center;
  transition:
    transform 0.44s cubic-bezier(0.22, 0.68, 0.35, 1.02),
    filter  0.44s ease,
    opacity 0.30s ease;
  flex-shrink: 0;

  // Desktop: pull out on hover — JS-driven class prevents flicker from transform
  &.is-hovered {
    transform: translateZ(40px) rotateZ(90deg) scale(1.15);
    z-index: 10;
    filter: brightness(1.06) drop-shadow(0px 30px 36px rgba(0, 0, 0, 0.88));
  }

  // Mobile: pull out on first tap (class driven)
  &.is-pulled {
    transform: translateZ(40px) rotateZ(90deg) scale(1.15);
    z-index: 10;
    filter: brightness(1.06) drop-shadow(0px 30px 36px rgba(0, 0, 0, 0.88));
  }

  @media (max-width: $bp-tablet) {
    width: 74px;
    height: 160px;
  }
}

// Dim sibling books when one is active
.book.is-dimmed {
  opacity: 0.50;
  filter: brightness(0.70);
}

.shelf__bay:has(.is-pulled) .book:not(.is-pulled) {
  opacity: 0.50;
  filter: brightness(0.70);
}

// Spine binding edge (left)
.book__spine-edge {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 5px;
  border-radius: 1px 0 0 1px;
  background: rgba(255, 255, 255, 0.10);
  pointer-events: none;
  z-index: 1;
}

// Page edges (right)
.book__pages-edge {
  position: absolute;
  top: 3px; right: -4px; bottom: 3px;
  width: 4px;
  background: linear-gradient(to left, rgba(220, 208, 176, 0.55), rgba(200, 188, 150, 0.25));
  border-radius: 0 2px 2px 0;
  pointer-events: none;
}

.book__title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: $font-serif;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.70);
  padding: 0.5rem 0.25rem;
  max-height: 156px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.book__ornament {
  font-size: 0.48rem;
  color: rgba(255, 255, 255, 0.28);
  position: relative;
  z-index: 2;
  margin-top: auto;
  padding-bottom: 0.5rem;
}

// ── Spine hue palette ─────────────────────────────────────────────────────────

// Each hue layers three gradients for a realistic leather/cloth spine look:
// 1. Vertical vignette — head & foot of spine darker (aged/shadowed edges)
// 2. Horizontal vignette — left binding shadow + right page-block edge shadow
// 3. Base colour — top-to-bottom tonal shift of the leather/cloth base

.book--hue0 {
  // sienna leather
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #3c1a0c 0%, #7a3820 48%, #3c1a0c 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

.book--hue1 {
  // dark chocolate
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #221208 0%, #4e2c14 48%, #221208 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

.book--hue2 {
  // warm tan
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #5a3010 0%, #9e6030 48%, #5a3010 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

.book--hue3 {
  // golden amber
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #8c6828 0%, #c4963e 48%, #8c6828 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.06);
}

.book--hue4 {
  // raw umber
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #3a2810 0%, #6e5024 48%, #3a2810 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

.book--hue5 {
  // deep sepia
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #2a1c10 0%, #5c3c22 48%, #2a1c10 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

.book--hue6 {
  // oak brown
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #4a2a0c 0%, #846030 48%, #4a2a0c 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

.book--hue7 {
  // espresso
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.36) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.30) 100%),
    linear-gradient(to right,  rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 22%, transparent 50%, rgba(0,0,0,0.12) 78%, rgba(0,0,0,0.38) 100%),
    linear-gradient(to bottom, #1e1008 0%, #3c2410 48%, #1e1008 100%);
  box-shadow: 2px 6px 20px rgba(0,0,0,0.68), inset 0 0 0 1px rgba(255,255,255,0.05);
}

// ── Wooden shelf plank ────────────────────────────────────────────────────────

.shelf__plank {
  margin-top: 1px;
}

.shelf__plank-face {
  height: 14px;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 18px,
      rgba(0, 0, 0, 0.06) 18px,
      rgba(0, 0, 0, 0.06) 19px
    ),
    linear-gradient(to bottom, #5c3612, #43260c, #341c06);
  border-radius: 2px 2px 0 0;
  box-shadow:
    inset 0 1px 0 rgba(255, 195, 90, 0.22),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35);
}

.shelf__plank-edge {
  height: 6px;
  background: linear-gradient(to bottom, #2a1606, #1c0e04);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.72), 0 2px 5px rgba(0, 0, 0, 0.50);
}

// ── Reduced motion ────────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .stacks-hd,
  .shelf {
    opacity: 1 !important;
    transform: none !important;
  }

  .book {
    transition: none;

    &:hover, &.is-pulled, &.is-hovered {
      transform: none;
      filter: none;
    }
  }

  .book.is-dimmed,
  .shelf__bay:has(.is-pulled) .book:not(.is-pulled) {
    opacity: 1;
    filter: none;
  }
}
</style>
