<template>
  <section class="frame">
    <slot />
  </section>
</template>

<style scoped lang="scss">
.frame {
  border-radius: $radius-frame;
  box-shadow: $shadow-soft;
  background: rgba(255,255,255,0.05);
  @include subtle-border;
  padding: 1.5rem;
}
</style>
