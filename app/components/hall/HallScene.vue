<template>
  <div class="scene">
    <div class="scene__vignette" aria-hidden="true"></div>
    <div class="scene__shafts" aria-hidden="true"></div>
    <div class="scene__fog" aria-hidden="true"></div>
    <div class="scene__motes" aria-hidden="true"></div>
    <div class="scene__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.scene {
  position: relative;
}

.scene__content {
  position: relative;
  z-index: 2;
}

.scene__vignette {
  position: absolute;
  inset: -20px;
  z-index: 0;
  pointer-events: none;
  background:
      radial-gradient(circle at 50% 10%, rgba($accent-500, 0.08), transparent 55%),
      radial-gradient(circle at 50% 50%, rgba(0,0,0,0), rgba($ink-950, 0.55) 30%);
}

.scene__shafts {
  position: absolute;
  inset: -40px -20px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.28;
  background:
      linear-gradient(105deg,
          transparent 0%,
          rgba($moon-100, 0.06) 18%,
          transparent 38%,
          rgba($accent-500, 0.05) 55%,
          transparent 72%
      );
  filter: blur(0.2px);
}

.scene__fog {
  position: absolute;
  inset: -40px -40px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.22;
  background:
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 58%),
      radial-gradient(circle at 80% 20%, rgba($accent-500,0.10), transparent 60%),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,0.06), transparent 65%);
  filter: blur(10px);
  animation: fogDrift 18s ease-in-out infinite alternate;
}

.scene__motes {
  position: absolute;
  inset: -40px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.18;
  background:
      radial-gradient(circle at 12% 22%, rgba(255,255,255,0.18) 0 1px, transparent 2px),
      radial-gradient(circle at 28% 68%, rgba(255,255,255,0.14) 0 1px, transparent 2px),
      radial-gradient(circle at 62% 36%, rgba(255,255,255,0.12) 0 1px, transparent 2px),
      radial-gradient(circle at 86% 54%, rgba(255,255,255,0.16) 0 1px, transparent 2px);
  filter: blur(0.2px);
}

@keyframes fogDrift {
  from { transform: translate3d(-8px, 0, 0) scale(1.02); }
  to   { transform: translate3d(8px, -6px, 0) scale(1.06); }
}

@media (prefers-reduced-motion: reduce) {
  .scene__fog { animation: none; }
}
</style>
