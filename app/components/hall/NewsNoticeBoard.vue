<script setup lang="ts">
type News = {
  id: number | string;
  title: string;
  slug: string;
  featured?: boolean;
};

const props = defineProps<{
  news: News[] | null | undefined;
  limit?: number;
}>();

const featured = computed(() => (props.news ?? []).filter((n) => n.featured).slice(0, 2));
const list = computed(() => (props.news ?? []).slice(0, props.limit ?? 6));
</script>

<template>
  <div class="boardFrame" aria-label="News">
    <div class="boardFrame__head">
      <div class="boardFrame__plaque">
        <span class="boardFrame__plaqueRune" aria-hidden="true"></span>
        <span class="boardFrame__plaqueText">Nachrichtenbrett</span>
      </div>

      <NuxtLink class="boardFrame__more" to="/news">Alle</NuxtLink>
    </div>

    <div class="board">
      <div v-if="featured.length" class="board__featured">
        <NuxtLink
            v-for="(n, i) in featured"
            :key="n.id"
            class="note note--featured"
            :class="`note--tilt${i}`"
            :to="`/news/${n.slug}`"
        >
          <div class="note__pin" aria-hidden="true"></div>
          <div class="note__wax" aria-hidden="true"></div>
          <div class="note__title">{{ n.title }}</div>
        </NuxtLink>
      </div>

      <div class="board__list">
        <NuxtLink
            v-for="(n, i) in list"
            :key="n.id"
            class="note"
            :class="`note--tilt${i % 3}`"
            :to="`/news/${n.slug}`"
        >
          <div class="note__pin" aria-hidden="true"></div>
          <div class="note__title">{{ n.title }}</div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Frame: heavy wooden cork-board frame
.boardFrame {
  @include card-frame;
  margin-top: 1rem;
  height: 30rem;

  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.05), transparent 60%),
    radial-gradient(circle at 90% 10%, rgba($accent-500, 0.10), transparent 55%),
    linear-gradient(180deg, rgba(110, 66, 32, 0.22), rgba(30, 18, 12, 0.30)),
    rgba(10, 6, 18, 0.38);
}

// Varnish + subtle grain
.boardFrame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.40;

  background:
    linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 32%,
      rgba(255, 255, 255, 0.03) 64%,
      transparent 100%
    ),
    radial-gradient(circle at 12% 18%, rgba($accent-500, 0.13), transparent 58%),
    radial-gradient(circle at 72% 62%, rgba(255, 255, 255, 0.05), transparent 60%);

  mix-blend-mode: screen;
}

// Inner shadow — cork board depth
.boardFrame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.40);
}

.boardFrame__head {
  @include card-head;
  background: linear-gradient(180deg, rgba(0,0,0,0.30), rgba(0,0,0,0.08));
  border-bottom-color: rgba(180, 120, 40, 0.22);
}

.boardFrame__plaque {
  @include card-plaque;
}

.boardFrame__plaqueRune {
  @include sigil-dot($sigil-md);
}

.boardFrame__plaqueText {
  font-size: 0.92rem;
  color: rgba($moon-100, $op-ui);
  letter-spacing: 0.04em;
}

.boardFrame__more {
  @include more-link;
}

.board {
  position: relative;
  z-index: 1;
  padding: 0.95rem;
}

.board__featured {
  display: grid;
  gap: 0.65rem;
  margin-bottom: 0.9rem;
}

.board__list {
  display: grid;
  gap: 0.6rem;
}

// Notes: actual parchment paper slips pinned to the cork board
.note {
  position: relative;
  display: block;
  text-decoration: none;

  // Hand-torn paper edges — irregular corners
  border-radius: 3px 1px 4px 2px / 1px 3px 2px 3px;
  padding: 0.75rem 0.85rem 0.78rem 2.1rem;

  // Parchment paper background
  background:
    radial-gradient(ellipse at 18% 12%, rgba(255, 248, 225, 0.20), transparent 42%),
    radial-gradient(ellipse at 85% 88%, rgba(110, 65, 18, 0.18), transparent 38%),
    linear-gradient(165deg, #d2b07e 0%, #c4a268 50%, #b08848 100%);

  // Dark ink text on parchment
  color: rgba($ink-text, 0.92);

  border: 1px solid rgba(100, 62, 18, 0.38);

  box-shadow:
    0 5px 18px rgba(0, 0, 0, 0.48),
    0 2px 5px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 248, 220, 0.32);

  transform-origin: 18% 12%;
  transition:
    transform 220ms ease,
    box-shadow 260ms ease;
}

// Paper fiber grain on each note
.note::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 3px 1px 4px 2px / 1px 3px 2px 3px;
  pointer-events: none;

  background:
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 4px,
      rgba(130, 80, 20, 0.05) 4px,
      rgba(130, 80, 20, 0.05) 5px
    );

  opacity: 0.70;
  mix-blend-mode: multiply;
}

// Brass thumbtack / copper pin
.note__pin {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: $sigil-sm;
  height: $sigil-sm;
  border-radius: 999px;

  background: radial-gradient(circle at 32% 28%, rgba(255, 225, 100, 0.95), rgba(180, 110, 20, 0.90));
  box-shadow:
    0 0 10px rgba($accent-500, 0.40),
    0 0 3px rgba($candle-bright, 0.50),
    0 4px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 240, 180, 0.60);
}

// Wax seal (featured only) — deep burgundy/arcane
.note__wax {
  display: none;
}

.note--featured .note__wax {
  display: block;
  position: absolute;
  right: 10px;
  top: 8px;
  width: 20px;
  height: 20px;
  border-radius: 999px;

  background:
    radial-gradient(circle at 32% 28%, rgba(200, 80, 80, 0.50), transparent 50%),
    radial-gradient(circle at 62% 65%, rgba($arcane-500, 0.35), transparent 55%),
    rgba(140, 35, 35, 0.55);

  box-shadow:
    0 0 12px rgba(180, 40, 40, 0.22),
    inset 0 1px 0 rgba(255, 160, 160, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35);
}

.note__title {
  font-family: $font-serif;
  font-size: 0.95rem;
  line-height: 1.38;
  color: rgba($ink-text, 0.92);
}

// Featured notes: slightly larger + warm emphasis
.note--featured {
  background:
    radial-gradient(ellipse at 18% 12%, rgba(255, 248, 225, 0.24), transparent 42%),
    radial-gradient(ellipse at 82% 88%, rgba(110, 65, 18, 0.22), transparent 38%),
    linear-gradient(165deg, #d8b888 0%, #caa870 45%, #b69050 100%);

  box-shadow:
    0 7px 22px rgba(0, 0, 0, 0.52),
    0 0 18px rgba($accent-500, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 248, 220, 0.38);
}

// Pinned at natural angles
.note--tilt0 { transform: rotate(-0.40deg); }
.note--tilt1 { transform: rotate(0.30deg); }
.note--tilt2 { transform: rotate(-0.20deg); }

.note:hover {
  transform: rotate(-0.6deg) translateY(-2px);
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.58),
    0 0 22px rgba($accent-500, 0.10),
    0 3px 8px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 248, 220, 0.38);
}

@media (prefers-reduced-motion: reduce) {
  .note { transition: none; }
  .note:hover { transform: none; }
}
</style>
