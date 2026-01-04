<template>
  <div class="app">
    <div class="bg">
      <div class="bg__base"></div>
      <div class="bg__accent"></div>
      <div class="bg__moon"></div>
    </div>

    <header class="header">
      <div class="header__inner">
        <NuxtLink to="/" class="brand">Archiv</NuxtLink>

        <nav class="nav">
          <NuxtLink to="/news">News</NuxtLink>
          <NuxtLink to="/diary">Tagebuch</NuxtLink>
          <NuxtLink to="/stories">Stories</NuxtLink>
        </nav>
      </div>
    </header>

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

.header {
  position: sticky;
  top: 0;
  z-index: $z-header;
  @include glass;
  border-bottom: 1px solid rgba(255,255,255,0.05);

  &__inner {
    @include container;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
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
  padding: 2.5rem 0;
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
