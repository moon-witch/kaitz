<script setup lang="ts">
import { useNewsItem } from "~/composables/useNewsItem";
import { animate } from "animejs/animation";

const route = useRoute();
const slug = route.params.slug as string;

const { data: item, pending, error } = await useNewsItem(slug);

useSeoMeta({
  title: computed(() =>
    item.value ? `${item.value.title} — Die Arkane Gazette` : "Die Arkane Gazette — Library of Kaitz"
  ),
});

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Animation refs ───────────────────────────────────────────────────────────
const noticeEl  = ref<HTMLElement | null>(null);
const labelEl   = ref<HTMLElement | null>(null);
const titleEl   = ref<HTMLElement | null>(null);
const dateEl    = ref<HTMLElement | null>(null);
const dividerEl = ref<HTMLElement | null>(null);
const bodyEl    = ref<HTMLElement | null>(null);
const footEl    = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!noticeEl.value) return;

  animate(noticeEl.value, {
    opacity:    [0, 1],
    translateY: [48, 0],
    scale:      [0.97, 1],
    duration: 780,
    ease: "outCubic",
  });

  if (labelEl.value) {
    animate(labelEl.value, {
      opacity:    [0, 1],
      translateY: [6, 0],
      duration: 420,
      ease: "outQuad",
      delay: 360,
    });
  }

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

  if (dateEl.value) {
    animate(dateEl.value, {
      opacity:    [0, 1],
      translateY: [6, 0],
      duration: 380,
      ease: "outQuad",
      delay: 580,
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
  <section class="notice-page">
    <HallScene>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="pending" class="notice-status">
        <span class="notice-status__text">Bekanntmachung wird geladen…</span>
      </div>

      <!-- ── Error / Not found ────────────────────────────────────────────── -->
      <div v-else-if="error || !item" class="notice-status">
        <span class="notice-status__text">Diese Bekanntmachung konnte nicht gefunden werden.</span>
        <NuxtLink to="/news" class="notice-status__back">← Zurück zum Nachrichtenbrett</NuxtLink>
      </div>

      <!-- ── Notice ────────────────────────────────────────────────────────── -->
      <div v-else class="notice-wrap">

        <!-- Back navigation -->
        <nav class="notice-nav">
          <NuxtLink to="/news" class="notice-nav__back">
            <span class="notice-nav__arrow" aria-hidden="true">←</span>
            Nachrichtenbrett
          </NuxtLink>
        </nav>

        <!-- The posted notice -->
        <article ref="noticeEl" class="notice" style="opacity:0">

          <!-- Decorative pin at the top -->
          <div class="notice__pin" aria-hidden="true">
            <div class="pin__head"></div>
            <div class="pin__shaft"></div>
          </div>

          <!-- Wax seal (featured only) -->
          <div v-if="item.featured" class="notice__seal" aria-hidden="true">
            <span class="seal__inner" aria-hidden="true"></span>
          </div>

          <!-- Header -->
          <header class="notice__hd">
            <p ref="labelEl" class="notice__label" style="opacity:0" aria-label="Bekanntmachung">
              Bekanntmachung
            </p>
            <h1 ref="titleEl" class="notice__title" style="opacity:0">
              {{ item.title }}
            </h1>
            <p v-if="item.date_created" ref="dateEl" class="notice__date" style="opacity:0">
              <time>{{ formatDate(item.date_created) }}</time>
            </p>
          </header>

          <!-- Ornamental divider -->
          <div ref="dividerEl" class="notice__rule" style="opacity:0" aria-hidden="true">
            <span class="rule__line rule__line--l"></span>
            <span class="rule__gem"></span>
            <span class="rule__line rule__line--r"></span>
          </div>

          <!-- Body prose -->
          <div
            ref="bodyEl"
            class="notice__body prose"
            style="opacity:0"
            v-html="item.content"
          />

          <!-- Footer -->
          <footer ref="footEl" class="notice__foot" style="opacity:0">
            <div class="foot-rule" aria-hidden="true"></div>
            <div class="foot-inner">
              <NuxtLink to="/news" class="foot-link">
                <span class="foot-link__arrow">←</span> Alle Bekanntmachungen
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

.notice-page { min-height: 100vh; }

// ── Status ────────────────────────────────────────────────────────────────────

.notice-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.notice-status__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 1.05rem;
  color: rgba($moon-100, 0.65);
}

.notice-status__back {
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

.notice-wrap {
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

.notice-nav {
  margin-bottom: 1.4rem;
}

.notice-nav__back {
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

.notice-nav__arrow {
  font-style: normal;
  transition: transform 0.22s ease;

  .notice-nav__back:hover & {
    transform: translateX(-3px);
  }
}

// ── The posted notice ─────────────────────────────────────────────────────────

.notice {
  position: relative;
  box-sizing: border-box;
  will-change: transform, opacity;
  padding: 3.2rem 2.8rem 2.6rem;

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
      transparent 0px,
      transparent 3px,
      rgba(126, 74, 20, 0.044) 3px,
      rgba(126, 74, 20, 0.044) 4px
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
      120deg,
      transparent 18%,
      rgba(255, 240, 172, 0.00) 34%,
      rgba(255, 240, 172, 0.09) 50%,
      rgba(255, 240, 172, 0.00) 66%,
      transparent 82%
    );
  }

  @media (max-width: $bp-tablet) {
    padding: 2.6rem 1.6rem 2.2rem;
  }
}

// ── Decorative pin ────────────────────────────────────────────────────────────

.notice__pin {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.pin__head {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: radial-gradient(circle at 34% 30%, rgba(255, 228, 100, 0.95), rgba(178, 108, 18, 0.92));
  box-shadow:
    0 0 14px rgba($accent-500, 0.45),
    0 0 4px  rgba($candle-bright, 0.55),
    0 3px 8px rgba(0, 0, 0, 0.50),
    inset 0 1px 0 rgba(255, 244, 180, 0.62);
}

.pin__shaft {
  width: 2px;
  height: 10px;
  background: linear-gradient(to bottom, rgba(160, 96, 16, 0.80), rgba(80, 44, 8, 0.55));
  border-radius: 0 0 1px 1px;
}

// ── Wax seal (featured) ───────────────────────────────────────────────────────

.notice__seal {
  position: absolute;
  top: 1.1rem;
  right: 1.4rem;
  z-index: 3;
  width: 38px;
  height: 38px;
  border-radius: 999px;

  background:
    radial-gradient(circle at 32% 28%, rgba(200, 80, 80, 0.52), transparent 50%),
    radial-gradient(circle at 62% 65%, rgba($arcane-500, 0.38), transparent 55%),
    rgba(136, 32, 32, 0.58);

  box-shadow:
    0 0 18px rgba(175, 38, 38, 0.28),
    inset 0 1px 0 rgba(255, 160, 160, 0.18),
    inset 0 -1px 0 rgba(0, 0, 0, 0.38);
}

.seal__inner {
  position: absolute;
  inset: 6px;
  border-radius: 999px;
  border: 1px solid rgba(255, 120, 120, 0.22);
}

// ── Header ────────────────────────────────────────────────────────────────────

.notice__hd {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 0;
}

.notice__label {
  font-family: $font-serif;
  font-size: 0.76rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(50, 24, 6, 0.68);
  margin: 0 0 0.55rem;
  will-change: transform, opacity;
}

.notice__title {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  font-size: clamp(1.55rem, 5vw, 2.4rem);
  letter-spacing: 0.05em;
  line-height: 1.2;
  margin: 0 0 0.55rem;
  will-change: transform, opacity;
}

.notice__date {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.80rem;
  letter-spacing: 0.10em;
  color: rgba(50, 24, 6, 0.70);
  margin: 0;
  will-change: transform, opacity;
}

// ── Ornamental divider ────────────────────────────────────────────────────────

.notice__rule {
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

  &--l {
    background: linear-gradient(to right, transparent, rgba(86, 48, 8, 0.44));
  }

  &--r {
    background: linear-gradient(to left, transparent, rgba(86, 48, 8, 0.44));
  }
}

.rule__gem {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba(86, 48, 8, 0.52);
  box-shadow: 0 0 6px rgba(86, 48, 8, 0.28);
}

// ── Body prose ────────────────────────────────────────────────────────────────

.notice__body {
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

.notice__foot {
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
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
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
  .notice,
  .notice__label,
  .notice__title,
  .notice__date,
  .notice__rule,
  .notice__body,
  .notice__foot,
  .notice__pin,
  .notice__seal {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }
}
</style>