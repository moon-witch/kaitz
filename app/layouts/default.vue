<script setup lang="ts">
import RuneCompass from "~/components/RuneCompass.vue";
import RuneMenu from "~/components/RuneMenu.vue";

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};
</script>

<template>
  <div class="app">
    <div class="bg">
      <div class="bg__base"></div>
      <div class="bg__accent"></div>
      <div class="bg__moon"></div>
    </div>

    <RuneCompass :open="menuOpen" @click="toggleMenu" />
    <RuneMenu :open="menuOpen" @close="closeMenu" />

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <div class="footer__inner">
        <NuxtLink to="/about">Über</NuxtLink>
        <NuxtLink to="/imprint">Impressum</NuxtLink>
        <NuxtLink to="/privacy">Datenschutz</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  overflow-x: hidden;
  width: 100dvw;
}

.bg {
  position: fixed;
  inset: 0;
  z-index: $z-bg;

  &__base {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, $ink-900, $ink-950);
  }

  &__accent {
    position: absolute;
    inset: 0;
    opacity: 0.30;
    background: radial-gradient(circle at 30% 20%, rgba($accent-500, 0.25), transparent 55%);
  }

  &__moon {
    position: absolute;
    inset: 0;
    opacity: 0.20;
    background: radial-gradient(circle at 70% 10%, rgba($moon-100, 0.18), transparent 60%);
  }
}

.brand {
  font-family: $font-serif;
  letter-spacing: 0.04em;
  font-size: 1.05rem;
}

.nav {
  display: flex;
  gap: 1rem;
  font-family: $font-sans;
  font-size: 0.9rem;
  opacity: 0.9;

  a:hover {
    opacity: 1;
  }
}

.main {
  @include container;
  padding: 2rem 0 0 0;
}

.footer {
  opacity: 0.7;
  font-size: 0.9rem;

  &__inner {
    @include container;
    padding: 2.5rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>