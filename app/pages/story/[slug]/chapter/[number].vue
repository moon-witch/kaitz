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

// ── Animation refs ───────────────────────────────────────────────────────────
const scrollEl  = ref<HTMLElement | null>(null);
const numeralEl = ref<HTMLElement | null>(null);
const titleEl   = ref<HTMLElement | null>(null);
const dividerEl = ref<HTMLElement | null>(null);
const bodyEl    = ref<HTMLElement | null>(null);
const footEl    = ref<HTMLElement | null>(null);

onMounted(() => {
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
  <section class="chapter-page">
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

      <!-- ── Chapter scroll ───────────────────────────────────────────────── -->
      <div v-else class="chapter-wrap">

        <!-- Back nav -->
        <nav class="chapter-nav">
          <NuxtLink :to="`/story/${storySlug}`" class="chapter-nav__back">
            <span class="chapter-nav__arrow" aria-hidden="true">←</span>
            {{ story?.title ?? "Werk" }}
          </NuxtLink>
        </nav>

        <!-- Parchment scroll -->
        <article ref="scrollEl" class="chapter-scroll" style="opacity:0">

          <!-- Header -->
          <header class="chapter-scroll__hd">
            <p ref="numeralEl" class="chapter-scroll__numeral" style="opacity:0" aria-label="`Kapitel ${chapterNum}`">
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

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

// ── Page shell ────────────────────────────────────────────────────────────────

.chapter-page { min-height: 100vh; }

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

// ── Outer wrapper ─────────────────────────────────────────────────────────────

.chapter-wrap {
  width: 320px;
  margin: 0 auto;
  padding: 6rem 1rem 6rem;

  @media (min-width: $bp-tablet)  { width: 600px; padding: 6rem 2.4rem 6rem; }
  @media (min-width: $bp-desktop) { width: 840px; padding: 6rem 3.2rem 6rem; }
}

// ── Back nav ──────────────────────────────────────────────────────────────────

.chapter-nav { margin-bottom: 1.6rem; }

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
  font-size: clamp(0.97rem, 2.2vw, 1.08rem);
  line-height: 1.84;
  color: $ink-text;
  will-change: transform, opacity;

  // Drop cap on first paragraph
  &.prose :deep(p:first-child)::first-letter {
    font-size: 3.8rem;
    font-weight: 700;
    float: left;
    line-height: 0.80;
    margin: 0.12em 0.08em 0 0;
    color: darken($ink-text, 8%);
    font-family: $font-serif;
  }

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
      color: darken($ink-text, 5%);
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
}
</style>
