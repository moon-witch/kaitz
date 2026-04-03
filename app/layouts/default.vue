<script setup lang="ts">
import RuneCompass from "~/components/RuneCompass.vue";
import RuneMenu from "~/components/RuneMenu.vue";
import EntranceSequence from "~/components/EntranceSequence.vue";

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};

const route = useRoute();
const isHall = computed(() => route.path === '/');

const showScrollTop = ref(false);

if (process.client) {
  window.addEventListener("scroll", () => {
    showScrollTop.value = window.scrollY > 300;
  }, { passive: true });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="app">
    <EntranceSequence />

    <div class="bg">
      <div class="bg__base"></div>
      <div class="bg__grain" aria-hidden="true"></div>
      <div class="bg__accent"></div>
      <div class="bg__moon"></div>
      <div class="bg__floor" aria-hidden="true"></div>
    </div>

    <RuneCompass :open="menuOpen" @click="toggleMenu" />
    <RuneMenu :open="menuOpen" @close="closeMenu" />

    <main class="main" :class="{ 'main--hall': isHall }">
      <slot />
    </main>

    <footer v-if="!isHall" class="footer">
      <div class="footer__inner">
        <NuxtLink to="/about">Über den Autor</NuxtLink>
        <NuxtLink to="/imprint">Impressum</NuxtLink>
        <NuxtLink to="/privacy">Datenschutz</NuxtLink>
      </div>
    </footer>

    <Transition name="scrolltop">
      <button
        v-if="showScrollTop"
        class="scroll-top"
        aria-label="Zurück nach oben"
        @click="scrollToTop"
      >
        <span class="scroll-top__arrow" aria-hidden="true"></span>
      </button>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100svh;
  overflow-x: hidden;
  width: 100dvw;
  display: flex;
  flex-direction: column;
  position: relative;
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
  flex: 1;

  &--hall {
    padding: 0;
    max-width: none;
  }
}

.footer {
  position: relative;
  margin-top: auto;
  padding: 1.5rem 1.5rem 1rem;
  font-size: 0.88rem;
  font-family: $font-serif;
  font-style: italic;
  letter-spacing: 0.02em;
  color: rgba($moon-100, 0.68);

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

// ── Scroll-to-top ─────────────────────────────────────────────────────────────

.scroll-top {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 20;

  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba($accent-500, 0.30);
  background: rgba($ink-800, 0.82);
  backdrop-filter: blur(6px);
  cursor: pointer;
  padding: 0;

  display: grid;
  place-items: center;

  box-shadow:
    0 0 14px rgba($accent-500, 0.18),
    0 4px 16px rgba(0, 0, 0, 0.55);

  transition:
    background  220ms ease,
    box-shadow  220ms ease,
    border-color 220ms ease;

  &:hover {
    background: rgba($ink-800, 0.95);
    border-color: rgba($accent-500, 0.60);
    box-shadow:
      0 0 22px rgba($accent-500, 0.35),
      0 4px 20px rgba(0, 0, 0, 0.60);
  }
}

.scroll-top__arrow {
  display: block;
  width: 9px;
  height: 9px;
  border-top:   1.5px solid rgba($moon-100, 0.80);
  border-right: 1.5px solid rgba($moon-100, 0.80);
  /* translateY first (screen space), then rotate — keeps it centered */
  transform: translateY(2px) rotate(-45deg);
}

// Fade + slide transition
.scrolltop-enter-active,
.scrolltop-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}
.scrolltop-enter-from,
.scrolltop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>