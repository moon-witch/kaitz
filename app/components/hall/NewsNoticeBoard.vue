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
/* Frame: wood + lacquer + faint runic varnish */
.boardFrame {
  @include card-frame;
  margin-top: 1rem;
  height: 30rem;

  background:
      radial-gradient(circle at 18% 22%, rgba(255,255,255,0.05), transparent 60%),
      radial-gradient(circle at 90% 10%, rgba($accent-500,0.10), transparent 55%),
      linear-gradient(180deg, rgba(110, 66, 32, 0.22), rgba(30, 18, 12, 0.30)),
      rgba(10, 6, 18, 0.38);
}

/* Varnish + subtle grain */
.boardFrame::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.40;

  background:
      linear-gradient(90deg,
          rgba(255,255,255,0.05) 0%,
          transparent 32%,
          rgba(255,255,255,0.03) 64%,
          transparent 100%
      ),
      radial-gradient(circle at 12% 18%, rgba($accent-500,0.13), transparent 58%),
      radial-gradient(circle at 72% 62%, rgba(255,255,255,0.05), transparent 60%);

  mix-blend-mode: screen;
}

/* Edge vignette for depth */
.boardFrame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
      radial-gradient(circle at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,0.35) 70%);
  opacity: 0.55;
}

.boardFrame__head {
  @include card-head;
}

.boardFrame__plaque {
  @include card-plaque;
}

.boardFrame__plaqueRune {
  @include sigil-dot($sigil-md);
}

.boardFrame__plaqueText {
  font-size: 0.95rem;
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

/* Notes: parchment slips pinned to wood */
.note {
  position: relative;
  display: block;
  text-decoration: none;
  color: rgba($moon-100, 0.96);

  border-radius: $radius-sm;
  padding: 0.75rem 0.8rem 0.75rem 2.1rem;

  background:
      radial-gradient(120% 140% at 18% 18%, rgba(255,255,255,0.10), transparent 55%),
      linear-gradient(180deg, rgba(245,235,210,0.13), rgba(245,235,210,0.05)),
      rgba(255,255,255,0.02);

  border: 1px solid rgba(255,255,255,0.06);

  box-shadow:
      0 14px 30px rgba(0,0,0,0.42),
      inset 0 1px 0 rgba(255,255,255,0.10),
      inset 0 -1px 0 rgba(0,0,0,0.25);

  transform-origin: 18% 18%;
  transition:
      transform 220ms ease,
      box-shadow 260ms ease,
      background 260ms ease;
}

/* Parchment grain + edge wear */
.note::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: $radius-sm;
  pointer-events: none;

  background:
      radial-gradient(circle at 22% 28%, rgba(255,255,255,0.08), transparent 40%),
      radial-gradient(circle at 78% 72%, rgba(0,0,0,0.10), transparent 42%),
      linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.00));

  opacity: 0.55;
  mix-blend-mode: overlay;
}

/* Pin head (glowing rune tack) */
.note__pin {
  @include sigil-dot($sigil-sm);
  position: absolute;
  left: 10px;
  top: 12px;
  box-shadow:
      0 0 18px rgba($accent-500, 0.45),
      0 8px 16px rgba(0, 0, 0, 0.35);
  opacity: $op-ui;
}

/* Wax seal (featured only) */
.note__wax {
  display: none;
}

.note--featured .note__wax {
  display: block;
  position: absolute;
  right: 12px;
  top: 10px;
  width: 18px;
  height: 18px;
  border-radius: 999px;

  background:
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10), transparent 55%),
      radial-gradient(circle at 55% 60%, rgba($accent-500,0.28), transparent 62%),
      rgba(120, 30, 110, 0.22);

  box-shadow:
      0 0 18px rgba($accent-500, 0.18),
      inset 0 1px 0 rgba(255,255,255,0.10),
      inset 0 -1px 0 rgba(0,0,0,0.35);

  opacity: 0.9;
}

.note__title {
  font-size: 0.95rem;
  line-height: 1.35;
  opacity: 0.96;
}

/* Featured notes: more arcane emphasis */
.note--featured {
  background:
      radial-gradient(circle at 18% 25%, rgba($accent-500, 0.22), transparent 60%),
      linear-gradient(180deg, rgba(245,235,210,0.14), rgba(245,235,210,0.06)),
      rgba(255,255,255,0.03);

  box-shadow:
      0 16px 36px rgba(0,0,0,0.46),
      0 0 28px rgba($accent-500, 0.10),
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -1px 0 rgba(0,0,0,0.28);
}

/* “Pinned at angles” variants for physicality */
.note--tilt0 { transform: rotate(-0.35deg); }
.note--tilt1 { transform: rotate(0.25deg); }
.note--tilt2 { transform: rotate(-0.15deg); }

.note:hover {
  transform: rotate(-0.6deg) translateY(-1px);
  box-shadow:
      0 18px 44px rgba(0,0,0,0.52),
      0 0 34px rgba($accent-500, 0.12),
      inset 0 1px 0 rgba(255,255,255,0.13),
      inset 0 -1px 0 rgba(0,0,0,0.32);

  background:
      radial-gradient(circle at 18% 25%, rgba($accent-500, 0.20), transparent 60%),
      linear-gradient(180deg, rgba(245,235,210,0.15), rgba(245,235,210,0.06)),
      rgba(255,255,255,0.035);
}

@media (prefers-reduced-motion: reduce) {
  .note { transition: none; }
  .note:hover { transform: none; }
}
</style>
