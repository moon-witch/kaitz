<script setup lang="ts">
import { useDiaryEntry } from "~/composables/useDiaryEntry";
import { animate } from "animejs/animation";

const route = useRoute();
const slug = route.params.slug as string;

const { data: entry, pending, error } = await useDiaryEntry(slug);

useSeoMeta({
  title: computed(() =>
    entry.value ? `${entry.value.title} — Tagebuch` : "Tagebuch — Library of Kaitz"
  ),
});

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Animation refs ──────────────────────────────────────────────────────────
const parchmentEl  = ref<HTMLElement | null>(null);
const eyebrowEl    = ref<HTMLElement | null>(null);
const titleEl      = ref<HTMLElement | null>(null);
const dividerEl    = ref<HTMLElement | null>(null);
const bodyEl       = ref<HTMLElement | null>(null);
const footEl       = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!parchmentEl.value) return;

  // 1. Parchment page rises from the dark
  animate(parchmentEl.value, {
    opacity:    [0, 1],
    translateY: [52, 0],
    scale:      [0.97, 1],
    duration: 780,
    ease: "outCubic",
  });

  // 2. Eyebrow caption
  if (eyebrowEl.value) {
    animate(eyebrowEl.value, {
      opacity:    [0, 1],
      translateY: [6, 0],
      duration: 440,
      ease: "outQuad",
      delay: 360,
    });
  }

  // 3. Title slides in
  if (titleEl.value) {
    animate(titleEl.value, {
      opacity:    [0, 1],
      translateY: [12, 0],
      duration: 540,
      ease: "outCubic",
      delay: 480,
    });
  }

  // 4. Divider draws across
  if (dividerEl.value) {
    animate(dividerEl.value, {
      scaleX:   [0, 1],
      opacity:  [0, 1],
      duration: 680,
      ease: "outCubic",
      delay: 680,
    });
  }

  // 6. Body text drifts in
  if (bodyEl.value) {
    animate(bodyEl.value, {
      opacity:    [0, 1],
      translateY: [10, 0],
      duration: 640,
      ease: "outCubic",
      delay: 860,
    });
  }

  // 7. Footer fades in last
  if (footEl.value) {
    animate(footEl.value, {
      opacity:    [0, 1],
      translateY: [6, 0],
      duration: 440,
      ease: "outQuad",
      delay: 1060,
    });
  }
});
</script>

<template>
  <section class="entry-page">
    <HallScene>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="pending" class="entry-status">
        <span class="entry-status__text">Lade Eintrag…</span>
      </div>

      <!-- ── Error / Not found ────────────────────────────────────────────── -->
      <div v-else-if="error || !entry" class="entry-status">
        <span class="entry-status__text">Dieser Eintrag konnte nicht gefunden werden.</span>
        <NuxtLink to="/diary" class="entry-status__back">← Zurück zum Tagebuch</NuxtLink>
      </div>

      <!-- ── Entry parchment ──────────────────────────────────────────────── -->
      <div v-else class="entry-wrap">

        <!-- Back navigation (outside parchment, above) -->
        <nav class="entry-nav">
          <NuxtLink to="/diary" class="entry-nav__back">
            <span class="entry-nav__arrow" aria-hidden="true">←</span>
            Tagebuch
          </NuxtLink>
        </nav>

        <!-- The parchment itself -->
        <article ref="parchmentEl" class="entry-scroll" style="opacity:0">

          <!-- Header -->
          <header class="entry-scroll__hd">
            <p v-if="entry.date_created" ref="eyebrowEl" class="entry-scroll__eyebrow" style="opacity:0">
              <time>{{ formatDate(entry.date_created) }}</time>
            </p>
            <h1 ref="titleEl" class="entry-scroll__title" style="opacity:0">
              {{ entry.title }}
            </h1>
          </header>
/
          <!-- Ornamental divider -->
          <div ref="dividerEl" class="entry-scroll__rule" style="opacity:0" aria-hidden="true">
            <span class="rule__line rule__line--l"></span>
            <span class="rule__gem"></span>
            <span class="rule__line rule__line--r"></span>
          </div>

          <!-- Body prose -->
          <div
            ref="bodyEl"
            class="entry-scroll__body prose"
            style="opacity:0"
            v-html="entry.content"
          />

          <!-- Footer -->
          <footer ref="footEl" class="entry-scroll__foot" style="opacity:0">
            <div class="foot-rule" aria-hidden="true"></div>
            <div class="foot-inner">
              <NuxtLink to="/diary" class="foot-link">
                <span class="foot-link__arrow">←</span> Alle Einträge
              </NuxtLink>
            </div>
          </footer>

        </article>
      </div>

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
@use 'sass:color';

// ── Page shell ────────────────────────────────────────────────────────────────

.entry-page {
  min-height: 100vh;
}

// ── Status (loading / error) ──────────────────────────────────────────────────

.entry-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.entry-status__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 1.05rem;
  color: rgba($moon-100, 0.45);
}

.entry-status__back {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.9rem;
  color: rgba($moon-100, 0.55);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color $transition;

  &:hover { color: rgba($accent-500, 0.9); }
}

// ── Outer wrapper ─────────────────────────────────────────────────────────────

.entry-wrap {
  width: 90vw;
  margin: 0 auto;
  padding: 6rem 2rem 6rem;

  @media (max-width: $bp-tablet) {
    padding: 5rem 1rem 5rem;
  }

  @media (min-width: $bp-tablet) {
    padding: 6rem 2.4rem 6rem;
  }

  @media (min-width: $bp-desktop) {
    padding: 6rem 3.2rem 6rem;
  }
}

// ── Back navigation ───────────────────────────────────────────────────────────

.entry-nav {
  margin-bottom: 1.6rem;
}

.entry-nav__back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.84rem;
  letter-spacing: 0.10em;
  color: rgba($moon-100, 0.38);
  text-decoration: none;
  transition: color 0.28s ease;

  &:hover {
    color: rgba($moon-100, 0.72);
  }
}

.entry-nav__arrow {
  font-style: normal;
  transition: transform 0.22s ease;

  .entry-nav__back:hover & {
    transform: translateX(-3px);
  }
}

// ── The parchment scroll ──────────────────────────────────────────────────────

.entry-scroll {
  position: relative;
  box-sizing: border-box;
  will-change: transform, opacity;

  background: linear-gradient(
    165deg,
    #dbbe8a 0%,
    #cead72 22%,
    #c09a5c 52%,
    #b48445 78%,
    #a87640 100%
  );

  border: 1px solid rgba(90, 52, 10, 0.40);
  border-radius: 6px 3px 7px 4px / 4px 7px 3px 6px;

  padding: 3rem 2.8rem 2.4rem;

  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.68),
    0 6px 18px  rgba(0, 0, 0, 0.38),
    inset 0 2px 0 rgba(255, 245, 210, 0.32),
    inset 0 -1px 0 rgba(60, 30, 8, 0.20),
    inset 2px 0 0 rgba(255, 245, 210, 0.12),
    inset -2px 0 0 rgba(60, 30, 8, 0.10);

  // Paper grain lines
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    border-radius: inherit;
    background: repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 3px,
      rgba(130, 80, 22, 0.045) 3px,
      rgba(130, 80, 22, 0.045) 4px
    );
  }

  // Wax-seal-like shimmer
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
      rgba(255, 240, 170, 0.00) 34%,
      rgba(255, 240, 170, 0.10) 50%,
      rgba(255, 240, 170, 0.00) 66%,
      transparent 82%
    );
  }

  @media (max-width: $bp-tablet) {
    padding: 2.4rem 1.6rem 2rem;
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

.entry-scroll__hd {
  position: relative;
  z-index: 2;
  margin-bottom: 0;
  text-align: center;
}

.entry-scroll__eyebrow {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.82rem;
  color: rgba(55, 28, 8, 0.62);
  letter-spacing: 0.12em;
  margin: 0 0 0.65rem;
  will-change: transform, opacity;
}

.entry-scroll__title {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  font-size: clamp(1.55rem, 5vw, 2.2rem);
  letter-spacing: 0.06em;
  line-height: 1.2;
  margin: 0;
  will-change: transform, opacity;
}

// ── Ornamental divider ────────────────────────────────────────────────────────

.entry-scroll__rule {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin: 1.5rem 0 1.6rem;
  transform-origin: left center;
  will-change: transform, opacity;
}

.rule__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(90, 52, 10, 0.45) 30%,
    rgba(90, 52, 10, 0.45) 70%,
    transparent
  );

  &--l {
    background: linear-gradient(
      to right,
      transparent,
      rgba(90, 52, 10, 0.45)
    );
  }

  &--r {
    background: linear-gradient(
      to left,
      transparent,
      rgba(90, 52, 10, 0.45)
    );
  }
}

.rule__gem {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: rgba(90, 52, 10, 0.55);
  box-shadow: 0 0 6px rgba(90, 52, 10, 0.30);
  flex-shrink: 0;
}

// ── Body prose ────────────────────────────────────────────────────────────────

.entry-scroll__body {
  position: relative;
  z-index: 2;
  font-family: $font-serif;
  font-size: clamp(0.97rem, 2.2vw, 1.06rem);
  line-height: 1.82;
  color: $ink-text;
  will-change: transform, opacity;

  &.prose {
    :deep(p) {
      margin: 0 0 1.1em;

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
      border-left: 2px solid rgba(90, 52, 10, 0.35);
      font-style: italic;
      color: rgba(28, 8, 50, 0.72);
    }

    :deep(ul), :deep(ol) {
      padding-left: 1.5em;
      margin: 0.8em 0 1em;
    }

    :deep(li) { margin-bottom: 0.35em; }

    :deep(a) {
      color: rgba(90, 30, 10, 0.82);
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color $transition;

      &:hover { color: rgba(90, 30, 10, 1); }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid rgba(90, 52, 10, 0.25);
      margin: 1.8em 0;
    }
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────

.entry-scroll__foot {
  position: relative;
  z-index: 2;
  margin-top: 2.4rem;
  will-change: transform, opacity;
}

.foot-rule {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(90, 52, 10, 0.32) 20%,
    rgba(90, 52, 10, 0.32) 80%,
    transparent
  );
  margin-bottom: 1.1rem;
}

.foot-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.foot-link {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.83rem;
  letter-spacing: 0.10em;
  color: rgba(55, 28, 8, 0.55);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.26s ease;

  &:hover {
    color: rgba(55, 28, 8, 0.9);
  }
}

.foot-link__arrow {
  font-style: normal;
  transition: transform 0.22s ease;

  .foot-link:hover & {
    transform: translateX(-3px);
  }
}


// ── Reduced motion ────────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .entry-scroll,
  .entry-scroll__seal,
  .entry-scroll__eyebrow,
  .entry-scroll__title,
  .entry-scroll__rule,
  .entry-scroll__body,
  .entry-scroll__foot {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }
}

:deep(img) {
  max-width: 250px;
  height: auto;

  @media (min-width: $bp-tablet) {
    max-width: 500px;
  }

  @media (min-width: $bp-desktop) {
    max-width: 900px;
  }
}
</style>
