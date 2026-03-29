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
          <!-- Candle glow behind parchment -->
          <div class="pedestal__glow" aria-hidden="true"></div>

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
// Frame: dark walnut panel with carved-edge inset
.plinthFrame {
  @include card-frame;

  background:
    radial-gradient(circle at 14% 18%, rgba($accent-500, 0.12), transparent 58%),
    radial-gradient(circle at 88% 12%, rgba($moon-100, 0.07), transparent 62%),
    linear-gradient(180deg, rgba(40, 40, 52, 0.20), rgba(12, 10, 16, 0.38)),
    rgba(10, 6, 18, 0.36);
}

// Stone vignette + faint carving sheen
.plinthFrame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.42;

  background:
    radial-gradient(circle at 22% 30%, rgba(255, 255, 255, 0.05), transparent 58%),
    radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.16), transparent 55%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04), transparent 35%, rgba(255, 255, 255, 0.03));

  mix-blend-mode: screen;
}

// Bottom vignette for depth
.plinthFrame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0), rgba(0,0,0,0.45) 75%);
  opacity: 0.65;
}

.plinthFrame__head {
  @include card-head;
}

.plinthFrame__plaque {
  @include card-plaque;
}

.plinthFrame__sigil {
  @include sigil-dot($sigil-md);
}

.plinthFrame__label {
  font-size: 0.92rem;
  color: rgba($moon-100, $op-ui);
  letter-spacing: 0.04em;
}

.plinthFrame__more {
  @include more-link;
}

.plinthFrame__body {
  position: relative;
  z-index: 1;
  padding: $sp-base;
}

.pedestal {
  position: relative;
}

// Amber candle glow visible through parchment edges
.pedestal__glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle at 62% 30%, rgba($accent-500, 0.14), transparent 60%);
  filter: blur(8px);
  opacity: 0.8;
}

.pedestal__title {
  margin: 0;
  font-family: $font-serif;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: $ink-text;
  text-shadow: 0 1px 0 rgba(255,255,255,0.12);
}

.pedestal__synopsis {
  margin: 0.65rem 0 0;
  opacity: 0.80;
  line-height: 1.58;
  max-width: 62ch;
  color: rgba($ink-text, 0.85);
  font-size: 0.96rem;
}

.pedestal__footer {
  margin-top: $sp-base;
  @include rule-divider;
}

.pedestal__rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba($accent-500, 0.38), transparent);
}

.pedestal__gem {
  width: $sigil-md;
  height: $sigil-md;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, rgba($candle-bright, 0.90), rgba($accent-500, 0.70));
  box-shadow: 0 0 14px rgba($accent-500, 0.35);
}

.empty {
  opacity: 0.70;
  color: rgba($ink-text, 0.70);
}
</style>
