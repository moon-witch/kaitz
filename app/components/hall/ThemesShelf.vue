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

    <!-- Carved shelf plank -->
    <div class="shelf__plank" aria-hidden="true"></div>

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

        <div class="spine__base" aria-hidden="true"></div>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
// Shelf: heavy wooden bookshelf with carved paneling
.shelf {
  margin-top: 1.35rem;
  padding: 1rem 1rem 0.65rem;
  border-radius: $radius-md;
  position: relative;
  overflow: hidden;

  // Deep walnut wood
  background:
    radial-gradient(circle at 16% 18%, rgba($accent-500, 0.10), transparent 60%),
    linear-gradient(180deg, rgba(110, 66, 32, 0.14), rgba(12, 10, 16, 0.42)),
    rgba(10, 6, 18, 0.34);

  // Carved wood frame inset shadow
  border: 1px solid rgba(200, 140, 50, 0.14);
  box-shadow:
    0 20px 52px rgba(0,0,0,0.62),
    inset 0 2px 0 rgba(255, 220, 130, 0.12),
    inset 0 -2px 0 rgba(0, 0, 0, 0.55),
    inset 2px 0 0 rgba(255, 220, 130, 0.06),
    inset -2px 0 0 rgba(0, 0, 0, 0.25);
}

// Top wood grain sheen
.shelf::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.40;

  background:
    radial-gradient(ellipse at 82% 16%, rgba($moon-100, 0.07), transparent 55%),
    radial-gradient(ellipse at 12% 70%, rgba(0,0,0,0.20), transparent 48%);

  mix-blend-mode: screen;
}

// Soft vignette
.shelf::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,0.40) 78%);
  opacity: 0.60;
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
  padding: 0.32rem 0.6rem;
  border-radius: 3px 2px 4px 2px / 2px 3px 2px 3px;

  background:
    radial-gradient(circle at 22% 30%, rgba($accent-500, 0.18), transparent 55%),
    rgba(255, 255, 255, 0.03);

  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.30);

  border: 1px solid rgba(255, 255, 255, 0.07);
  font-family: $font-serif;
  letter-spacing: 0.04em;
  opacity: 0.95;
}

.shelf__sigil {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba($accent-500, 0.85);
  box-shadow:
    0 0 16px rgba($accent-500, 0.50),
    0 0 4px rgba($candle-bright, 0.25);
}

.shelf__h2 {
  margin: 0;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  color: rgba($moon-100, $op-ui);
}

.shelf__more {
  position: relative;
  z-index: 1;
  font-family: $font-serif;
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.88;
  text-decoration: none;
  color: rgba($accent-500, 0.90);
  letter-spacing: 0.02em;

  &:hover { opacity: 1; color: $candle-bright; }
}

// Shelf plank
.shelf__plank {
  position: relative;
  z-index: 3;
  height: 8px;
  margin: 0 -1rem;
  order: 99;

  background: linear-gradient(180deg, rgba(60, 35, 12, 0.92), rgba(30, 18, 6, 0.96));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.shelf__row {
  position: relative;
  z-index: 1;

  display: grid;
  gap: 0.9rem;
  padding-bottom: 0.9rem;

  @media (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

// Book spine cards: leather/cloth binding feel
.spine {
  --tAccent: #c8821a;  // default to amber if no theme color

  position: relative;
  overflow: hidden;

  border-radius: 4px 4px 2px 2px;
  padding: 0.9rem 0.9rem 0.85rem;

  text-decoration: none;
  color: rgba($moon-100, 0.96);

  // Leather/cloth cover with worn gloss
  background:
    // Highlight strip — worn leather gloss
    linear-gradient(90deg,
      rgba(255,255,255,0.00) 0%,
      rgba(255,255,255,0.07) 22%,
      rgba(255,255,255,0.02) 60%,
      rgba(255,255,255,0.00) 100%
    ),
    // Accent color bloom (theme color)
    radial-gradient(ellipse at 22% 28%, color-mix(in srgb, var(--tAccent) 38%, rgba(80,40,10,0.4)), transparent 62%),
    // Leather/cloth base with theme color
    linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.15)),
    color-mix(in srgb, var(--tAccent) 22%, rgba(35, 18, 6, 0.88));

  border: 1px solid rgba(200, 140, 50, 0.12);
  border-bottom: none;

  box-shadow:
    0 16px 38px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(255,220,130,0.10),
    inset 0 -1px 0 rgba(0,0,0,0.40);

  transform-origin: 22% 22%;
  transition:
    transform 240ms ease,
    box-shadow 280ms ease;
}

// Embossing on cover
.spine::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.50;

  background:
    radial-gradient(ellipse at 20% 22%, rgba(255,255,255,0.10), transparent 42%),
    radial-gradient(ellipse at 78% 72%, rgba(0,0,0,0.18), transparent 48%);

  mix-blend-mode: overlay;
}

// Inner vignette
.spine::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,0.40) 76%);
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

// Brass/amber gem on spine
.spine__gem {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--tAccent) 55%, rgba($candle-bright, 0.8)), color-mix(in srgb, var(--tAccent) 90%, #111));
  box-shadow:
    0 0 14px color-mix(in srgb, var(--tAccent) 45%, transparent),
    0 8px 16px rgba(0,0,0,0.40),
    inset 0 1px 0 rgba(255,240,180,0.40);
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
  letter-spacing: 0.03em;
  font-size: 0.98rem;
}

.spine__desc {
  opacity: 0.72;
  font-size: 0.88rem;
  line-height: 1.35;
}

// Spine base edge — pressed against shelf
.spine__base {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--tAccent) 20%, rgba(0,0,0,0.5)),
    rgba(0,0,0,0.60)
  );
}

.spine--tilt0 { transform: rotate(-0.30deg); }
.spine--tilt1 { transform: rotate(0.22deg); }
.spine--tilt2 { transform: rotate(-0.15deg); }

.spine:hover {
  transform: translateY(-4px) rotate(-0.40deg);
  box-shadow:
    0 24px 56px rgba(0,0,0,0.62),
    0 0 28px color-mix(in srgb, var(--tAccent) 22%, transparent),
    inset 0 1px 0 rgba(255,220,130,0.14),
    inset 0 -1px 0 rgba(0,0,0,0.45);

  background:
    linear-gradient(90deg,
      rgba(255,255,255,0.00) 0%,
      rgba(255,255,255,0.10) 22%,
      rgba(255,255,255,0.03) 60%,
      rgba(255,255,255,0.00) 100%
    ),
    radial-gradient(ellipse at 22% 28%, color-mix(in srgb, var(--tAccent) 50%, rgba(80,40,10,0.4)), transparent 65%),
    linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.12)),
    color-mix(in srgb, var(--tAccent) 28%, rgba(35, 18, 6, 0.88));
}

@media (prefers-reduced-motion: reduce) {
  .spine { transition: none; }
  .spine:hover { transform: none; }
}
</style>
