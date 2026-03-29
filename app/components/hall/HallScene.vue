<template>
  <div class="scene">
    <div class="scene__atmos" aria-hidden="true">
      <div class="scene__shafts"></div>
      <div class="scene__fog"></div>
      <div class="scene__motes"></div>
      <div class="scene__candle"></div>
    </div>

    <div class="scene__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.scene {
  position: relative;
  min-height: 60vh;
  padding-bottom: 1rem;
}

// Full-screen atmosphere — always visible
.scene__atmos {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.scene__content {
  position: relative;
  z-index: 2;
}

// Arcane light shafts — cool silver/purple diagonal
.scene__shafts {
  position: absolute;
  inset: -10vh -10vw;
  opacity: 0.55;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      rgba($moon-100, 0.12) 18%,
      transparent 38%,
      rgba($accent-500, 0.10) 55%,
      transparent 72%
    );

  filter: blur(0.6px);
}

// Arcane fog — purple/silver drifting mist
.scene__fog {
  position: absolute;
  inset: -20vh -20vw;
  opacity: 0.60;

  background:
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, 0.12), transparent 55%),
    radial-gradient(circle at 78% 18%, rgba($accent-500, 0.18), transparent 58%),
    radial-gradient(circle at 55% 78%, rgba(255, 255, 255, 0.10), transparent 62%),
    radial-gradient(circle at 40% 55%, rgba($accent-500, 0.12), transparent 60%);

  filter: blur(18px);
  animation: fogDrift 18s ease-in-out infinite alternate;
  will-change: transform;
}

// Arcane dust motes — silver/purple particles floating in the gloom
.scene__motes {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.45;

  background:
    radial-gradient(circle at 12% 22%,
        rgba(255, 255, 255, 0.55) 0px,
        rgba(255, 255, 255, 0.55) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 28% 68%,
        rgba($accent-500, 0.70) 0px,
        rgba($accent-500, 0.70) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 62% 36%,
        rgba(255, 255, 255, 0.45) 0px,
        rgba(255, 255, 255, 0.45) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 86% 54%,
        rgba($candle-bright, 0.60) 0px,
        rgba($candle-bright, 0.60) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 46% 14%,
        rgba(255, 255, 255, 0.40) 0px,
        rgba(255, 255, 255, 0.40) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 71% 82%,
        rgba($accent-500, 0.50) 0px,
        rgba($accent-500, 0.50) 1px,
        transparent 2px
    );

  filter: blur(0.3px);
  animation: motesFloat 10s ease-in-out infinite alternate;
  will-change: transform;
}

// Arcane ground glow — purple light pooling at the floor corners
.scene__candle {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.38;

  background:
    radial-gradient(ellipse at 10% 92%, rgba($accent-500, 0.65), transparent 38%),
    radial-gradient(ellipse at 92% 90%, rgba($candle-bright, 0.40), transparent 32%);

  filter: blur(28px);
  animation: candleFlicker 7s ease-in-out infinite alternate;
  will-change: opacity, transform;
}

@keyframes fogDrift {
  from { transform: translate3d(-12px, 6px, 0) scale(1.04); }
  to   { transform: translate3d(14px, -12px, 0) scale(1.42); }
}

@keyframes motesFloat {
  from { transform: translate3d(-5px, 0, 0); }
  to   { transform: translate3d(8px, -6px, 0); }
}

@keyframes candleFlicker {
  0%   { opacity: 0.12; transform: scale(1.00); }
  20%  { opacity: 0.09; transform: scale(0.97); }
  45%  { opacity: 0.15; transform: scale(1.04); }
  70%  { opacity: 0.10; transform: scale(0.98); }
  85%  { opacity: 0.16; transform: scale(1.02); }
  100% { opacity: 0.11; transform: scale(0.99); }
}

@media (prefers-reduced-motion: reduce) {
  .scene__fog,
  .scene__motes,
  .scene__candle {
    animation: none;
  }
}
</style>
