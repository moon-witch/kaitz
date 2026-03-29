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
      <div class="bg__grain" aria-hidden="true"></div>
      <div class="bg__accent"></div>
      <div class="bg__moon"></div>
      <div class="bg__floor" aria-hidden="true"></div>
    </div>

    <RuneCompass :open="menuOpen" @click="toggleMenu" />
    <RuneMenu :open="menuOpen" @close="closeMenu" />

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <div class="footer__inner">
        <NuxtLink to="/about">Über den Autor</NuxtLink>
        <NuxtLink to="/imprint">Impressum</NuxtLink>
        <NuxtLink to="/privacy">Datenschutz</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100svh;
  overflow-x: hidden;
  width: 100dvw;
}

.bg {
  position: fixed;
  inset: 0;
  z-index: $z-bg;

  // Deep purple-ink base
  &__base {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, $ink-900, $ink-950);
  }

  // Subtle grain — very faint, keeps the "aged surface" texture
  &__grain {
    position: absolute;
    inset: 0;
    opacity: 1;
    background:
      repeating-linear-gradient(
        88deg,
        transparent 0px,
        transparent 6px,
        rgba(255, 255, 255, 0.004) 6px,
        rgba(255, 255, 255, 0.004) 7px,
        transparent 7px,
        transparent 15px,
        rgba(0, 0, 0, 0.012) 15px,
        rgba(0, 0, 0, 0.012) 16px
      );
  }

  // Arcane bloom — purple from upper-left
  &__accent {
    position: absolute;
    inset: 0;
    opacity: 0.30;
    background: radial-gradient(circle at 30% 20%, rgba($accent-500, 0.25), transparent 55%);
  }

  // Moon glow — silver from upper-right
  &__moon {
    position: absolute;
    inset: 0;
    opacity: 0.20;
    background: radial-gradient(circle at 70% 10%, rgba($moon-100, 0.18), transparent 60%);
  }

  // Deep floor shadow
  &__floor {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, transparent 35%);
  }
}

.main {
  @include container;
  padding: 2rem 0 0 0;
}

.footer {
  opacity: 0.65;
  font-size: 0.88rem;
  font-family: $font-serif;
  font-style: italic;
  position: absolute;
  bottom: .5rem;
  left: 1.5rem;
  letter-spacing: 0.02em;
  color: rgba($moon-100, 0.65);

  @media (min-width: 700px) {
    padding: 1rem;
  }

  &__inner {
    @include container;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  a:hover {
    color: rgba($candle-bright, 0.90);
    opacity: 1;
  }
}
</style>