<script setup lang="ts">
defineProps<{
  title: string;
  moreLabel?: string;
  moreTo?: string;
}>();
</script>

<template>
  <section class="hallCard">
    <div class="hallCard__cap">
      <h2 class="hallCard__h2">{{ title }}</h2>
      <NuxtLink v-if="moreTo" class="hallCard__more" :to="moreTo">{{ moreLabel ?? "Mehr" }}</NuxtLink>
    </div>

    <div class="hallCard__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.hallCard {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: $shadow-soft;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.hallCard__cap {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.hallCard__h2 {
  margin: 0;
  font-size: 1rem;
  letter-spacing: 0.04em;
}

.hallCard__more {
  font-size: 0.9rem;
  opacity: 0.85;
  text-decoration: none;

  &:hover { opacity: 1; }
}

.hallCard__body {
  padding: 1.05rem 1rem 1.15rem;
}
</style>
