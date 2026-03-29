<script setup lang="ts">
import ParchmentSurface from "~/components/ui/ParchmentSurface.vue";

type DiaryEntry = {
  id: number | string;
  title: string;
  slug: string;
  content?: string;
};

const props = defineProps<{
  entries: DiaryEntry[] | null | undefined;
}>();

const latest = computed(() => (props.entries ?? [])[0] ?? null);
</script>

<template>
  <div class="lecternFrame" aria-label="Autorentagebuch">
    <div class="lecternFrame__head">
      <div class="lecternFrame__plaque">
        <span class="lecternFrame__sigil" aria-hidden="true"></span>
        <span class="lecternFrame__label">Autorentagebuch</span>
      </div>

      <NuxtLink v-if="latest" class="lecternFrame__more" :to="`/diary/${latest.slug}`">Öffnen</NuxtLink>
    </div>

    <div class="lecternFrame__body">
      <!-- Candle flame decoration on the side -->
      <div class="lecternFrame__candle" aria-hidden="true">
        <div class="lecternFrame__flame"></div>
        <div class="lecternFrame__wick"></div>
      </div>

      <ParchmentSurface>
        <div v-if="latest" class="lectern">
          <h3 class="lectern__title">{{ latest.title }}</h3>

          <div class="lectern__excerpt">
            <div class="wysiwyg" v-html="latest.content"></div>
          </div>

          <div class="lectern__footer" aria-hidden="true">
            <div class="lectern__rule"></div>
            <div class="lectern__runeDot"></div>
            <div class="lectern__rule"></div>
          </div>
        </div>

        <div v-else class="empty">Noch kein Tagebucheintrag verfügbar.</div>
      </ParchmentSurface>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Frame: deep walnut writing desk — warm, dark, worn wood
.lecternFrame {
  @include card-frame;

  background:
    radial-gradient(circle at 16% 20%, rgba($accent-500, 0.10), transparent 58%),
    radial-gradient(circle at 88% 12%, rgba($moon-100, 0.06), transparent 60%),
    linear-gradient(180deg, rgba(110, 66, 32, 0.16), rgba(18, 10, 8, 0.32)),
    rgba(10, 6, 18, 0.34);
}

// Wood grain highlight on desk surface
.lecternFrame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.40;

  background:
    linear-gradient(90deg,
      rgba(255, 220, 130, 0.00) 0%,
      rgba(255, 220, 130, 0.05) 28%,
      rgba(255, 220, 130, 0.02) 65%,
      rgba(255, 220, 130, 0.00) 100%
    );

  mix-blend-mode: screen;
}

// Deep vignette — desk in shadow at edges
.lecternFrame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,0.45) 78%);
  opacity: 0.70;
}

// Head: carved plaque feel
.lecternFrame__head {
  @include card-head;
  border-bottom-color: rgba(180, 120, 40, 0.20);
}

.lecternFrame__plaque {
  @include card-plaque;
}

.lecternFrame__sigil {
  @include sigil-dot($sigil-md);
  @include sigil-pulse(3.2s, 1.1s);
}

.lecternFrame__label {
  font-size: 0.92rem;
  color: rgba($moon-100, $op-ui);
  letter-spacing: 0.04em;
}

.lecternFrame__more {
  @include more-link;
}

.lecternFrame__body {
  position: relative;
  z-index: 1;
  padding: $sp-base;
}

// Decorative candle element in the corner
.lecternFrame__candle {
  position: absolute;
  right: 1.5rem;
  bottom: 1.2rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  pointer-events: none;
}

.lecternFrame__flame {
  width: 8px;
  height: 14px;
  border-radius: 50% 50% 30% 30% / 60% 60% 40% 40%;

  background: radial-gradient(ellipse at 50% 30%, rgba($candle-bright, 1.0), rgba($accent-500, 0.85) 60%, transparent 100%);

  box-shadow:
    0 0 12px rgba($accent-500, 0.65),
    0 0 28px rgba($candle-bright, 0.25);

  // flameDance handles shape; arcaneFlicker adds irregular intensity
  animation:
    flameDance    3s   ease-in-out infinite alternate,
    arcaneFlicker 4.8s ease-in-out 0.3s infinite;
  will-change: transform, opacity, filter;
}

.lecternFrame__wick {
  width: 2px;
  height: 10px;
  background: linear-gradient(to bottom, rgba(80,40,10,0.90), rgba(30,15,5,0.70));
  border-radius: 1px;
}

@keyframes flameDance {
  0%   { transform: scaleX(1.00) scaleY(1.00) rotate(0deg);   opacity: 0.90; }
  20%  { transform: scaleX(0.88) scaleY(1.08) rotate(-1.5deg); opacity: 0.82; }
  40%  { transform: scaleX(1.04) scaleY(0.95) rotate(1deg);   opacity: 0.95; }
  65%  { transform: scaleX(0.92) scaleY(1.06) rotate(-0.8deg); opacity: 0.86; }
  80%  { transform: scaleX(1.06) scaleY(0.96) rotate(1.2deg); opacity: 0.92; }
  100% { transform: scaleX(0.94) scaleY(1.04) rotate(-0.5deg); opacity: 0.88; }
}

.lectern__title {
  margin: 0;
  font-family: $font-serif;
  font-size: 1.18rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: $ink-text;
}

// Fade bottom via CSS mask — no visible overlay element
.lectern__excerpt {
  margin-top: $sp-md;
  position: relative;
  max-height: 10rem;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
}

.lectern__footer {
  margin-top: $sp-md;
  @include rule-divider;
}

.lectern__rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba($accent-500, 0.38), transparent);
}

.lectern__runeDot {
  width: $sigil-sm;
  height: $sigil-sm;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, rgba($candle-bright, 0.90), rgba($accent-500, 0.70));
  box-shadow: 0 0 12px rgba($accent-500, 0.35);
}

.empty {
  opacity: 0.70;
  color: rgba($ink-text, 0.70);
}

// WYSIWYG text — dark ink on parchment
.wysiwyg :deep(p) {
  margin: 0 0 0.75rem;
  line-height: 1.58;
  color: rgba($ink-text, $op-body);
  padding: 0;
}

.wysiwyg :deep(em) {
  opacity: 0.92;
}

.wysiwyg :deep(a) {
  color: rgba($accent-500, 0.95);
  text-decoration: underline;
  text-decoration-color: rgba($accent-500, 0.45);

  &:hover {
    text-decoration-color: rgba($accent-500, 0.75);
    color: $candle-bright;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lecternFrame__flame {
    animation: none;
  }
  .lecternFrame__sigil {
    animation: none;
  }
}
</style>
