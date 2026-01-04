<script setup lang="ts">
import ParchmentSurface from "~/components/ui/ParchmentSurface.vue";

type Story = {
  id: number | string;
  title: string;
  slug: string;
  synopsis?: string;
  featured?: boolean;
  series?: any;
  theme?: any;
};

const props = defineProps<{
  stories: Story[] | null | undefined;
}>();

const featuredStory = computed(() => {
  const list = props.stories ?? [];
  return list.find((s) => s.featured) ?? list[0] ?? null;
});
</script>

<template>
  <div class="plinthFrame" aria-label="Hervorgehobene Story">
    <div class="plinthFrame__head">
      <div class="plinthFrame__plaque">
        <span class="plinthFrame__sigil" aria-hidden="true"></span>
        <span class="plinthFrame__label">Hervorgehobene Story</span>
      </div>

      <NuxtLink
          v-if="featuredStory"
          class="plinthFrame__more"
          :to="`/story/${featuredStory.slug}`"
      >
        Lesen
      </NuxtLink>
    </div>

    <div class="plinthFrame__body">
      <ParchmentSurface>
        <div v-if="featuredStory" class="pedestal">
          <div class="pedestal__halo" aria-hidden="true"></div>
          <div class="pedestal__crest" aria-hidden="true"></div>

          <div class="pedestal__body">
            <h3 class="pedestal__title">{{ featuredStory.title }}</h3>
            <p v-if="featuredStory.synopsis" class="pedestal__synopsis">{{ featuredStory.synopsis }}</p>

            <div class="pedestal__footer" aria-hidden="true">
              <div class="pedestal__rule"></div>
              <div class="pedestal__gem"></div>
              <div class="pedestal__rule"></div>
            </div>
          </div>
        </div>

        <div v-else class="empty">Noch keine Story verfügbar.</div>
      </ParchmentSurface>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Frame: “stone plinth” + cold moonlight + arcane bloom */
.plinthFrame {
  border-radius: 18px;
  overflow: hidden;
  position: relative;

  background:
      radial-gradient(circle at 14% 18%, rgba($accent-500, 0.12), transparent 58%),
      radial-gradient(circle at 88% 12%, rgba($moon-100, 0.07), transparent 62%),
      linear-gradient(180deg, rgba(40, 40, 52, 0.20), rgba(12, 10, 16, 0.38)),
      rgba(10, 6, 18, 0.36);

  border: 1px solid rgba(255, 255, 255, 0.09);

  box-shadow:
      0 20px 50px rgba(0,0,0,0.56),
      inset 0 1px 0 rgba(255,255,255,0.08),
      inset 0 -1px 0 rgba(0,0,0,0.52);
}

/* Stone vignette + faint “carving” sheen */
.plinthFrame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.42;

  background:
      radial-gradient(circle at 22% 30%, rgba(255,255,255,0.05), transparent 58%),
      radial-gradient(circle at 70% 70%, rgba(0,0,0,0.16), transparent 55%),
      linear-gradient(90deg, rgba(255,255,255,0.04), transparent 35%, rgba(255,255,255,0.03));

  mix-blend-mode: screen;
}

.plinthFrame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
      radial-gradient(circle at 50% 26%, rgba(0,0,0,0), rgba(0,0,0,0.42) 72%);
  opacity: 0.55;
}

.plinthFrame__head {
  position: relative;
  z-index: 1;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0.85rem 0.95rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  background:
      linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0));
}

.plinthFrame__plaque {
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

.plinthFrame__sigil {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba($accent-500, 0.85);
  box-shadow: 0 0 16px rgba($accent-500, 0.45);
}

.plinthFrame__label {
  font-size: 0.95rem;
}

.plinthFrame__more {
  position: relative;
  z-index: 1;

  font-family: $font-sans;
  font-size: 0.9rem;
  text-decoration: none;
  color: rgba($moon-100, 0.92);
  opacity: 0.82;

  &:hover { opacity: 1; }
}

.plinthFrame__body {
  position: relative;
  z-index: 1;
  padding: 0.95rem;
}

/* The featured story content behaves like a relic on a pedestal */
.pedestal {
  position: relative;
}

/* Subtle halo behind content (gives “artifact presence”) */
.pedestal__halo {
  position: absolute;
  inset: -80px -80px auto auto;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  pointer-events: none;

  background:
      radial-gradient(circle at 35% 35%, rgba($accent-500, 0.18), transparent 62%),
      radial-gradient(circle at 55% 55%, rgba($moon-100, 0.08), transparent 66%);

  filter: blur(0.4px);
  opacity: 0.9;
}

/* Crest glint (more “magical” than a flat circle) */
.pedestal__crest {
  position: absolute;
  inset: -70px -70px auto auto;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  pointer-events: none;

  background:
      radial-gradient(circle at 30% 30%, rgba($accent-500, 0.22), transparent 60%),
      radial-gradient(circle at 56% 58%, rgba($moon-100, 0.10), transparent 62%),
      linear-gradient(115deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.00) 70%);

  opacity: 0.95;
}

.pedestal__title {
  margin: 0;
  font-family: $font-serif;
  font-size: 1.28rem;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(0,0,0,0.35);
}

.pedestal__synopsis {
  margin: 0.65rem 0 0;
  opacity: 0.84;
  line-height: 1.55;
  max-width: 62ch;
}

/* Meta tags feel like small brass labels */
.pedestal__meta {
  margin-top: 0.95rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.metaPill {
  font-size: 0.82rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;

  background:
      radial-gradient(circle at 20% 20%, rgba($accent-500,0.14), transparent 55%),
      rgba(255, 255, 255, 0.05);

  border: 1px solid rgba(255, 255, 255, 0.08);
  opacity: 0.9;
}

.metaPill--glow {
  box-shadow: 0 0 18px rgba($accent-500, 0.12);
}

/* Decorative archival footer */
.pedestal__footer {
  margin-top: 0.95rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.65rem;
  opacity: 0.70;
}

.pedestal__rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba($accent-500, 0.32), transparent);
}

.pedestal__gem {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba($accent-500, 0.55);
  box-shadow: 0 0 16px rgba($accent-500, 0.25);
}

.empty {
  opacity: 0.75;
}
</style>
