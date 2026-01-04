<template>
  <div class="parchment">
    <div class="parchment__grain" aria-hidden="true"></div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.parchment {
  position: relative;
  border-radius: 18px;
  padding: 1.1rem 1rem 1.15rem;
  background:
      radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 60%),
      linear-gradient(180deg, rgba(235,220,190,0.08), rgba(235,220,190,0.03)),
      rgba(255,255,255,0.02);
  box-shadow:
      0 18px 44px rgba(0,0,0,0.45),
      inset 0 1px 0 rgba(255,255,255,0.10),
      inset 0 -1px 0 rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.07);
  overflow: hidden;
}

.parchment__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.25;
  background:
      radial-gradient(circle at 12% 18%, rgba(255,255,255,0.10), transparent 40%),
      radial-gradient(circle at 68% 36%, rgba(0,0,0,0.10), transparent 45%),
      radial-gradient(circle at 78% 78%, rgba(255,255,255,0.08), transparent 48%);
  mix-blend-mode: overlay;
}
</style>
