// File: src/components/NavItem.vue
<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps<{ label: string; to: string }>()
</script>

<template>
  <li class="nav-item">
    <RouterLink :to="props.to">{{ props.label }}</RouterLink>
  </li>
</template>

<style scoped lang="scss">
.nav-item {
  background: white;
  margin: 0 .5rem .5rem .5rem;
  border-radius: 10px;
  a { display: block; padding: .25rem .5rem; text-align: center; }
}
</style>
