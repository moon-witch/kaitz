<template>
  <div class="scene">
    <div class="scene__vignette" aria-hidden="true"></div>
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

// Warm vignette — draws eye to center, like candlelight falling off at edges
.scene__vignette {
  position: absolute;
  inset: -30px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.70;
  background: radial-gradient(ellipse at 50% 28%, rgba(0,0,0,0), rgba(0,0,0,0.65) 72%);
  border-radius: 20px;
}

// Full-screen atmosphere — always visible
.scene__atmos {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: screen;
}

.scene__content {
  position: relative;
  z-index: 2;
}

// Arcane light shafts — cool silver/purple diagonal
.scene__shafts {
  position: absolute;
  inset: -10vh -10vw;
  opacity: 0.35;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      rgba($moon-100, 0.09) 18%,
      transparent 38%,
      rgba($accent-500, 0.07) 55%,
      transparent 72%
    );

  filter: blur(0.6px);
}

// Arcane fog — purple/silver drifting mist
.scene__fog {
  position: absolute;
  inset: -20vh -20vw;
  opacity: 0.35;

  background:
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, 0.10), transparent 55%),
    radial-gradient(circle at 78% 18%, rgba($accent-500, 0.12), transparent 58%),
    radial-gradient(circle at 55% 78%, rgba(255, 255, 255, 0.09), transparent 62%),
    radial-gradient(circle at 40% 55%, rgba($accent-500, 0.08), transparent 60%);

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
  opacity: 0.22;

  background:
    radial-gradient(circle at 12% 22%,
        rgba(255, 255, 255, 0.22) 0px,
        rgba(255, 255, 255, 0.22) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 28% 68%,
        rgba(255, 255, 255, 0.16) 0px,
        rgba(255, 255, 255, 0.16) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 62% 36%,
        rgba(255, 255, 255, 0.14) 0px,
        rgba(255, 255, 255, 0.14) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 86% 54%,
        rgba(255, 255, 255, 0.18) 0px,
        rgba(255, 255, 255, 0.18) 1px,
        transparent 2px
    ),
    radial-gradient(circle at 46% 14%,
        rgba(255, 255, 255, 0.12) 0px,
        rgba(255, 255, 255, 0.12) 1px,
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
  opacity: 0.14;

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
