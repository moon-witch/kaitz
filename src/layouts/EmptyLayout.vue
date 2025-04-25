<script setup lang="ts">

</script>

<template>
  <div>
    <main class="empty-layout">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.empty-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  background: $purple;
}
</style>
