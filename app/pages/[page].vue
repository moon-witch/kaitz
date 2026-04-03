<script setup lang="ts">
import { usePage } from "~/composables/usePage";
import { animate } from "animejs/animation";

const route = useRoute();
const key = route.params.page as string;

const { data: page, pending, error } = await usePage(key);

useSeoMeta({
  title: computed(() =>
    page.value ? `${page.value.title} — Library of Kaitz` : "Library of Kaitz"
  ),
});

// ── Animation refs ───────────────────────────────────────────────────────────
const scrollEl   = ref<HTMLElement | null>(null);
const titleEl    = ref<HTMLElement | null>(null);
const dividerEl  = ref<HTMLElement | null>(null);
const bodyEl     = ref<HTMLElement | null>(null);
const footEl     = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!scrollEl.value) return;

  animate(scrollEl.value, {
    opacity:    [0, 1],
    translateY: [48, 0],
    scale:      [0.97, 1],
    duration: 780,
    ease: "outCubic",
  });

  if (titleEl.value) {
    animate(titleEl.value, {
      opacity:    [0, 1],
      translateY: [12, 0],
      duration: 520,
      ease: "outCubic",
      delay: 480,
    });
  }

  if (dividerEl.value) {
    animate(dividerEl.value, {
      scaleX:  [0, 1],
      opacity: [0, 1],
      duration: 660,
      ease: "outCubic",
      delay: 660,
    });
  }

  if (bodyEl.value) {
    animate(bodyEl.value, {
      opacity:    [0, 1],
      translateY: [10, 0],
      duration: 620,
      ease: "outCubic",
      delay: 840,
    });
  }

  if (footEl.value) {
    animate(footEl.value, {
      opacity:    [0, 1],
      translateY: [6, 0],
      duration: 420,
      ease: "outQuad",
      delay: 1040,
    });
  }
});
</script>

<template>
  <section class="static-page">
    <HallScene>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="pending" class="static-status">
        <span class="static-status__text">Seite wird geladen…</span>
      </div>

      <!-- ── Error / Not found ────────────────────────────────────────────── -->
      <div v-else-if="error || !page" class="static-status">
        <span class="static-status__text">Diese Seite konnte nicht gefunden werden.</span>
        <NuxtLink to="/" class="static-status__back">← Zurück zur Bibliothek</NuxtLink>
      </div>

      <!-- ── Page scroll ──────────────────────────────────────────────────── -->
      <div v-else class="static-wrap">

        <!-- Back navigation -->
        <nav class="static-nav">
          <NuxtLink to="/" class="static-nav__back">
            <span class="static-nav__arrow" aria-hidden="true">←</span>
            Zur Bibliothek
          </NuxtLink>
        </nav>

        <!-- Parchment scroll -->
        <article ref="scrollEl" class="scroll" style="opacity:0">

          <!-- Header -->
          <header class="scroll__hd">
            <h1 ref="titleEl" class="scroll__title" style="opacity:0">
              {{ page.title }}
            </h1>
          </header>

          <!-- Ornamental divider -->
          <div ref="dividerEl" class="scroll__rule" style="opacity:0" aria-hidden="true">
            <span class="rule__line rule__line--l"></span>
            <span class="rule__gem"></span>
            <span class="rule__ornament">✦</span>
            <span class="rule__gem"></span>
            <span class="rule__line rule__line--r"></span>
          </div>

          <!-- Body prose -->
          <div
            ref="bodyEl"
            class="scroll__body prose"
            style="opacity:0"
            v-html="page.content"
          />

          <!-- Footer -->
          <footer ref="footEl" class="scroll__foot" style="opacity:0">
            <div class="foot-rule" aria-hidden="true"></div>
            <div class="foot-inner">
              <NuxtLink to="/" class="foot-link">
                <span class="foot-link__arrow">←</span> Zur Bibliothek
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
@use '@/assets/styles/variables' as *;

// ── Page shell ────────────────────────────────────────────────────────────────

.static-page { min-height: 100vh; }

// ── Status ────────────────────────────────────────────────────────────────────

.static-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.static-status__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 1.05rem;
  color: rgba($moon-100, 0.65);
}

.static-status__back {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.9rem;
  color: rgba($moon-100, 0.68);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color $transition;

  &:hover { color: rgba($accent-500, 0.9); }
}

// ── Outer wrapper ─────────────────────────────────────────────────────────────

.static-wrap {
  width: 320px;
  margin: 0 auto;
  padding: 6rem 1rem 6rem;

  @media (min-width: $bp-tablet) {
    width: 580px;
    padding: 6rem 2rem 6rem;
  }

  @media (min-width: $bp-desktop) {
    width: 860px;
    padding: 6rem 3rem 6rem;
  }
}

// ── Back navigation ───────────────────────────────────────────────────────────

.static-nav {
  margin-bottom: 1.4rem;
}

.static-nav__back {
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

.static-nav__arrow {
  font-style: normal;
  transition: transform 0.22s ease;

  .static-nav__back:hover & {
    transform: translateX(-3px);
  }
}

// ── Parchment scroll ──────────────────────────────────────────────────────────

.scroll {
  position: relative;
  box-sizing: border-box;
  will-change: transform, opacity;
  padding: 3.6rem 3.2rem 3rem;

  background: linear-gradient(
    162deg,
    #dfc08a 0%,
    #ceac70 22%,
    #c09a5a 52%,
    #b28444 78%,
    #a6783e 100%
  );

  border: 1px solid rgba(86, 48, 8, 0.42);
  border-radius: 5px 2px 6px 3px / 3px 6px 2px 5px;

  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.70),
    0 6px 20px  rgba(0, 0, 0, 0.40),
    inset 0 2px 0 rgba(255, 248, 215, 0.30),
    inset 0 -1px 0 rgba(56, 28, 6, 0.20),
    inset 2px 0 0 rgba(255, 248, 215, 0.10),
    inset -2px 0 0 rgba(56, 28, 6, 0.08);

  // Top and bottom scroll rolls
  &::before,
  &::after {
    content: '';
    position: absolute;
    left: -6px;
    right: -6px;
    height: 18px;
    pointer-events: none;
    z-index: 2;
    border-radius: 3px;
    background: linear-gradient(
      to bottom,
      rgba(255, 248, 215, 0.22),
      rgba(140, 88, 28, 0.60) 30%,
      rgba(100, 58, 12, 0.72) 70%,
      rgba(56, 28, 6, 0.40)
    );
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.38),
      inset 0 1px 0 rgba(255, 240, 180, 0.18);
  }

  &::before { top: -9px; }
  &::after  { bottom: -9px; transform: scaleY(-1); }

  @media (max-width: $bp-tablet) {
    padding: 2.8rem 1.8rem 2.4rem;
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

.scroll__hd {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 0;
}

.scroll__title {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  letter-spacing: 0.06em;
  line-height: 1.2;
  margin: 0;
  will-change: transform, opacity;
}

// ── Ornamental divider ────────────────────────────────────────────────────────

.scroll__rule {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 1.6rem 0 1.8rem;
  transform-origin: left center;
  will-change: transform, opacity;
}

.rule__line {
  flex: 1;
  height: 1px;

  &--l {
    background: linear-gradient(to right, transparent, rgba(86, 48, 8, 0.44));
  }

  &--r {
    background: linear-gradient(to left, transparent, rgba(86, 48, 8, 0.44));
  }
}

.rule__gem {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba(86, 48, 8, 0.52);
  box-shadow: 0 0 6px rgba(86, 48, 8, 0.28);
}

.rule__ornament {
  flex-shrink: 0;
  font-size: 0.65rem;
  color: rgba(86, 48, 8, 0.55);
  line-height: 1;
}

// ── Body prose ────────────────────────────────────────────────────────────────

.scroll__body {
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
      border-left: 2px solid rgba(86, 48, 8, 0.34);
      font-style: italic;
      color: rgba(28, 8, 50, 0.72);
    }

    :deep(ul), :deep(ol) {
      padding-left: 1.5em;
      margin: 0.8em 0 1em;
    }

    :deep(li) { margin-bottom: 0.35em; }

    :deep(a) {
      color: rgba(86, 28, 8, 0.82);
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color $transition;

      &:hover { color: rgba(86, 28, 8, 1); }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid rgba(86, 48, 8, 0.24);
      margin: 1.8em 0;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────

.scroll__foot {
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
    rgba(86, 48, 8, 0.30) 20%,
    rgba(86, 48, 8, 0.30) 80%,
    transparent
  );
  margin-bottom: 1.1rem;
}

.foot-inner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.foot-link {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.83rem;
  letter-spacing: 0.10em;
  color: rgba(52, 26, 6, 0.70);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.26s ease;

  &:hover { color: rgba(52, 26, 6, 0.92); }
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
  .scroll,
  .scroll__title,
  .scroll__rule,
  .scroll__body,
  .scroll__foot {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }
}
</style>
