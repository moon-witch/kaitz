<script setup lang="ts">
import { useNews } from "~/composables/useNews";
import { animate } from "animejs/animation";

const { data: news, pending, error } = await useNews();

useSeoMeta({
  title: "Die Arkane Gazette — Library of Kaitz",
});

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("de-DE", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function excerpt(html?: string | null, len = 160): string {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > len ? text.slice(0, len).trimEnd() + "…" : text;
}

const featured = computed(() => news.value?.find(n => n.featured) ?? news.value?.[0] ?? null);
const secondary = computed(() => {
  if (!news.value) return [];
  return featured.value ? news.value.filter(n => n.id !== featured.value!.id) : news.value.slice(1);
});

const broadsheetEl = ref<HTMLElement | null>(null);
const mastheadEl   = ref<HTMLElement | null>(null);
const articlesEl   = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!broadsheetEl.value) return;

  animate(broadsheetEl.value, {
    opacity:    [0, 1],
    translateY: [40, 0],
    scale:      [0.98, 1],
    duration: 820,
    ease: "outCubic",
  });

  if (mastheadEl.value) {
    animate(mastheadEl.value, {
      opacity:    [0, 1],
      translateY: [8, 0],
      duration: 500,
      ease: "outQuad",
      delay: 440,
    });
  }

  if (articlesEl.value) {
    animate(articlesEl.value, {
      opacity:    [0, 1],
      translateY: [12, 0],
      duration: 560,
      ease: "outCubic",
      delay: 660,
    });
  }
});
</script>

<template>
  <section class="news-page">
    <HallScene>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div v-if="pending" class="news-status">
        <span class="news-status__text">Die Gazette wird gedruckt…</span>
      </div>

      <!-- ── Error ────────────────────────────────────────────────────────── -->
      <div v-else-if="error || !news?.length" class="news-status">
        <span class="news-status__text">Die Gazette ist derzeit nicht verfügbar.</span>
      </div>

      <!-- ── Broadsheet ────────────────────────────────────────────────────── -->
      <div v-else class="news-wrap">
        <article ref="broadsheetEl" class="broadsheet" style="opacity:0">

          <!-- Masthead -->
          <header ref="mastheadEl" class="masthead" style="opacity:0">
            <div class="masthead__rule masthead__rule--thick" aria-hidden="true"></div>
            <div class="masthead__rule" aria-hidden="true"></div>
            <div class="masthead__inner">
              <p class="masthead__eyeline">Offizielle Mitteilungen · Bibliothek von Kaitz</p>
              <h1 class="masthead__title">Die Arkane Gazette</h1>
              <p class="masthead__sub">Stimme des Verborgenen Wissens · Seit den Anbeginn der Bibliothek</p>
            </div>
            <div class="masthead__rule" aria-hidden="true"></div>
            <div class="masthead__rule masthead__rule--thick" aria-hidden="true"></div>
          </header>

          <!-- Articles -->
          <div ref="articlesEl" class="articles" style="opacity:0">

            <!-- Lead / featured article -->
            <NuxtLink
              v-if="featured"
              :to="`/news/${featured.slug}`"
              class="article article--lead"
            >
              <p v-if="featured.date_created" class="article__dateline">
                <time>{{ formatDate(featured.date_created) }}</time>
              </p>
              <h2 class="article__headline article__headline--lead">{{ featured.title }}</h2>
              <div class="article__ornament" aria-hidden="true">
                <span class="ornament__line ornament__line--l"></span>
                <span class="ornament__gem"></span>
                <span class="ornament__line ornament__line--r"></span>
              </div>
              <p v-if="featured.content" class="article__excerpt article__excerpt--lead">
                {{ excerpt(featured.content, 280) }}
              </p>
              <span class="article__more">Weiterlesen →</span>
            </NuxtLink>

            <!-- Section rule -->
            <div v-if="secondary.length" class="section-rule" aria-hidden="true">
              <span class="section-rule__line"></span>
              <span class="section-rule__mark">✦</span>
              <span class="section-rule__line"></span>
            </div>

            <!-- Secondary articles grid -->
            <div v-if="secondary.length" class="articles__grid">
              <NuxtLink
                v-for="item in secondary"
                :key="item.id"
                :to="`/news/${item.slug}`"
                class="article article--secondary"
              >
                <p v-if="item.date_created" class="article__dateline">
                  <time>{{ formatDate(item.date_created) }}</time>
                </p>
                <h2 class="article__headline">{{ item.title }}</h2>
                <p v-if="item.content" class="article__excerpt">
                  {{ excerpt(item.content) }}
                </p>
                <span class="article__more">Weiterlesen →</span>
              </NuxtLink>
            </div>

          </div>

        </article>
      </div>

    </HallScene>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

// ── Page shell ────────────────────────────────────────────────────────────────

.news-page { min-height: 100vh; }

// ── Status (loading / error) ──────────────────────────────────────────────────

.news-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.news-status__text {
  font-family: $font-serif;
  font-style: italic;
  font-size: 1.05rem;
  color: rgba($moon-100, 0.65);
}

// ── Outer wrapper ─────────────────────────────────────────────────────────────

.news-wrap {
  width: 320px;
  margin: 0 auto;
  padding: 5rem 1rem 5rem;

  @media (min-width: $bp-tablet) {
    width: 680px;
    padding: 6rem 2rem 6rem;
  }

  @media (min-width: $bp-desktop) {
    width: 1060px;
    padding: 6rem 3rem 6rem;
  }
}

// ── Broadsheet parchment ──────────────────────────────────────────────────────

.broadsheet {
  position: relative;
  box-sizing: border-box;
  will-change: transform, opacity;

  background: linear-gradient(
    168deg,
    #e2ca8c 0%,
    #d4b870 16%,
    #c6a45a 44%,
    #ba9248 72%,
    #ae8640 100%
  );

  border: 1px solid rgba(78, 42, 8, 0.44);
  border-radius: 4px 2px 5px 3px / 3px 5px 2px 4px;

  box-shadow:
    0 28px 72px rgba(0, 0, 0, 0.74),
    0 8px 24px  rgba(0, 0, 0, 0.44),
    inset 0 2px 0 rgba(255, 248, 210, 0.30),
    inset 0 -1px 0 rgba(52, 22, 4, 0.22),
    inset 2px 0 0 rgba(255, 248, 210, 0.10),
    inset -2px 0 0 rgba(52, 22, 4, 0.08);

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
      rgba(118, 68, 16, 0.042) 3px,
      rgba(118, 68, 16, 0.042) 4px
    );
  }

  // Shimmer pass
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
    background: linear-gradient(
      112deg,
      transparent 20%,
      rgba(255, 240, 170, 0.00) 36%,
      rgba(255, 240, 170, 0.09) 50%,
      rgba(255, 240, 170, 0.00) 64%,
      transparent 80%
    );
  }
}

// ── Masthead ──────────────────────────────────────────────────────────────────

.masthead {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem 2.8rem 0;
  will-change: transform, opacity;

  @media (max-width: $bp-tablet) {
    padding: 1.6rem 1.6rem 0;
  }
}

.masthead__rule {
  height: 1px;
  background: rgba(68, 36, 6, 0.42);
  margin-bottom: 3px;

  &--thick {
    height: 2px;
    background: rgba(68, 36, 6, 0.52);
    margin-bottom: 3px;
  }
}

.masthead__inner {
  padding: 0.55rem 0;
}

.masthead__eyeline {
  font-family: $font-serif;
  font-size: 0.76rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(48, 22, 4, 0.68);
  margin: 0 0 0.5rem;
}

.masthead__title {
  font-family: $font-serif;
  font-weight: 700;
  font-size: clamp(2rem, 7vw, 4rem);
  letter-spacing: 0.14em;
  color: $ink-text;
  line-height: 1;
  margin: 0 0 0.45rem;
}

.masthead__sub {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.78rem;
  letter-spacing: 0.10em;
  color: rgba(48, 22, 4, 0.65);
  margin: 0 0 0.55rem;
}

// ── Articles area ─────────────────────────────────────────────────────────────

.articles {
  position: relative;
  z-index: 2;
  padding: 0 2.8rem 2.4rem;
  will-change: transform, opacity;

  @media (max-width: $bp-tablet) {
    padding: 0 1.4rem 1.8rem;
  }
}

// ── Shared article base ───────────────────────────────────────────────────────

.article {
  display: block;
  text-decoration: none;
  color: inherit;
}

// ── Lead article ──────────────────────────────────────────────────────────────

.article--lead {
  text-align: center;
  padding: 2rem 1.6rem 1.8rem;
  transition: opacity 0.22s ease;

  &:hover { opacity: 0.84; }
}

.article__dateline {
  font-family: $font-serif;
  font-size: 0.76rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(48, 22, 4, 0.65);
  margin: 0 0 0.5rem;
}

.article__headline {
  font-family: $font-serif;
  font-weight: 700;
  color: $ink-text;
  letter-spacing: 0.03em;
  line-height: 1.22;
  margin: 0 0 0.55rem;
  font-size: clamp(1.05rem, 2.6vw, 1.24rem);
}

.article__headline--lead {
  font-size: clamp(1.6rem, 5vw, 2.6rem);
  letter-spacing: 0.06em;
  margin-bottom: 0.9rem;
}

// Ornamental rule under lead headline
.article__ornament {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 auto 1.1rem;
  max-width: 280px;
}

.ornament__line {
  flex: 1;
  height: 1px;

  &--l { background: linear-gradient(to right, transparent, rgba(76, 40, 8, 0.42)); }
  &--r { background: linear-gradient(to left,  transparent, rgba(76, 40, 8, 0.42)); }
}

.ornament__gem {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  flex-shrink: 0;
  background: rgba(76, 40, 8, 0.48);
  box-shadow: 0 0 5px rgba(76, 40, 8, 0.26);
}

.article__excerpt {
  font-family: $font-serif;
  font-size: 0.96rem;
  line-height: 1.74;
  color: rgba($ink-text, 0.80);
  margin: 0 0 0.9rem;
}

.article__excerpt--lead {
  font-size: 1.04rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.article__more {
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.82rem;
  letter-spacing: 0.10em;
  color: rgba(66, 32, 6, 0.72);
  display: inline-block;
  transition: color 0.22s ease;

  .article:hover & { color: rgba(66, 32, 6, 0.92); }
}

// ── Section rule ──────────────────────────────────────────────────────────────

.section-rule {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 0 0;

  // Double line effect via box shadow
  border-top: 2px solid rgba(66, 34, 6, 0.36);
  box-shadow: inset 0 4px 0 rgba(66, 34, 6, 0.20);
  padding-top: 4px;
}

.section-rule__line {
  flex: 1;
  height: 1px;
  background: rgba(66, 34, 6, 0.28);
}

.section-rule__mark {
  font-size: 0.65rem;
  color: rgba(66, 34, 6, 0.58);
  flex-shrink: 0;
}

// ── Secondary articles grid ───────────────────────────────────────────────────

.articles__grid {
  display: grid;
  grid-template-columns: 1fr;
}

.article--secondary {
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid rgba(76, 40, 8, 0.18);
  transition: background 0.22s ease;

  &:last-child { border-bottom: none; }

  &:hover { background: rgba(255, 250, 225, 0.14); }

  @media (min-width: $bp-tablet) {
    grid-column: span 1;
    border-right: 1px solid rgba(76, 40, 8, 0.20);

    &:nth-child(2n) { border-right: none; }
  }

  @media (min-width: $bp-desktop) {
    &:nth-child(2n) { border-right: 1px solid rgba(76, 40, 8, 0.20); }
    &:nth-child(3n) { border-right: none; }
  }
}

@media (min-width: $bp-tablet) {
  .articles__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: $bp-desktop) {
  .articles__grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

// ── Reduced motion ────────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .broadsheet,
  .masthead,
  .articles {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }

  .article--lead,
  .article--secondary {
    transition: none;
  }
}
</style>