<script setup lang="ts">

import KaitzLogo from "@/components/KaitzLogo.vue";
</script>

<template>
  <section class="sidebar">
    <div class="logo-wrapper">
      <KaitzLogo />
    </div>
    <ul class="nav">
      <li class="nav-item">
        <RouterLink to="/logo">
          Logo
        </RouterLink>
      </li>
      <li class="nav-item">
        2
      </li>
      <li class="nav-item">
        3
      </li>
      <li class="nav-item">
        4
      </li>
      <li class="nav-item">
        5
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.sidebar {
  background: $purple;
  color: white;
  width: 100px;
  height: 100dvh;
  transition: width 0.2s ease-in-out;
  position: fixed;
  box-shadow: 0 0 5px 0 $purple;

  &:hover {
    width: 150px;
  }

  .logo-wrapper {
    padding: .25rem;
  }

  .nav-item {
    a {
      color: white;
    }
  }
}
</style>
