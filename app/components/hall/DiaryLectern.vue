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
      <ParchmentSurface>
        <div v-if="latest" class="lectern">
          <h3 class="lectern__title">{{ latest.title }}</h3>

          <div class="lectern__excerpt">
            <span class="lectern__fade" aria-hidden="true"></span>
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
/* Frame: suggests a wooden lectern in low light (no images) */
.lecternFrame {
  border-radius: 18px;
  overflow: hidden;
  position: relative;

  background:
      radial-gradient(circle at 16% 20%, rgba($accent-500, 0.10), transparent 58%),
      radial-gradient(circle at 88% 12%, rgba($moon-100, 0.06), transparent 60%),
      linear-gradient(180deg, rgba(110, 66, 32, 0.16), rgba(18, 10, 8, 0.32)),
      rgba(10, 6, 18, 0.34);

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow:
      0 18px 46px rgba(0,0,0,0.52),
      inset 0 1px 0 rgba(255,255,255,0.08),
      inset 0 -1px 0 rgba(0,0,0,0.48);
}

/* Soft internal vignette */
.lecternFrame::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
      radial-gradient(circle at 50% 28%, rgba(0,0,0,0), rgba(0,0,0,0.38) 72%);
  opacity: 0.55;
}

/* Head: brass plaque + candle sheen */
.lecternFrame__head {
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

.lecternFrame__plaque {
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

.lecternFrame__sigil {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba($accent-500, 0.85);
  box-shadow: 0 0 16px rgba($accent-500, 0.45);
}

.lecternFrame__label {
  font-size: 0.95rem;
}

.lecternFrame__more {
  position: relative;
  z-index: 1;

  font-family: $font-sans;
  font-size: 0.9rem;
  text-decoration: none;
  color: rgba($moon-100, 0.92);
  opacity: 0.82;

  &:hover { opacity: 1; }
}

.lecternFrame__body {
  position: relative;
  z-index: 1;
  padding: 0.95rem;
}

/* Content on parchment remains, but typography becomes “manuscript-like” */
.lectern__title {
  margin: 0;
  font-family: $font-serif;
  font-size: 1.18rem;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(0,0,0,0.35);
}

.lectern__excerpt {
  margin-top: 0.85rem;
  position: relative;
  max-height: 11rem;
  overflow: hidden;
}

/* Fade that matches parchment more than the page background */
.lectern__fade {
  position: absolute;
  inset: auto 0 0 0;
  height: 5.8rem;
  background: linear-gradient(to bottom, rgba(10,6,18,0.25), rgba(0,0,0,0));
  pointer-events: none;
}

/* Decorative footer rule – gives “archival manuscript” finishing */
.lectern__footer {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.65rem;
  opacity: 0.7;
}

.lectern__rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba($accent-500, 0.32), transparent);
}

.lectern__runeDot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba($accent-500, 0.55);
  box-shadow: 0 0 14px rgba($accent-500, 0.25);
}

/* Empty */
.empty {
  opacity: 0.75;
}

/* WYSIWYG refinement for “handwritten archive” feel */
.wysiwyg :deep(p) {
  margin: 0 0 0.75rem;
  line-height: 1.55;
  opacity: 0.92;
  padding: 1rem;
}

.wysiwyg :deep(em) {
  opacity: 0.95;
}

.wysiwyg :deep(a) {
  color: rgba($moon-100, 0.95);
  text-decoration: underline;
  text-decoration-color: rgba($accent-500, 0.35);

  &:hover {
    text-decoration-color: rgba($accent-500, 0.55);
  }
}
</style>
