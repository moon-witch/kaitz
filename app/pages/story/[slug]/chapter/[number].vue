<script setup lang="ts">
import { useChapter }       from "~/composables/useChapter";
import { useStory }         from "~/composables/useStory";
import { useStoryChapters } from "~/composables/useStoryChapters";
import { animate }          from "animejs/animation";

const route        = useRoute();
const storySlug    = route.params.slug   as string;
const chapterNum   = Number(route.params.number);

const { data: chapter, pending, error } = await useChapter(storySlug, chapterNum);
const { data: story   }                 = await useStory(storySlug);
const { data: chapters }                = await useStoryChapters(storySlug);

useSeoMeta({
  title: computed(() =>
    chapter.value
      ? `${chapter.value.title} — ${story.value?.title ?? "Geschichte"}`
      : "Kapitel — Library of Kaitz"
  ),
});

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let r = "";
  for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { r += syms[i]; n -= vals[i]; } }
  return r;
}

// Prev / next chapter
const prevChapter = computed(() =>
  chapters.value?.find(c => c.chapter_number === chapterNum - 1) ?? null
);
const nextChapter = computed(() =>
  chapters.value?.find(c => c.chapter_number === chapterNum + 1) ?? null
);

// ── Chapter TOC ──────────────────────────────────────────────────────────────
const tocOpen = ref(true);
const readingMode = ref(false);

const sortedChapters = computed(() =>
  chapters.value
    ? [...chapters.value].sort((a, b) => a.chapter_number - b.chapter_number)
    : []
);

// ── Animation refs ───────────────────────────────────────────────────────────
const scrollEl  = ref<HTMLElement | null>(null);
const numeralEl = ref<HTMLElement | null>(null);
const titleEl   = ref<HTMLElement | null>(null);
const dividerEl = ref<HTMLElement | null>(null);
const bodyEl    = ref<HTMLElement | null>(null);
const footEl    = ref<HTMLElement | null>(null);

onMounted(() => {
  // Collapse TOC by default on mobile
  if (window.innerWidth < 900) {
    tocOpen.value = false;
  }

  // Escape exits reading mode
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') readingMode.value = false;
  };
  window.addEventListener('keydown', handleKey);
  onUnmounted(() => window.removeEventListener('keydown', handleKey));

  if (!scrollEl.value) return;

  animate(scrollEl.value, {
    opacity: [0, 1], translateY: [52, 0], scale: [0.97, 1],
    duration: 780, ease: "outCubic",
  });

  if (numeralEl.value) {
    animate(numeralEl.value, {
      opacity: [0, 1], translateY: [8, 0],
      duration: 420, ease: "outQuad", delay: 360,
    });
  }

  if (titleEl.value) {
    animate(titleEl.value, {
      opacity: [0, 1], translateY: [12, 0],
      duration: 520, ease: "outCubic", delay: 480,
    });
  }

  if (dividerEl.value) {
    animate(dividerEl.value, {
      scaleX: [0, 1], opacity: [0, 1],
      duration: 660, ease: "outCubic", delay: 660,
    });
  }

  if (bodyEl.value) {
    animate(bodyEl.value, {
      opacity: [0, 1], translateY: [10, 0],
      duration: 640, ease: "outCubic", delay: 840,
    });
  }

  if (footEl.value) {
    animate(footEl.value, {
      opacity: [0, 1], translateY: [6, 0],
      duration: 440, ease: "outQuad", delay: 1060,
    });
  }
});
</script>

<template>
  <section class="chapter-page" :class="{ 'chapter-page--reading': readingMode }">
    <div class="reading-veil" aria-hidden="true"></div>
    <HallScene>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="pending" class="chapter-status">
        <span class="chapter-status__text">Das Kapitel wird aufgeschlagen…</span>
      </div>

      <!-- ── Error / Not found ────────────────────────────────────────────── -->
      <div v-else-if="error || !chapter" class="chapter-status">
        <span class="chapter-status__text">Dieses Kapitel konnte nicht gefunden werden.</span>
        <NuxtLink :to="`/story/${storySlug}`" class="chapter-status__back">
          ← Zurück zum Werk
        </NuxtLink>
      </div>

      <!-- ── Chapter view ────────────────────────────────────────────────── -->
      <div v-else class="chapter-outer" :class="{ 'chapter-outer--toc': tocOpen }">

        <!-- ── Left: main reading column ─────────────────────────────────── -->
        <div class="chapter-main">

          <!-- Topbar: back nav + TOC toggle -->
          <div class="chapter-topbar">
            <nav class="chapter-nav">
              <NuxtLink :to="`/story/${storySlug}`" class="chapter-nav__back">
                <span class="chapter-nav__arrow" aria-hidden="true">←</span>
                {{ story?.title ?? "Werk" }}
              </NuxtLink>
            </nav>

            <button
              class="read-toggle"
              :class="{ 'read-toggle--active': readingMode }"
              :aria-pressed="readingMode"
              :aria-label="readingMode ? 'Lesemodus beenden' : 'Lesemodus aktivieren'"
              @click="readingMode = !readingMode"
            >
              <span class="read-toggle__icon" aria-hidden="true">◎</span>
            </button>

            <button
              v-if="sortedChapters.length"
              class="toc-toggle"
              :class="{ 'toc-toggle--active': tocOpen }"
              :aria-expanded="tocOpen"
              aria-controls="chapter-toc"
              @click="tocOpen = !tocOpen"
            >
              <span class="toc-toggle__lines" aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
              <span class="toc-toggle__label">Alle Kapitel</span>
            </button>
          </div>

          <!-- Mobile TOC (above scroll) -->
          <div
            v-if="sortedChapters.length"
            id="chapter-toc"
            class="chapter-toc chapter-toc--mobile"
            :class="{ 'chapter-toc--open': tocOpen }"
            aria-hidden="!tocOpen"
          >
            <div class="toc-panel toc-panel--mobile">
              <ol class="toc-list">
                <li
                  v-for="ch in sortedChapters"
                  :key="ch.chapter_number"
                  class="toc-list__item"
                  :class="{ 'toc-list__item--active': ch.chapter_number === chapterNum }"
                >
                  <NuxtLink
                    :to="`/story/${storySlug}/chapter/${ch.chapter_number}`"
                    class="toc-link"
                    :aria-current="ch.chapter_number === chapterNum ? 'page' : undefined"
                    @click="tocOpen = false"
                  >
                    <span class="toc-link__num">{{ toRoman(ch.chapter_number) }}</span>
                    <span class="toc-link__title">{{ ch.title }}</span>
                    <span v-if="ch.chapter_number === chapterNum" class="toc-link__marker" aria-hidden="true">◆</span>
                  </NuxtLink>
                </li>
              </ol>
            </div>
          </div>

          <!-- Parchment scroll -->
          <article ref="scrollEl" class="chapter-scroll" style="opacity:0">

            <!-- Header -->
            <header class="chapter-scroll__hd">
              <p ref="numeralEl" class="chapter-scroll__numeral" style="opacity:0" :aria-label="`Kapitel ${chapterNum}`">
                Kapitel {{ toRoman(chapterNum) }}
              </p>
              <h1 ref="titleEl" class="chapter-scroll__title" style="opacity:0">
                {{ chapter.title }}
              </h1>
            </header>

            <!-- Ornamental divider -->
            <div ref="dividerEl" class="chapter-scroll__rule" style="opacity:0" aria-hidden="true">
              <span class="rule__line rule__line--l"></span>
              <span class="rule__gem"></span>
              <span class="rule__line rule__line--r"></span>
            </div>

            <!-- Body prose with drop cap -->
            <div
              ref="bodyEl"
              class="chapter-scroll__body prose"
              style="opacity:0"
              v-html="chapter.content"
            />

            <!-- Footer navigation -->
            <footer ref="footEl" class="chapter-scroll__foot" style="opacity:0">
              <div class="foot-rule" aria-hidden="true"></div>
              <div class="foot-inner">
                <!-- Prev chapter -->
                <NuxtLink
                  v-if="prevChapter"
                  :to="`/story/${storySlug}/chapter/${prevChapter.chapter_number}`"
                  class="foot-link foot-link--prev"
                >
                  <span class="foot-link__arrow">←</span>
                  <span class="foot-link__label">
                    <span class="foot-link__meta">Vorheriges Kapitel</span>
                    <span class="foot-link__title">{{ prevChapter.title }}</span>
                  </span>
                </NuxtLink>
                <NuxtLink v-else :to="`/story/${storySlug}`" class="foot-back">
                  ← Zum Werk
                </NuxtLink>

                <!-- Next chapter -->
                <NuxtLink
                  v-if="nextChapter"
                  :to="`/story/${storySlug}/chapter/${nextChapter.chapter_number}`"
                  class="foot-link foot-link--next"
                >
                  <span class="foot-link__label">
                    <span class="foot-link__meta">Nächstes Kapitel</span>
                    <span class="foot-link__title">{{ nextChapter.title }}</span>
                  </span>
                  <span class="foot-link__arrow">→</span>
                </NuxtLink>
                <span v-else class="foot-spacer"></span>
              </div>
            </footer>

          </article>
        </div>

        <!-- ── Right: sticky TOC sidebar (desktop) ───────────────────────── -->
        <aside
          v-if="sortedChapters.length"
          class="chapter-toc chapter-toc--desktop"
          :class="{ 'chapter-toc--open': tocOpen }"
          aria-label="Kapitelübersicht"
        >
          <div class="toc-panel toc-panel--desktop">

            <!-- Panel header -->
            <header class="toc-panel__hd">
              <span class="toc-panel__rune" aria-hidden="true">✦</span>
              <h2 class="toc-panel__title">{{ story?.title ?? "Kapitel" }}</h2>
              <p class="toc-panel__count">{{ sortedChapters.length }} Kapitel</p>
            </header>

            <!-- Divider -->
            <div class="toc-panel__rule" aria-hidden="true">
              <span class="toc-rule__line toc-rule__line--l"></span>
              <span class="toc-rule__gem"></span>
              <span class="toc-rule__line toc-rule__line--r"></span>
            </div>

            <!-- Chapter list -->
            <ol class="toc-list">
              <li
                v-for="ch in sortedChapters"
                :key="ch.chapter_number"
                class="toc-list__item"
                :class="{ 'toc-list__item--active': ch.chapter_number === chapterNum }"
              >
                <NuxtLink
                  :to="`/story/${storySlug}/chapter/${ch.chapter_number}`"
                  class="toc-link"
                  :aria-current="ch.chapter_number === chapterNum ? 'page' : undefined"
                >
                  <span class="toc-link__num">{{ toRoman(ch.chapter_number) }}</span>
                  <span class="toc-link__title">{{ ch.title }}</span>
                  <span v-if="ch.chapter_number === chapterNum" class="toc-link__marker" aria-hidden="true">◆</span>
                </NuxtLink>
              </li>
            </ol>

          </div>
        </aside>

      </div>

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/styles/variables' as *;

// ── Page shell ────────────────────────────────────────────────────────────────

.chapter-page { min-height: 100vh; }

// ── Reading veil ──────────────────────────────────────────────────────────────

.reading-veil {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  z-index: 1;
  transition: background 0.45s ease;

  .chapter-page--reading & {
    background: rgba(0, 0, 0, 0.60);
  }
}

// ── Reading mode overrides ────────────────────────────────────────────────────

.chapter-page--reading {
  .chapter-topbar {
    opacity: 0.12;
    transition: opacity 0.35s ease;
    pointer-events: none;

    &:hover,
    &:focus-within {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .chapter-toc--desktop.chapter-toc--open {
    opacity: 0.18;
    transition: opacity 0.35s ease, width 0.38s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover { opacity: 1; }
  }
}

// ── Status ────────────────────────────────────────────────────────────────────

.chapter-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.chapter-status__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 1.05rem;
  color: rgba($moon-100, 0.65);
}

.chapter-status__back {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.9rem;
  color: rgba($moon-100, 0.68);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color $transition;
  &:hover { color: rgba($accent-500, 0.9); }
}

// ── Outer layout ──────────────────────────────────────────────────────────────

.chapter-outer {
  width: 320px;
  margin: 0 auto;
  padding: 6rem 1rem 6rem;

  @media (min-width: $bp-tablet) {
    width: 600px;
    padding: 6rem 2.4rem 6rem;
  }

  @media (min-width: $bp-desktop) {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    width: min(calc(100vw - 6.4rem), 1140px);
    padding: 6rem 3.2rem 6rem;
  }
}

// ── Main reading column ───────────────────────────────────────────────────────

.chapter-main {
  flex: 1;
  min-width: 0;
}

// ── Topbar: back nav + TOC toggle ─────────────────────────────────────────────

.chapter-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.6rem;
}

// ── Back nav ──────────────────────────────────────────────────────────────────

.chapter-nav { flex: 1; }

.chapter-nav__back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.84rem;
  letter-spacing: 0.10em;
  color: rgba($moon-100, 0.62);
  text-decoration: none;
  transition: color 0.28s ease;
  &:hover { color: rgba($moon-100, 0.88); }
}

.chapter-nav__arrow {
  font-style: normal;
  transition: transform 0.22s ease;
  .chapter-nav__back:hover & { transform: translateX(-3px); }
}

// ── Reading mode toggle ───────────────────────────────────────────────────────

.read-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 0.4rem;
  background: rgba($ink-800, 0.60);
  border: 1px solid rgba($moon-100, 0.12);
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease;

  &:hover {
    background: rgba($ink-800, 0.88);
    border-color: rgba($accent-500, 0.38);
  }

  &--active {
    background: rgba($ink-800, 0.88);
    border-color: rgba($accent-500, 0.55);
    box-shadow: 0 0 10px rgba($accent-500, 0.24);
  }
}

.read-toggle__icon {
  font-size: 0.72rem;
  color: rgba($moon-100, 0.48);
  line-height: 1;
  transition: color 0.24s ease;

  .read-toggle--active & { color: rgba($accent-500, 0.90); }
  .read-toggle:hover & { color: rgba($moon-100, 0.85); }
}

// ── TOC toggle button ─────────────────────────────────────────────────────────

.toc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.52rem;
  background: rgba($ink-800, 0.72);
  border: 1px solid rgba($accent-500, 0.22);
  border-radius: 4px 2px 5px 2px / 2px 5px 2px 4px;
  padding: 0.38rem 0.7rem 0.38rem 0.6rem;
  cursor: pointer;
  transition: border-color 0.24s ease, background 0.24s ease;

  &:hover,
  &--active {
    background: rgba($ink-800, 0.92);
    border-color: rgba($accent-500, 0.44);
  }
}

.toc-toggle__lines {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 14px;

  span {
    display: block;
    height: 1.5px;
    background: rgba($moon-100, 0.62);
    border-radius: 1px;
    transition: background 0.2s ease, width 0.2s ease;
    width: 100%;

    &:nth-child(2) { width: 75%; }

    .toc-toggle--active & {
      background: rgba($accent-500, 0.88);
      &:nth-child(2) { width: 55%; }
    }
  }
}

.toc-toggle__label {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0.10em;
  color: rgba($moon-100, 0.68);
  white-space: nowrap;
  transition: color 0.24s ease;

  .toc-toggle--active & { color: rgba($candle-bright, 0.82); }
  .toc-toggle:hover & { color: rgba($moon-100, 0.88); }
}

// ── Mobile TOC (above scroll, collapsible) ────────────────────────────────────

.chapter-toc--mobile {
  display: block;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.42s cubic-bezier(0.4, 0, 0.2, 1),
              margin-bottom 0.42s ease;
  margin-bottom: 0;

  &.chapter-toc--open {
    max-height: 70vh;
    margin-bottom: 1.4rem;
  }

  @media (min-width: $bp-desktop) {
    display: none;
  }
}

// ── Desktop TOC sidebar ───────────────────────────────────────────────────────

.chapter-toc--desktop {
  display: none;

  @media (min-width: $bp-desktop) {
    display: block;
    position: sticky;
    top: 6rem;
    align-self: flex-start;
    flex-shrink: 0;
    overflow: hidden;
    width: 0;
    transition: width 0.38s cubic-bezier(0.4, 0, 0.2, 1);

    &.chapter-toc--open {
      width: 240px;
    }
  }
}

// ── TOC panel shell ───────────────────────────────────────────────────────────

.toc-panel {
  box-sizing: border-box;
}

.toc-panel--mobile {
  background: linear-gradient(175deg, $ink-900 0%, $ink-950 100%);
  border: 1px solid rgba($accent-500, 0.18);
  border-radius: 3px 5px 4px 3px / 4px 3px 5px 3px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.52),
    inset 0 1px 0 rgba($accent-500, 0.10);
  padding: 1.2rem 1.4rem 1.4rem;
  max-height: calc(70vh - 2rem);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.toc-panel--desktop {
  width: 240px;
  background: linear-gradient(175deg, $ink-900 0%, $ink-950 100%);
  border: 1px solid rgba($accent-500, 0.20);
  border-radius: 3px 5px 4px 3px / 4px 3px 5px 3px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.60),
    0 4px 16px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba($accent-500, 0.12),
    inset 0 0 0 1px rgba($ink-800, 0.40);
  padding: 1.4rem 1.2rem 1.6rem;
  max-height: 80vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

// ── TOC panel header ──────────────────────────────────────────────────────────

.toc-panel__hd {
  text-align: center;
  margin-bottom: 0;
}

.toc-panel__rune {
  display: block;
  font-size: 0.70rem;
  color: rgba($accent-500, 0.55);
  margin-bottom: 0.45rem;
  letter-spacing: 0.3em;
}

.toc-panel__title {
  font-family: $font-serif;
  font-weight: 700;
  font-size: clamp(0.9rem, 2.5vw, 1.05rem);
  letter-spacing: 0.08em;
  color: rgba($moon-100, 0.90);
  margin: 0 0 0.3rem;
  line-height: 1.3;
}

.toc-panel__count {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: rgba($moon-100, 0.40);
  margin: 0;
}

// ── TOC divider ───────────────────────────────────────────────────────────────

.toc-panel__rule {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 1.1rem;
}

.toc-rule__line {
  flex: 1;
  height: 1px;

  &--l { background: linear-gradient(to right, transparent, rgba($accent-500, 0.28)); }
  &--r { background: linear-gradient(to left,  transparent, rgba($accent-500, 0.28)); }
}

.toc-rule__gem {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba($accent-500, 0.55);
  box-shadow: 0 0 6px rgba($accent-500, 0.35);
}

// ── Chapter list ──────────────────────────────────────────────────────────────

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.toc-list__item {
  border-radius: 2px 4px 3px 2px;
  transition: background 0.2s ease;

  &--active {
    background: rgba($accent-500, 0.10);
  }

  &:not(&--active):hover {
    background: rgba($moon-100, 0.05);
  }
}

// ── Chapter link ──────────────────────────────────────────────────────────────

.toc-link {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  padding: 0.48rem 0.7rem;
  text-decoration: none;
  position: relative;

  // Left accent bar for active item
  .toc-list__item--active & {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 20%;
      bottom: 20%;
      width: 2px;
      border-radius: 1px;
      background: linear-gradient(to bottom, transparent, $accent-500, transparent);
    }
  }
}

.toc-link__num {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: rgba($moon-100, 0.38);
  flex-shrink: 0;
  min-width: 1.4rem;
  transition: color 0.2s ease;

  .toc-list__item--active & { color: rgba($accent-500, 0.80); }
  .toc-link:hover & { color: rgba($moon-100, 0.60); }
}

.toc-link__title {
  font-family: $font-serif;
  font-size: 0.84rem;
  line-height: 1.35;
  color: rgba($moon-100, 0.60);
  letter-spacing: 0.03em;
  transition: color 0.2s ease;
  flex: 1;

  .toc-list__item--active & { color: rgba($moon-100, 0.92); }
  .toc-link:hover & { color: rgba($moon-100, 0.82); }
}

.toc-link__marker {
  font-size: 0.46rem;
  color: rgba($accent-500, 0.70);
  flex-shrink: 0;
  align-self: center;
}

// ── Parchment scroll ──────────────────────────────────────────────────────────

.chapter-scroll {
  position: relative;
  box-sizing: border-box;
  will-change: transform, opacity;
  padding: 3.2rem 2.8rem 2.8rem;

  background: linear-gradient(
    165deg,
    #dbbe8a 0%, #cead72 22%, #c09a5c 52%, #b48445 78%, #a87640 100%
  );

  border: 1px solid rgba(90, 52, 10, 0.40);
  border-radius: 6px 3px 7px 4px / 4px 7px 3px 6px;

  box-shadow:
    0 24px 64px rgba(0,0,0,0.70),
    0 6px 20px  rgba(0,0,0,0.40),
    inset 0 2px 0 rgba(255,245,210,0.32),
    inset 0 -1px 0 rgba(60,30,8,0.20),
    inset 2px 0 0 rgba(255,245,210,0.12),
    inset -2px 0 0 rgba(60,30,8,0.10);

  // Paper grain
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    border-radius: inherit;
    background: repeating-linear-gradient(
      180deg,
      transparent 0px, transparent 3px,
      rgba(130,80,22,0.045) 3px, rgba(130,80,22,0.045) 4px
    );
  }

  // Shimmer
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
    background: linear-gradient(
      118deg,
      transparent 18%,
      rgba(255,240,170,0.00) 34%,
      rgba(255,240,170,0.10) 50%,
      rgba(255,240,170,0.00) 66%,
      transparent 82%
    );
  }

  @media (max-width: $bp-tablet) { padding: 2.4rem 1.6rem 2rem; }
}

// ── Header ────────────────────────────────────────────────────────────────────

.chapter-scroll__hd {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 0;
}

.chapter-scroll__numeral {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.82rem;
  color: rgba(55, 28, 8, 0.72);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0 0 0.6rem;
  will-change: transform, opacity;
}

.chapter-scroll__title {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  font-size: clamp(1.55rem, 5vw, 2.4rem);
  letter-spacing: 0.06em;
  line-height: 1.2;
  margin: 0;
  will-change: transform, opacity;
}

// ── Ornamental divider ────────────────────────────────────────────────────────

.chapter-scroll__rule {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 1.5rem 0 1.8rem;
  transform-origin: left center;
  will-change: transform, opacity;
}

.rule__line {
  flex: 1;
  height: 1px;
  &--l { background: linear-gradient(to right, transparent, rgba(90,52,10,0.45)); }
  &--r { background: linear-gradient(to left,  transparent, rgba(90,52,10,0.45)); }
}

.rule__gem {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba(90,52,10,0.55);
  box-shadow: 0 0 6px rgba(90,52,10,0.30);
}

// ── Body prose ────────────────────────────────────────────────────────────────

.chapter-scroll__body {
  position: relative;
  z-index: 2;
  font-family: $font-serif;
  font-size: clamp(1.02rem, 2.4vw, 1.13rem);
  line-height: 1.88;
  color: $ink-text;
  will-change: transform, opacity;

  // Drop cap on first paragraph
  &.prose :deep(p:first-child)::first-letter {
    font-size: 3.8rem;
    font-weight: 700;
    float: left;
    line-height: 0.80;
    margin: 0.12em 0.08em 0 0;
    color: color.adjust($ink-text, $lightness: -8%);
    font-family: $font-serif;
  }

  &.prose {
    :deep(p) {
      margin: 0 0 1.2em;
      &:last-child { margin-bottom: 0; }
    }

    :deep(em)     { font-style: italic; }
    :deep(strong) { font-weight: 700; }

    :deep(h2), :deep(h3) {
      font-family: $font-serif;
      font-weight: 700;
      color: color.adjust($ink-text, $lightness: -5%);
      letter-spacing: 0.05em;
      margin: 1.6em 0 0.5em;
      line-height: 1.25;
    }

    :deep(h2) { font-size: 1.22em; }
    :deep(h3) { font-size: 1.06em; }

    :deep(blockquote) {
      margin: 1.4em 0;
      padding: 0.6em 1.1em;
      border-left: 2px solid rgba(90,52,10,0.35);
      font-style: italic;
      color: rgba(28,8,50,0.72);
    }

    :deep(ul), :deep(ol) {
      padding-left: 1.5em;
      margin: 0.8em 0 1em;
    }

    :deep(li) { margin-bottom: 0.35em; }

    :deep(a) {
      color: rgba(90,30,10,0.82);
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color $transition;
      &:hover { color: rgba(90,30,10,1); }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid rgba(90,52,10,0.25);
      margin: 1.8em 0;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────

.chapter-scroll__foot {
  position: relative;
  z-index: 2;
  margin-top: 2.6rem;
  will-change: transform, opacity;
}

.foot-rule {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(90,52,10,0.32) 20%,
    rgba(90,52,10,0.32) 80%,
    transparent
  );
  margin-bottom: 1.2rem;
}

.foot-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.foot-link {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  transition: opacity 0.24s ease;

  &:hover { opacity: 0.80; }

  &--disabled { pointer-events: none; }
  &--next { text-align: right; }
}

.foot-link__label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.foot-link__meta {
  font-family: $font-serif;
  font-size: 0.76rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(55,28,8,0.62);
}

.foot-link__title {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.86rem;
  color: rgba(55,28,8,0.82);
  letter-spacing: 0.04em;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.foot-link__arrow {
  font-family: $font-serif;
  font-size: 1rem;
  color: rgba(55,28,8,0.68);
  flex-shrink: 0;
}

.foot-back {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.83rem;
  letter-spacing: 0.10em;
  color: rgba(55,28,8,0.70);
  text-decoration: none;
  transition: color 0.26s ease;
  &:hover { color: rgba(55,28,8,0.92); }
}

.foot-spacer { flex: 1; }

// ── Reduced motion ────────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .chapter-scroll,
  .chapter-scroll__numeral,
  .chapter-scroll__title,
  .chapter-scroll__rule,
  .chapter-scroll__body,
  .chapter-scroll__foot {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }

  .chapter-nav__arrow { transition: none; }
  .foot-link { transition: none; }
  .chapter-toc--mobile,
  .chapter-toc--desktop { transition: none; }

  .reading-veil { transition: none; }
  .read-toggle  { transition: none; }
}
</style>
