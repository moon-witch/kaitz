<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped lang="scss">
.layout {
  .content {
    padding-left: 50px;
  }
}
</style>
