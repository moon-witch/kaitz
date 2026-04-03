<script setup lang="ts">
import { useDiary } from "~/composables/useDiary";
import { animate } from "animejs/animation";

useSeoMeta({ title: "Tagebuch — Library of Kaitz" });

const { data: entries, pending } = await useDiary();

type Mode = "artisan" | "structured";
const mode = ref<Mode>("artisan");

// ─────────────────────────────────────────────────────────────────────
//  ARTISAN MODE
// ─────────────────────────────────────────────────────────────────────
const activeSlug  = ref("");
const isAnimating = ref(false);
const cardEls: Record<string, HTMLElement> = {};

interface Pos { x: number; y: number; rotate: number }
const scatter = ref<Record<string, Pos>>({});

const CARD_W  = 190;
const CARD_H  = 68;
const EXP_MAX = 580;

const stageHeight = ref(0);
const stageEl = ref<HTMLElement | null>(null);

function vw() { return document.documentElement.clientWidth; }
function vh() { return document.documentElement.clientHeight; }
function expW() { return Math.min(EXP_MAX, vw() - (vw() < 600 ? 96 : 32)); }

// Viewport-space center for the expanded card (used while card is position:fixed)
function centerPosViewport(): { x: number; y: number } {
  const W = vw(), H = vh();
  return {
    x: (W - expW()) / 2,
    y: W < 600 ? 150 : Math.max(200, (H - 520) / 2),
  };
}

// Absolute-space center — scrollTop offset included, used for pushOutOfCenter at init
function centerPos(): Pos {
  const sTop = stageEl.value?.scrollTop ?? 0;
  const { x, y } = centerPosViewport();
  return { x, y: y + sTop, rotate: 0 };
}

function pushOutOfCenter(x: number, y: number): { x: number; y: number } {
  const W  = vw();
  const eW = expW();
  const cp = centerPos();
  const buf = 30;
  const zL = cp.x - buf;
  const zR = cp.x + eW + buf;
  const zT = cp.y - buf;
  const zB = cp.y + 420;

  const overlapH = x + CARD_W > zL && x < zR;
  const overlapV = y + 70 > zT && y < zB;
  if (overlapH && overlapV) {
    const roomLeft  = zL - CARD_W - 16;
    const roomRight = W - CARD_W - 16 - zR;
    if (roomLeft >= roomRight) {
      return { x: Math.max(16, zL - CARD_W - 10), y };
    } else {
      return { x: Math.min(W - CARD_W - 16, zR + 10), y };
    }
  }
  return { x, y };
}

function separateCards(res: Record<string, Pos>, slugs: string[], stageH: number): void {
  const W = vw();
  const pX = 16, xMax = W - CARD_W - 16;
  const yMin = W < 600 ? 400 : 200, yMax = stageH - 90;
  const areaLimit = CARD_W * CARD_H * 0.10;

  for (let iter = 0; iter < 40; iter++) {
    let dirty = false;
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        const pi = res[slugs[i]];
        const pj = res[slugs[j]];

        const ox = Math.min(pi.x + CARD_W, pj.x + CARD_W) - Math.max(pi.x, pj.x);
        const oy = Math.min(pi.y + CARD_H, pj.y + CARD_H) - Math.max(pi.y, pj.y);

        if (ox <= 0 || oy <= 0 || ox * oy <= areaLimit) continue;

        dirty = true;
        const reduceX = ox - areaLimit / oy;
        const reduceY = oy - areaLimit / ox;
        const half = 0.5;

        if (reduceX <= reduceY) {
          const push = reduceX * half + 1;
          if (pj.x >= pi.x) { pi.x -= push; pj.x += push; }
          else               { pi.x += push; pj.x -= push; }
        } else {
          const push = reduceY * half + 1;
          if (pj.y >= pi.y) { pi.y -= push; pj.y += push; }
          else               { pi.y += push; pj.y -= push; }
        }

        pi.x = Math.max(pX, Math.min(xMax, pi.x));
        pi.y = Math.max(yMin, Math.min(yMax, pi.y));
        pj.x = Math.max(pX, Math.min(xMax, pj.x));
        pj.y = Math.max(yMin, Math.min(yMax, pj.y));
      }
    }
    if (!dirty) break;
  }
}

function computeScatter() {
  if (!entries.value?.length) return;
  const W = vw(), H = vh(), n = entries.value.length;
  const cols = Math.max(2, Math.ceil(Math.sqrt(n * W / H)));
  const pX = 16;
  const yMin = W < 600 ? 400 : 200;
  const xMax = W - CARD_W - 16;

  // Expand stage so every row has at least 120px of vertical breathing room
  const nRows = Math.ceil(n / cols);
  const minCellH = 120;
  const requiredH = yMin + nRows * minCellH + 100;
  const stageH = Math.max(H, requiredH);
  stageHeight.value = stageH;

  const yMax = stageH - 90;
  const totalCols = Math.max(1, cols - 1);
  const totalRows = Math.max(1, nRows - 1 || 1);
  const cW = (xMax - pX) / totalCols;
  const cH = (yMax - yMin) / totalRows;

  const res: Record<string, Pos> = {};
  entries.value.forEach((e, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jX  = Math.sin(i * 2.399) * cW * 0.22;
    const jY  = Math.cos(i * 1.618) * cH * 0.22;
    let x = Math.max(pX, Math.min(xMax, pX + col * cW + jX));
    let y = Math.max(yMin, Math.min(yMax, yMin + row * cH + jY));
    ({ x, y } = pushOutOfCenter(x, y));
    res[e.slug] = { x, y, rotate: Math.sin(i * 1.309) * 11 };
  });

  const slugs = entries.value.map(e => e.slug);
  separateCards(res, slugs, stageH);
  scatter.value = res;
}

function setT(
  el: HTMLElement,
  x: number, y: number, r: number, w: number,
  skX = 0, skY = 0, sx = 1, sy = 1,
) {
  el.style.transform = [
    `translate(${x}px, ${y}px)`,
    `rotate(${r}deg)`,
    skX || skY ? `skewX(${skX}deg) skewY(${skY}deg)` : "",
    sx !== 1 || sy !== 1 ? `scaleX(${sx}) scaleY(${sy})` : "",
  ].filter(Boolean).join(" ");
  el.style.width = `${w}px`;
}

function flyToCenter(slug: string): Promise<void> {
  return new Promise(resolve => {
    const el   = cardEls[slug];
    const from = scatter.value[slug];
    if (!el || !from) { resolve(); return; }

    const cp  = centerPosViewport();
    const toW = expW();
    const scrollTop = stageEl.value?.scrollTop ?? 0;

    // Convert absolute scatter coords → viewport coords, then switch to fixed
    const s = { x: from.x, y: from.y - scrollTop, r: from.rotate, w: CARD_W };
    el.style.position = 'fixed';
    el.style.zIndex   = "8";
    setT(el, s.x, s.y, s.r, s.w); // snap to viewport position before animating

    animate(s, {
      x: cp.x, y: cp.y, r: 0, w: toW,
      duration: 580,
      ease: "outCubic",
      onUpdate: () => setT(el, s.x, s.y, s.r, s.w),
      complete: resolve,
    });
  });
}

function flyBack(slug: string): Promise<void> {
  return new Promise(resolve => {
    const el = cardEls[slug];
    const to = scatter.value[slug];
    if (!el || !to) { resolve(); return; }

    const scrollTop = stageEl.value?.scrollTop ?? 0;
    const cp        = centerPosViewport();

    // Convert the current fixed (viewport) position to absolute (stage-content) coords
    // before the animation starts so the entire flight stays in absolute space —
    // no position switch mid-animation or at completion, which caused a one-frame snap.
    const startAbsY = cp.y + scrollTop;
    el.style.position = '';
    el.style.zIndex   = "3";
    setT(el, cp.x, startAbsY, 0, expW());

    const s = { x: cp.x, y: startAbsY, r: 0, w: expW(), p: 0 };

    animate(s, {
      x: to.x, y: to.y, r: to.rotate, w: CARD_W, p: 1,
      duration: 600,
      ease: "inOutCubic",
      onUpdate: () => {
        const peak = Math.sin(s.p * Math.PI);
        setT(el, s.x, s.y, s.r, s.w, peak * 20, peak * -7, 1, 1 - peak * 0.32);
      },
      complete: () => {
        setT(el, to.x, to.y, to.rotate, CARD_W);
        el.style.zIndex = "1";
        resolve();
      },
    });
  });
}

async function activateEntry(slug: string) {
  if (isAnimating.value || slug === activeSlug.value) return;
  isAnimating.value = true;
  const prev = activeSlug.value;
  activeSlug.value = slug;
  await (prev
    ? Promise.all([flyBack(prev), flyToCenter(slug)])
    : flyToCenter(slug)
  );
  isAnimating.value = false;
}

function initArtisan() {
  computeScatter();
  nextTick(() => {
    for (const e of entries.value ?? []) {
      const el  = cardEls[e.slug];
      const pos = scatter.value[e.slug];
      if (el && pos) setT(el, pos.x, pos.y, pos.rotate, CARD_W);
    }
    const first = entries.value?.[0]?.slug;
    if (first) activateEntry(first);
  });
}

// ─────────────────────────────────────────────────────────────────────
//  RESIZE HANDLING
// ─────────────────────────────────────────────────────────────────────
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

function onResize() {
  if (mode.value !== "artisan" || isAnimating.value) return;
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    computeScatter();
    nextTick(() => {
      for (const e of entries.value ?? []) {
        const el  = cardEls[e.slug];
        const pos = scatter.value[e.slug];
        if (!el || !pos) continue;
        if (e.slug === activeSlug.value) continue; // active handled below
        setT(el, pos.x, pos.y, pos.rotate, CARD_W);
      }
      if (activeSlug.value) {
        const el = cardEls[activeSlug.value];
        if (el) {
          const cp  = centerPosViewport();
          const toW = expW();
          el.style.position = "fixed";
          setT(el, cp.x, cp.y, 0, toW);
        }
      }
    });
  }, 80);
}

// ─────────────────────────────────────────────────────────────────────
//  STRUCTURED MODE
// ─────────────────────────────────────────────────────────────────────
const structuredActive = ref("");
watch(entries, v => {
  if (v?.length && !structuredActive.value) structuredActive.value = v[0].slug;
}, { immediate: true });

// ─────────────────────────────────────────────────────────────────────
//  SHARED
// ─────────────────────────────────────────────────────────────────────
function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const showScrollTop = ref(false);

function onStageScroll() {
  showScrollTop.value = (stageEl.value?.scrollTop ?? 0) > 300;
}

function scrollToTop() {
  stageEl.value?.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  if (mode.value === "artisan") nextTick(initArtisan);
  window.addEventListener("resize", onResize, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  if (resizeTimer) clearTimeout(resizeTimer);
});

watch(mode, val => {
  activeSlug.value = "";
  if (val === "artisan") nextTick(initArtisan);
});
</script>

<template>
  <section class="diary-page" :class="{ 'diary-page--artisan': mode === 'artisan' }">
    <HallScene>

      <!-- ── Shared floating header ─────────────────────────────────── -->
      <div class="artisan-head" aria-label="Tagebuch">
        <p class="artisan-head__eyebrow">Archiv des Schreibens</p>
        <h1 class="artisan-head__title">Tagebuch</h1>
        <button class="mode-btn" @click="mode = mode === 'artisan' ? 'structured' : 'artisan'">
          <span class="mode-btn__icon" aria-hidden="true">{{ mode === 'artisan' ? '⊞' : '✦' }}</span>
          {{ mode === 'artisan' ? 'Geordnet' : 'Artisan' }}
        </button>
      </div>

      <!-- ── ARTISAN MODE ───────────────────────────────────────────── -->
      <template v-if="mode === 'artisan'">

        <div v-if="pending" class="artisan-status">Lade Einträge…</div>
        <p v-else-if="!entries?.length" class="artisan-status">Noch keine Einträge vorhanden.</p>

        <!-- Scattered cards stage: fixed viewport overlay, internally scrollable -->
        <div v-else ref="stageEl" class="artisan-stage" @scroll.passive="onStageScroll">
          <div class="artisan-stage__inner" :style="{ height: stageHeight + 'px' }">
          <div
            v-for="entry in entries"
            :key="entry.slug"
            :ref="(el: any) => { if (el) cardEls[entry.slug] = el as HTMLElement }"
            class="artisan-card"
            :class="{ 'is-active': entry.slug === activeSlug }"
            @click="activateEntry(entry.slug)"
          >
            <div class="artisan-card__hd">
              <time class="artisan-card__date">{{ formatDate(entry.date_created) }}</time>
              <h2 class="artisan-card__title">{{ entry.title }}</h2>
            </div>
            <div class="artisan-card__body-wrap">
              <div class="artisan-card__body-inner">
                <div class="artisan-card__divider" aria-hidden="true"></div>
                <div class="artisan-card__body prose" v-html="entry.content" />
                <footer class="artisan-card__foot">
                  <NuxtLink
                    :to="`/diary/${entry.slug}`"
                    class="artisan-card__link"
                    @click.stop
                  >Vollständig lesen</NuxtLink>
                </footer>
              </div>
            </div>
          </div>
          </div>
        </div>

      </template>

      <!-- ── STRUCTURED MODE ──────────────────────────────────────────── -->
      <template v-else>
        <div class="diary-page__inner">
          <div v-if="pending" class="diary-page__status">Lade Einträge…</div>

          <div v-else-if="entries?.length" class="tome">
            <div
              v-for="entry in entries"
              :key="entry.slug"
              class="tome__entry"
              :class="{ 'is-active': entry.slug === structuredActive }"
              @click="structuredActive = entry.slug"
            >
              <div class="tome__hd">
                <time class="tome__date">{{ formatDate(entry.date_created) }}</time>
                <h2 class="tome__title">{{ entry.title }}</h2>
              </div>
              <div class="tome__body-wrap">
                <div class="tome__body-inner">
                  <div class="tome__divider" aria-hidden="true"></div>
                  <div class="tome__body prose" v-html="entry.content" />
                  <footer class="tome__foot">
                    <NuxtLink
                      :to="`/diary/${entry.slug}`"
                      class="tome__read-link"
                      @click.stop
                    >Vollständig lesen</NuxtLink>
                  </footer>
                </div>
              </div>
            </div>
          </div>

          <p v-else class="diary-page__status">Noch keine Einträge vorhanden.</p>
        </div>
      </template>

    </HallScene>

    <Transition name="scrolltop">
      <button
        v-if="mode === 'artisan' && showScrollTop"
        class="diary-scrolltop"
        aria-label="Zurück nach oben"
        @click="scrollToTop"
      >
        <span class="diary-scrolltop__arrow" aria-hidden="true"></span>
      </button>
    </Transition>
  </section>
</template>

<style scoped lang="scss">

// ── Page shell ────────────────────────────────────────────────────────────────

.diary-page {
  min-height: 100vh;

  &--artisan {
    min-height: 0; // all artisan content is position:fixed — section needs no height
    overflow: hidden;
  }
}

// ── Mode toggle button ────────────────────────────────────────────────────────

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  margin-top: 0.9rem;
  padding: 0.28rem 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba($moon-100, 0.18);
  border-radius: 2px 3px 2px 3px / 3px 2px 3px 2px;
  color: rgba($moon-100, 0.42);
  font-family: $font-serif;
  font-size: 0.70rem;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;

  &:hover {
    color: rgba($moon-100, 0.75);
    border-color: rgba($moon-100, 0.38);
    background: rgba(255, 255, 255, 0.07);
  }

}

.mode-btn__icon {
  font-style: normal;
  opacity: 0.7;
}

// ── Artisan floating header ───────────────────────────────────────────────────

.artisan-head {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 6;
  text-align: center;
  padding: 1.6rem 1.5rem 1.2rem;
  pointer-events: none;

  // Fade the background beneath the header
  background: linear-gradient(
    to bottom,
    rgba($ink-950, 0.72) 0%,
    rgba($ink-950, 0.0) 100%
  );

  .mode-btn { pointer-events: auto; }
}

.artisan-head__eyebrow {
  font-family: $font-serif;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba($moon-100, 0.55);
  font-style: italic;
  margin: 0 0 0.4rem;
}

.artisan-head__title {
  font-family: $font-serif;
  font-size: clamp(1.75rem, 5vw, 2.9rem);
  color: $moon-100;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0;
  @include inscription-glow(5s, 0s);
}

.artisan-status {
  position: fixed;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-serif;
  color: rgba($moon-100, 0.65);
  font-style: italic;
  pointer-events: none;
}

// ── Artisan stage ─────────────────────────────────────────────────────────────

.artisan-stage {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 5rem; // leave footer visible below the notes area
  z-index: 5;
  overflow-y: scroll;
  overscroll-behavior: contain; // prevent stage scroll from propagating to window
  pointer-events: auto; // receives scroll events; cards also interactive
  scrollbar-width: none; // Firefox

  &::-webkit-scrollbar { display: none; } // Chrome/Safari
}

.artisan-stage__inner {
  position: relative;
  width: 100%;
  pointer-events: none; // cards opt back in
}

// ── Artisan card ──────────────────────────────────────────────────────────────

.artisan-card {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  width: 190px; // overridden by JS
  box-sizing: border-box;
  cursor: pointer;

  background: linear-gradient(
    158deg,
    #d4b483 0%,
    #c9a870 30%,
    #bb9558 65%,
    #a87840 100%
  );
  border: 1px solid rgba(100, 62, 18, 0.38);
  border-radius: 4px 2px 5px 2px / 2px 4px 2px 5px;
  padding: 0.62rem 0.85rem;

  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.42),
    0 1px 2px  rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 240, 200, 0.18);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 3px,
      rgba(140, 90, 30, 0.05) 3px,
      rgba(140, 90, 30, 0.05) 4px
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background: linear-gradient(
      112deg,
      transparent 20%,
      rgba(255, 235, 160, 0.00) 36%,
      rgba(255, 235, 160, 0.09) 50%,
      rgba(255, 235, 160, 0.00) 64%,
      transparent 80%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  transition: box-shadow 0.35s ease;

  &:hover:not(.is-active) {
    box-shadow:
      0 5px 16px rgba(0, 0, 0, 0.50),
      0 1px 3px  rgba(0, 0, 0, 0.26);
  }

  &.is-active {
    cursor: default;
    box-shadow:
      inset 0 0 50px rgba(60, 30, 8, 0.28),
      inset 0 2px 0   rgba(255, 248, 220, 0.40),
      0 12px 40px     rgba(0, 0, 0, 0.60),
      0 3px 8px       rgba(0, 0, 0, 0.32);

    &::after { opacity: 1; }
  }
}

// ── Artisan card: header ──────────────────────────────────────────────────────

.artisan-card__hd {
  position: relative;
  z-index: 2;
}

.artisan-card__date {
  display: block;
  font-family: $font-serif;
  font-size: 0.80rem;
  color: rgba(55, 28, 8, 0.70);
  letter-spacing: 0.10em;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .is-active & { color: rgba(55, 28, 8, 0.9); margin-bottom: 0.2rem; }
}

.artisan-card__title {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  margin: 0.12rem 0 0;
  line-height: 1.2;
  font-size: 0.86rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: font-size 0.4s ease;

  .is-active & {
    font-size: clamp(1.1rem, 2.6vw, 1.42rem);
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }
}

// ── Artisan card: expandable body ─────────────────────────────────────────────

.artisan-card__body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.44s cubic-bezier(0.4, 0, 0.2, 1);

  .is-active & { grid-template-rows: 1fr; }
}

.artisan-card__body-inner {
  overflow: hidden;
  min-height: 0;
}

.artisan-card__divider {
  height: 1px;
  background: rgba(100, 62, 18, 0.28);
  margin: 0.72rem 0 0.85rem;
}

.artisan-card__body {
  font-family: $font-serif;
  font-size: 0.91rem;
  line-height: 1.62;
  color: $ink-text;
  position: relative;
  z-index: 2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;

  &.prose {
    :deep(p)     { margin: 0; display: inline; }
    :deep(p + p) { &::before { content: ' '; } }
    :deep(em)    { font-style: italic; }
    :deep(strong){ font-weight: 700; }
    :deep(h3)    { display: inline; font-size: 1em; }
  }
}

.artisan-card__foot {
  margin-top: 0.85rem;
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
}

.artisan-card__link {
  font-family: $font-serif;
  font-size: 0.78rem;
  letter-spacing: 0.10em;
  font-style: italic;
  color: $ink-text;
  text-decoration: none;
  transition: color $transition;

  &::after { content: ' →'; font-style: normal; }
  &:hover  { color: rgba($accent-500, 0.85); }
}

// ── Structured mode: page shell ───────────────────────────────────────────────

.diary-page__inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 10rem 1.5rem 8rem;

  @media (max-width: $bp-tablet) {
    padding: 9rem 1rem 6rem;
  }
}

.diary-page__status {
  text-align: center;
  font-family: $font-serif;
  color: rgba($moon-100, 0.45);
  font-style: italic;
  padding: 3rem 0;
}

// ── Tome (structured mode) ────────────────────────────────────────────────────

.tome {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tome__entry {
  position: relative;
  cursor: pointer;
  overflow: hidden;

  background: linear-gradient(
    158deg,
    #d4b483 0%,
    #c9a870 30%,
    #bb9558 65%,
    #a87840 100%
  );
  border: 1px solid rgba(100, 62, 18, 0.40);
  border-radius: 4px 2px 5px 2px / 2px 4px 2px 5px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 3px,
      rgba(140, 90, 30, 0.05) 3px,
      rgba(140, 90, 30, 0.05) 4px
    );
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background: linear-gradient(
      108deg,
      transparent 20%,
      rgba(255, 235, 160, 0.00) 34%,
      rgba(255, 235, 160, 0.07) 50%,
      rgba(255, 235, 160, 0.00) 66%,
      transparent 80%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  & + & { margin-top: 5px; }

  padding: 0.72rem 1.15rem;
  box-shadow:
    0 2px 8px  rgba(0, 0, 0, 0.38),
    0 1px 2px  rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 240, 200, 0.18);
  filter: brightness(0.88) saturate(0.9);
  transition: padding 0.45s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.45s ease, filter 0.45s ease;

  &:hover:not(.is-active) {
    filter: brightness(0.95) saturate(0.95);
    box-shadow:
      0 4px 14px rgba(0, 0, 0, 0.44),
      0 1px 3px  rgba(0, 0, 0, 0.26),
      inset 0 1px 0 rgba(255, 240, 200, 0.22);
  }

  &.is-active {
    cursor: default;
    padding: 1.15rem 1.15rem 1.2rem;
    filter: brightness(1) saturate(1);
    box-shadow:
      inset 0 0 45px rgba(60, 30, 8, 0.28),
      inset 0 2px 0   rgba(255, 248, 220, 0.38),
      0 10px 36px     rgba(0, 0, 0, 0.55),
      0 2px 6px       rgba(0, 0, 0, 0.30);

    &::after { opacity: 1; }
  }
}

.tome__hd {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: baseline;
  gap: 0.9rem;

  .is-active & { flex-direction: column; gap: 0.35rem; }
}

.tome__date {
  font-family: $font-serif;
  font-size: 0.80rem;
  color: rgba(55, 28, 8, 0.70);
  letter-spacing: 0.1em;
  font-style: italic;
  white-space: nowrap;
  flex-shrink: 0;
  transition: font-size 0.45s ease, color 0.45s ease;

  .is-active & { font-size: 0.78rem; color: rgba(55, 28, 8, 0.58); }
}

.tome__title {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  margin: 0;
  line-height: 1.2;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: font-size 0.45s ease;

  .is-active & {
    font-size: clamp(1.2rem, 3vw, 1.55rem);
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }
}

.tome__body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.4, 0, 0.2, 1);

  .is-active & { grid-template-rows: 1fr; }
}

.tome__body-inner {
  overflow: hidden;
  min-height: 0;
}

.tome__divider {
  height: 1px;
  background: rgba(100, 62, 18, 0.28);
  margin: 0.85rem 0 1rem;
}

.tome__body {
  font-family: $font-serif;
  font-size: 0.97rem;
  line-height: 1.62;
  color: $ink-text;
  position: relative;
  z-index: 2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;

  &.prose {
    :deep(p)     { margin: 0; display: inline; }
    :deep(p + p) { &::before { content: ' '; } }
    :deep(em)    { font-style: italic; }
    :deep(strong){ font-weight: 700; }
    :deep(h3)    { display: inline; font-size: 1em; }
  }
}

.tome__foot {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
}

.tome__read-link {
  font-family: $font-serif;
  font-size: 0.79rem;
  letter-spacing: 0.1em;
  font-style: italic;
  color: rgba(55, 28, 8, 0.6);
  text-decoration: none;
  transition: color $transition;

  &::after { content: ' →'; font-style: normal; }
  &:hover  { color: rgba($accent-500, 0.85); }
}

// ── Scroll-to-top (artisan mode) ──────────────────────────────────────────────

.diary-scrolltop {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 20;

  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba($accent-500, 0.30);
  background: rgba($ink-800, 0.82);
  backdrop-filter: blur(6px);
  cursor: pointer;
  padding: 0;

  display: grid;
  place-items: center;

  box-shadow:
    0 0 14px rgba($accent-500, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.55);

  transition:
    background  220ms ease,
    box-shadow  220ms ease,
    border-color 220ms ease;

  &:hover {
    background: rgba($ink-800, 0.95);
    border-color: rgba($accent-500, 0.60);
    box-shadow:
      0 0 22px rgba($accent-500, 0.35),
      0 4px 20px rgba(0, 0, 0, 0.60);
  }
}

.diary-scrolltop__arrow {
  display: block;
  width: 9px;
  height: 9px;
  border-top:   1.5px solid rgba($moon-100, 0.80);
  border-right: 1.5px solid rgba($moon-100, 0.80);
  transform: translateY(2px) rotate(-45deg);
}

.scrolltop-enter-active,
.scrolltop-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}
.scrolltop-enter-from,
.scrolltop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

// ── Reduced motion ────────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .artisan-card__body-wrap,
  .artisan-card__title,
  .tome__entry,
  .tome__body-wrap,
  .tome__title,
  .tome__date {
    transition: none;
  }
}

</style>
