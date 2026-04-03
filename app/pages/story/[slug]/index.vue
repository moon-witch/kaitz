<script setup lang="ts">
import { useStory }         from "~/composables/useStory";
import { useStoryChapters } from "~/composables/useStoryChapters";
import { useSeries }        from "~/composables/useSeries";
import { animate }          from "animejs/animation";

const route = useRoute();
const slug  = route.params.slug as string;

const { data: story,    pending: storyPending,    error: storyError    } = await useStory(slug);
const { data: chapters, pending: chaptersPending                        } = await useStoryChapters(slug);
const { data: allSeries }                                                 = await useSeries();

useSeoMeta({
  title: computed(() =>
    story.value ? `${story.value.title} — Die Schriften` : "Geschichte — Library of Kaitz"
  ),
});

const seriesInfo = computed(() =>
  story.value?.series && allSeries.value
    ? allSeries.value.find(s => s.id === story.value!.series || String(s.id) === String(story.value!.series))
    : null
);

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let r = "";
  for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { r += syms[i]; n -= vals[i]; } }
  return r;
}

// ── Animation refs ───────────────────────────────────────────────────────────
const pageEl      = ref<HTMLElement | null>(null);
const headerEl    = ref<HTMLElement | null>(null);
const synopsisEl  = ref<HTMLElement | null>(null);
const chaptersEl  = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!pageEl.value) return;

  animate(pageEl.value, {
    opacity: [0, 1], translateY: [32, 0],
    duration: 700, ease: "outCubic",
  });

  if (headerEl.value) {
    animate(headerEl.value, {
      opacity: [0, 1], translateY: [16, 0],
      duration: 540, ease: "outCubic", delay: 300,
    });
  }

  if (synopsisEl.value) {
    animate(synopsisEl.value, {
      opacity: [0, 1], translateY: [12, 0],
      duration: 580, ease: "outCubic", delay: 520,
    });
  }

  if (chaptersEl.value) {
    animate(chaptersEl.value, {
      opacity: [0, 1], translateY: [14, 0],
      duration: 620, ease: "outCubic", delay: 740,
    });
  }
});
</script>

<template>
  <section class="story-page">
    <HallScene>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="storyPending" class="story-status">
        <span class="story-status__text">Das Manuskript wird entfaltet…</span>
      </div>

      <!-- ── Error ────────────────────────────────────────────────────────── -->
      <div v-else-if="storyError || !story" class="story-status">
        <span class="story-status__text">Dieses Werk konnte nicht gefunden werden.</span>
        <NuxtLink to="/stories" class="story-status__back">← Zurück zu den Schriften</NuxtLink>
      </div>

      <!-- ── Story ─────────────────────────────────────────────────────────── -->
      <div v-else ref="pageEl" class="story-wrap" style="opacity:0">

        <!-- Back nav -->
        <nav class="story-nav">
          <NuxtLink to="/stories" class="story-nav__back">
            <span class="story-nav__arrow" aria-hidden="true">←</span>
            Die Schriften
          </NuxtLink>
        </nav>

        <!-- Header -->
        <header ref="headerEl" class="story-hd" style="opacity:0">

          <!-- Series badge -->
          <div v-if="seriesInfo" class="series-badge">
            <span class="series-badge__gem" aria-hidden="true"></span>
            <span class="series-badge__name">{{ seriesInfo.title }}</span>
            <span v-if="seriesInfo.type" class="series-badge__type">— {{ seriesInfo.type }}</span>
          </div>

          <h1 class="story-hd__title">{{ story.title }}</h1>

          <div class="story-hd__rule" aria-hidden="true">
            <span class="rule__line rule__line--l"></span>
            <span class="rule__gem"></span>
            <span class="rule__line rule__line--r"></span>
          </div>
        </header>

        <!-- Synopsis -->
        <div v-if="story.synopsis" ref="synopsisEl" class="synopsis-parchment" style="opacity:0">
          <p class="synopsis-parchment__label">Inhaltsangabe</p>
          <p class="synopsis-parchment__text">{{ story.synopsis }}</p>
        </div>

        <!-- Chapters -->
        <div ref="chaptersEl" class="chapters-section" style="opacity:0">

          <div class="chapters-section__hd">
            <span class="chapters-section__rule" aria-hidden="true"></span>
            <h2 class="chapters-section__title">Kapitel</h2>
            <span class="chapters-section__rule" aria-hidden="true"></span>
          </div>

          <!-- Loading chapters -->
          <div v-if="chaptersPending" class="chapters-loading">
            <span>Kapitel werden geladen…</span>
          </div>

          <!-- Empty -->
          <div v-else-if="!chapters?.length" class="chapters-empty">
            <span class="chapters-empty__text">Dieses Werk wartet noch auf seine Schriften.</span>
          </div>

          <!-- Chapter list -->
          <ol v-else class="chapter-list" aria-label="Kapitel">
            <li v-for="ch in chapters" :key="ch.id" class="chapter-item">
              <NuxtLink
                :to="`/story/${slug}/chapter/${ch.chapter_number}`"
                class="chapter-link"
              >
                <span class="chapter-link__numeral" aria-label="`Kapitel ${ch.chapter_number}`">
                  {{ toRoman(ch.chapter_number) }}
                </span>
                <div class="chapter-link__body">
                  <span class="chapter-link__title">{{ ch.title }}</span>
                </div>
                <span class="chapter-link__cta" aria-hidden="true">
                  Lesen
                  <span class="chapter-link__arrow">→</span>
                </span>
              </NuxtLink>
            </li>
          </ol>

        </div>

      </div>

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

// ── Page shell ────────────────────────────────────────────────────────────────

.story-page { min-height: 100vh; }

// ── Status ────────────────────────────────────────────────────────────────────

.story-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
}

.story-status__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 1.05rem;
  color: rgba($moon-100, 0.65);
}

.story-status__back {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.88rem;
  color: rgba($moon-100, 0.65);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: color $transition;
  &:hover { color: rgba($accent-500, 0.9); }
}

// ── Outer wrapper ─────────────────────────────────────────────────────────────

.story-wrap {
  max-width: 780px;
  margin: 0 auto;
  padding: 6rem 1.5rem 6rem;

  @media (min-width: $bp-tablet)  { padding: 6rem 2.4rem 6rem; }
  @media (min-width: $bp-desktop) { padding: 6rem 3rem 6rem; }
}

// ── Back nav ──────────────────────────────────────────────────────────────────

.story-nav { margin-bottom: 1.8rem; }

.story-nav__back {
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

.story-nav__arrow {
  font-style: normal;
  transition: transform 0.22s ease;
  .story-nav__back:hover & { transform: translateX(-3px); }
}

// ── Story header ──────────────────────────────────────────────────────────────

.story-hd {
  text-align: center;
  margin-bottom: 2.4rem;
}

// Series badge
.series-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.28rem 0.85rem;
  border-radius: 3px 2px 4px 2px / 2px 3px 2px 3px;
  background: rgba($accent-500, 0.08);
  border: 1px solid rgba($accent-500, 0.22);
  margin-bottom: 1rem;
}

.series-badge__gem {
  width: $sigil-sm;
  height: $sigil-sm;
  border-radius: 999px;
  background: rgba($accent-500, 0.72);
  box-shadow: 0 0 8px rgba($accent-500, 0.40);
  flex-shrink: 0;
}

.series-badge__name {
  font-family: $font-serif;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba($moon-100, 0.72);
}

.series-badge__type {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.76rem;
  color: rgba($moon-100, 0.60);
}

.story-hd__title {
  font-family: $font-serif;
  font-weight: 700;
  font-size: clamp(1.79rem, 5.5vw, 2.82rem);
  letter-spacing: 0.08em;
  color: $moon-100;
  line-height: 1.18;
  margin: 0 0 1.4rem;
  text-shadow: 0 0 50px rgba($accent-500, 0.22);
}

.story-hd__rule {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 320px;
  margin: 0 auto;
}

.rule__line {
  flex: 1;
  height: 1px;
  &--l { background: linear-gradient(to right, transparent, rgba($moon-100, 0.22)); }
  &--r { background: linear-gradient(to left,  transparent, rgba($moon-100, 0.22)); }
}

.rule__gem {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba($accent-500, 0.70);
  box-shadow: 0 0 8px rgba($accent-500, 0.42);
}

// ── Synopsis parchment ────────────────────────────────────────────────────────

.synopsis-parchment {
  position: relative;
  padding: 1.8rem 2rem 1.6rem;
  margin-bottom: 2.8rem;

  background: linear-gradient(
    162deg,
    #dfc08a 0%, #ceac70 22%, #c09a5a 52%, #b28444 78%, #a6783e 100%
  );

  border: 1px solid rgba(86, 48, 8, 0.40);
  border-radius: 5px 2px 6px 3px / 3px 6px 2px 5px;

  box-shadow:
    0 18px 48px rgba(0,0,0,0.60),
    0 4px 14px rgba(0,0,0,0.36),
    inset 0 2px 0 rgba(255,248,215,0.28),
    inset 0 -1px 0 rgba(56,28,6,0.18);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: repeating-linear-gradient(
      180deg,
      transparent 0px, transparent 3px,
      rgba(118,68,16,0.04) 3px, rgba(118,68,16,0.04) 4px
    );
  }

  @media (max-width: $bp-tablet) {
    padding: 1.4rem 1.4rem 1.2rem;
  }
}

.synopsis-parchment__label {
  font-family: $font-serif;
  font-size: 0.74rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(48, 22, 4, 0.65);
  margin: 0 0 0.7rem;
  position: relative;
  z-index: 1;
}

.synopsis-parchment__text {
  font-family: $font-serif;
  font-size: 1.02rem;
  line-height: 1.78;
  color: rgba(28, 8, 50, 0.88);
  margin: 0;
  position: relative;
  z-index: 1;
}

// ── Chapters section ──────────────────────────────────────────────────────────

.chapters-section {
}

.chapters-section__hd {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.chapters-section__rule {
  flex: 1;
  height: 1px;
  background: rgba($moon-100, 0.12);
}

.chapters-section__title {
  font-family: $font-serif;
  font-size: 0.80rem;
  font-weight: 600;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba($moon-100, 0.68);
  margin: 0;
  flex-shrink: 0;
}

.chapters-loading,
.chapters-empty {
  text-align: center;
  padding: 2rem 0;
}

.chapters-loading,
.chapters-empty__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.92rem;
  color: rgba($moon-100, 0.58);
  letter-spacing: 0.04em;
}

// ── Chapter list ──────────────────────────────────────────────────────────────

.chapter-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chapter-item {
  border-radius: 5px 4px 6px 4px / 4px 6px 4px 5px;
  overflow: hidden;
}

.chapter-link {
  display: grid;
  grid-template-columns: 3.2rem 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.4rem 1.1rem 1rem;
  text-decoration: none;
  color: inherit;
  background: rgba($ink-900, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: inherit;
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;

  &:hover {
    background: rgba($ink-800, 0.70);
    border-color: rgba($accent-500, 0.20);
    box-shadow: 0 4px 20px rgba(0,0,0,0.40), 0 0 0 1px rgba($accent-500, 0.08) inset;

    .chapter-link__arrow { transform: translateX(3px); }
    .chapter-link__numeral { color: rgba($candle-bright, 0.80); }
  }

  @media (max-width: $bp-tablet) {
    grid-template-columns: 2.6rem 1fr;
    gap: 0.8rem;
  }
}

.chapter-link__numeral {
  font-family: $font-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: rgba($moon-100, 0.42);
  letter-spacing: 0.04em;
  text-align: center;
  line-height: 1;
  transition: color 0.22s ease;

  @media (max-width: $bp-tablet) {
    font-size: 1.1rem;
  }
}

.chapter-link__body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.chapter-link__title {
  font-family: $font-serif;
  font-size: 1.02rem;
  font-weight: 600;
  color: rgba($moon-100, 0.88);
  letter-spacing: 0.03em;
  line-height: 1.3;
}


.chapter-link__cta {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: rgba($moon-100, 0.62);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;

  @media (max-width: $bp-tablet) { display: none; }
}

.chapter-link__arrow {
  font-style: normal;
  transition: transform 0.22s ease;
}

// ── Reduced motion ────────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .story-wrap,
  .story-hd,
  .synopsis-parchment,
  .chapters-section {
    opacity: 1 !important;
    transform: none !important;
  }

  .chapter-link { transition: none; }
  .story-nav__arrow { transition: none; }
}
</style>
