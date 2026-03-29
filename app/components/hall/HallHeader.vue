<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="hallHeader">
    <div class="hallHeader__ornament" aria-hidden="true">
      <div class="hallHeader__line"></div>
      <div class="hallHeader__gem"></div>
      <div class="hallHeader__line"></div>
    </div>
    <div class="hallHeader__title">
      <h1 class="hallHeader__h1">{{ title ?? "Zentrale Halle" }}</h1>
      <p class="hallHeader__sub">
        {{ subtitle ?? "Neuigkeiten, Notizen und Geschichten – gesammelt im Archiv." }}
      </p>
    </div>
    <div class="hallHeader__ornament" aria-hidden="true">
      <div class="hallHeader__line"></div>
      <div class="hallHeader__gem"></div>
      <div class="hallHeader__line"></div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.hallHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-top: 0.5rem;
}

.hallHeader__ornament {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  max-width: 28rem;
  opacity: $op-dim;
}

.hallHeader__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba($accent-500, 0.45), transparent);
}

.hallHeader__gem {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: radial-gradient(circle at 35% 30%, rgba($candle-bright, 0.90), rgba($accent-500, 0.80));
  box-shadow:
    0 0 12px rgba($accent-500, 0.50),
    0 0 4px rgba($candle-bright, 0.30);
}

.hallHeader__h1 {
  font-family: $font-serif;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  font-weight: 500;
  letter-spacing: 0.08em;
  margin: 0;
  color: $moon-100;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.55),
    0 0 45px rgba($accent-500, 0.16);
}

.hallHeader__sub {
  margin: 0.3rem 0 0;
  font-style: italic;
  letter-spacing: 0.02em;
  max-width: 38ch;
  line-height: 1.5;
  color: $moon-100;
  opacity: 0.88;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.70);
}
</style>
