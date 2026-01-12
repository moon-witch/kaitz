<template>
  <div class="scene">
    <!-- Full-viewport atmosphere layer -->
    <div class="scene__vignette" aria-hidden="true"></div>
    <div class="scene__atmos" aria-hidden="true">
      <div class="scene__shafts"></div>
      <div class="scene__fog"></div>
      <div class="scene__motes"></div>
    </div>

    <div class="scene__content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.scene {
  position: relative;
  /* ensure there's always a paint area */
  min-height: 60vh;
  padding-bottom: 1rem;
}

.scene__vignette {
  position: absolute;
  inset: -30px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.6;
  background: radial-gradient(circle at 50% 30%, rgba(0,0,0,0), rgba(0,0,0,0.55) 70%);
  box-shadow: $ink-950 0 0 20px 0;
  border-radius: 20px;
}


/* fixed full-screen atmosphere so it is always visible */
.scene__atmos {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* helps blending feel more “in the air” */
  mix-blend-mode: screen;
}

/* keep your app content above atmosphere */
.scene__content {
  position: relative;
  z-index: 2;
}

/* light shafts */
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

/* fog: make it obviously visible first; you can reduce later */
.scene__fog {
  position: absolute;
  inset: -20vh -20vw;

  opacity: 0.35;

  background:
      radial-gradient(circle at 18% 28%, rgba(255,255,255,0.10), transparent 55%),
      radial-gradient(circle at 78% 18%, rgba($accent-500,0.12), transparent 58%),
      radial-gradient(circle at 55% 78%, rgba(255,255,255,0.09), transparent 62%),
      radial-gradient(circle at 40% 55%, rgba($accent-500,0.08), transparent 60%);

  filter: blur(18px);
  animation: fogDrift 18s ease-in-out infinite alternate;
  will-change: transform;
}

/* dust motes */
.scene__motes {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.22;

  background:
      radial-gradient(circle at 12% 22%,
          rgba(255,255,255,0.22) 0px,
          rgba(255,255,255,0.22) 1px,
          transparent 2px
      ),
      radial-gradient(circle at 28% 68%,
          rgba(255,255,255,0.16) 0px,
          rgba(255,255,255,0.16) 1px,
          transparent 2px
      ),
      radial-gradient(circle at 62% 36%,
          rgba(255,255,255,0.14) 0px,
          rgba(255,255,255,0.14) 1px,
          transparent 2px
      ),
      radial-gradient(circle at 86% 54%,
          rgba(255,255,255,0.18) 0px,
          rgba(255,255,255,0.18) 1px,
          transparent 2px
      ),
      radial-gradient(circle at 46% 14%,
          rgba(255,255,255,0.12) 0px,
          rgba(255,255,255,0.12) 1px,
          transparent 2px
      );

  filter: blur(0.3px);
  animation: motesFloat 10s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes fogDrift {
  from { transform: translate3d(-10px, 4px, 0) scale(1.03); }
  to   { transform: translate3d(12px, -10px, 0) scale(1.37); }
}

@keyframes motesFloat {
  from { transform: translate3d(-4px, 0, 0); }
  to   { transform: translate3d(6px, -4px, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .scene__fog,
  .scene__motes {
    animation: none;
  }
}
</style>
