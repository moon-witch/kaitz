<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <header class="hallHeader">
    <div class="hallHeader__title">
      <h1 class="hallHeader__h1">{{ title ?? "Zentrale Halle" }}</h1>
      <p class="hallHeader__sub">
        {{ subtitle ?? "Neuigkeiten, Notizen und Geschichten – gesammelt im Archiv." }}
      </p>
    </div>
  </header>
</template>

<style scoped lang="scss">
.hallHeader {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.hallHeader__h1 {
  font-family: $font-serif;
  font-size: 1.6rem;
  letter-spacing: 0.03em;
  margin: 0;
}

.hallHeader__sub {
  margin: 0.35rem 0 0;
  opacity: 0.78;
  max-width: 52ch;
  width: 60%;
}

.hallHeader__hint {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-family: $font-sans;
  font-size: 0.9rem;
  opacity: 0.75;
  user-select: none;
}

.hallHeader__sigil {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba($accent-500, 0.7);
  box-shadow: 0 0 18px rgba($accent-500, 0.35);
}
</style>
