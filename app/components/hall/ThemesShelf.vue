<script setup lang="ts">
type Theme = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  accent_color_hex?: string;
};

defineProps<{
  themes: Theme[] | null | undefined;
}>();
</script>

<template>
  <section class="shelf" aria-label="Themenregal">
    <div class="shelf__cap">
      <div class="shelf__plaque">
        <span class="shelf__sigil" aria-hidden="true"></span>
        <h2 class="shelf__h2">Themenregal</h2>
      </div>

      <NuxtLink to="/stories" class="shelf__more">Durchstöbern</NuxtLink>
    </div>

    <div class="shelf__row">
      <NuxtLink
          v-for="(t, i) in (themes ?? [])"
          :key="t.id"
          class="spine"
          :class="`spine--tilt${i % 3}`"
          :to="`/stories?theme=${t.slug}`"
          :style="t.accent_color_hex ? { '--tAccent': t.accent_color_hex } : undefined"
      >
        <div class="spine__cap" aria-hidden="true">
          <span class="spine__gem"></span>
        </div>

        <div class="spine__body">
          <div class="spine__name">{{ t.name }}</div>
          <div v-if="t.description" class="spine__desc">{{ t.description }}</div>
        </div>

        <div class="spine__runes" aria-hidden="true"></div>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* Shelf: reads like a recessed bookshelf rather than a dashboard panel */
.shelf {
  margin-top: 1.35rem;
  padding: 1rem;
  border-radius: 18px;
  position: relative;
  overflow: hidden;

  background:
      radial-gradient(circle at 16% 18%, rgba($accent-500, 0.10), transparent 60%),
      linear-gradient(180deg, rgba(110, 66, 32, 0.14), rgba(12, 10, 16, 0.42)),
      rgba(10, 6, 18, 0.34);

  border: 1px solid rgba(255, 255, 255, 0.09);

  box-shadow:
      0 18px 46px rgba(0,0,0,0.52),
      inset 0 1px 0 rgba(255,255,255,0.08),
      inset 0 -1px 0 rgba(0,0,0,0.52);
}

/* Ambient varnish/grain */
.shelf::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.38;

  background:
      linear-gradient(90deg, rgba(255,255,255,0.05), transparent 35%, rgba(255,255,255,0.03)),
      radial-gradient(circle at 80% 18%, rgba($moon-100,0.06), transparent 60%),
      radial-gradient(circle at 12% 72%, rgba(0,0,0,0.18), transparent 55%);

  mix-blend-mode: screen;
}

/* Soft vignette */
.shelf::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 28%, rgba(0,0,0,0), rgba(0,0,0,0.42) 72%);
  opacity: 0.55;
}

.shelf__cap {
  position: relative;
  z-index: 1;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.shelf__plaque {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;

  padding: 0.35rem 0.6rem;
  border-radius: 999px;

  background:
      radial-gradient(circle at 22% 30%, rgba($accent-500,0.18), transparent 55%),
      rgba(255,255,255,0.03);

  box-shadow:
      0 10px 24px rgba(0,0,0,0.35),
      inset 0 1px 0 rgba(255,255,255,0.08);

  font-family: $font-serif;
  letter-spacing: 0.03em;
  opacity: 0.95;
}

.shelf__sigil {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba($accent-500, 0.85);
  box-shadow: 0 0 16px rgba($accent-500, 0.45);
}

.shelf__h2 {
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.shelf__more {
  position: relative;
  z-index: 1;

  font-size: 0.9rem;
  opacity: 0.82;
  text-decoration: none;
  color: rgba($moon-100, 0.92);

  &:hover { opacity: 1; }
}

.shelf__row {
  position: relative;
  z-index: 1;

  display: grid;
  gap: 0.9rem;

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* Book-spine cards: feel like physical spines, not tiles */
.spine {
  --tAccent: #b042c9;

  position: relative;
  overflow: hidden;

  border-radius: 16px;
  padding: 0.9rem 0.9rem 1rem;

  text-decoration: none;
  color: rgba($moon-100, 0.96);

  background:
      /* highlight band like worn lacquer */
      linear-gradient(90deg,
          rgba(255,255,255,0.00) 0%,
          rgba(255,255,255,0.08) 18%,
          rgba(255,255,255,0.02) 55%,
          rgba(255,255,255,0.00) 100%
      ),
        /* accent bloom */
      radial-gradient(circle at 22% 28%, color-mix(in srgb, var(--tAccent) 32%, transparent), transparent 62%),
        /* leather/cloth base */
      linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)),
      rgba(255, 255, 255, 0.03);

  border: 1px solid rgba(255, 255, 255, 0.07);

  box-shadow:
      0 18px 40px rgba(0,0,0,0.50),
      inset 0 1px 0 rgba(255,255,255,0.10),
      inset 0 -1px 0 rgba(0,0,0,0.35);

  transform-origin: 22% 22%;
  transition:
      transform 240ms ease,
      box-shadow 280ms ease,
      background 280ms ease;
}

.spine::before {
  /* subtle “embossing” + grain */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.55;

  background:
      radial-gradient(circle at 20% 22%, rgba(255,255,255,0.10), transparent 45%),
      radial-gradient(circle at 78% 72%, rgba(0,0,0,0.14), transparent 52%);

  mix-blend-mode: overlay;
}

.spine::after {
  /* inner vignette */
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,0.38) 74%);
  opacity: 0.55;
}

.spine__cap {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0.45rem;
}

.spine__gem {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tAccent) 72%, #fff 10%);
  box-shadow:
      0 0 18px color-mix(in srgb, var(--tAccent) 38%, transparent),
      0 10px 18px rgba(0,0,0,0.35);
  opacity: 0.95;
}

.spine__body {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.35rem;
}

.spine__name {
  font-family: $font-serif;
  letter-spacing: 0.02em;
}

.spine__desc {
  opacity: 0.78;
  font-size: 0.9rem;
  line-height: 1.35;
}

/* A tiny runic band near the bottom edge */
.spine__runes {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.55rem;
  height: 18px;
  pointer-events: none;
  opacity: 0.55;
  z-index: 1;

  background:
      linear-gradient(90deg,
          transparent 0%,
          color-mix(in srgb, var(--tAccent) 26%, transparent) 15%,
          rgba(255,255,255,0.06) 35%,
          color-mix(in srgb, var(--tAccent) 18%, transparent) 55%,
          transparent 100%
      );
  filter: blur(0.1px);
}

/* Slightly different “resting” angles for physical realism */
.spine--tilt0 { transform: rotate(-0.25deg); }
.spine--tilt1 { transform: rotate(0.18deg); }
.spine--tilt2 { transform: rotate(-0.12deg); }

.spine:hover {
  transform: translateY(-2px) rotate(-0.35deg);
  box-shadow:
      0 22px 52px rgba(0,0,0,0.58),
      0 0 34px color-mix(in srgb, var(--tAccent) 18%, transparent),
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -1px 0 rgba(0,0,0,0.40);

  background:
      linear-gradient(90deg,
          rgba(255,255,255,0.00) 0%,
          rgba(255,255,255,0.10) 18%,
          rgba(255,255,255,0.03) 55%,
          rgba(255,255,255,0.00) 100%
      ),
      radial-gradient(circle at 22% 28%, color-mix(in srgb, var(--tAccent) 42%, transparent), transparent 64%),
      linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)),
      rgba(255, 255, 255, 0.035);
}

@media (prefers-reduced-motion: reduce) {
  .spine { transition: none; }
  .spine:hover { transform: none; }
}
</style>
