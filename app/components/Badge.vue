<template>
  <span class="badge">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  padding: 0.15rem 0.5rem;
  font-family: $font-sans;
  font-size: 0.75rem;
}
</style>
