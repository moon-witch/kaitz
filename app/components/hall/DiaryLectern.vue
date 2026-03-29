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
  @include card-frame;

  background:
      radial-gradient(circle at 16% 20%, rgba($accent-500, 0.10), transparent 58%),
      radial-gradient(circle at 88% 12%, rgba($moon-100, 0.06), transparent 60%),
      linear-gradient(180deg, rgba(110, 66, 32, 0.16), rgba(18, 10, 8, 0.32)),
      rgba(10, 6, 18, 0.34);
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
  @include card-head;
}

.lecternFrame__plaque {
  @include card-plaque;
}

.lecternFrame__sigil {
  @include sigil-dot($sigil-md);
}

.lecternFrame__label {
  font-size: 0.95rem;
}

.lecternFrame__more {
  @include more-link;
}

.lecternFrame__body {
  position: relative;
  z-index: 1;
  padding: $sp-base;
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
  margin-top: $sp-md;
  position: relative;
  max-height: 11rem;
  overflow: hidden;
}

/* Decorative footer rule – gives “archival manuscript” finishing */
.lectern__footer {
  margin-top: $sp-md;
  @include rule-divider;
}

.lectern__rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba($accent-500, 0.32), transparent);
}

.lectern__runeDot {
  width: $sigil-sm;
  height: $sigil-sm;
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
  opacity: $op-body;
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
