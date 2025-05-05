<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  }
})
</script>

<template>
  <li class="nav-item" :class="{ 'active': active }">
    <RouterLink :to="to">{{ label }}</RouterLink>
  </li>
</template>

<style scoped lang="scss">
.nav-item {
  background: transparent;
  margin: 0 .5rem .5rem .5rem;
  border-radius: 10px;
  transition: all $transition;

  &.active {
    background: $white;

    a {
      color: $purple;
    }
  }

  &:hover {
    background: $white;

    a {
      color: $purple;
    }
  }

  a {
    display: block;
    padding: .25rem .5rem;
    text-align: center;
    color: white;
    transition: all $transition;
  }
}
</style>
