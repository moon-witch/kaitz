<template>
  <div class="parchment">
    <div class="parchment__grain" aria-hidden="true"></div>
    <div class="parchment__stain" aria-hidden="true"></div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
// Actual aged parchment — warm amber/cream with paper grain and stains
.parchment {
  position: relative;
  // Irregular corners — aged paper, not machine-cut
  border-radius: 4px 2px 5px 2px / 2px 4px 2px 5px;
  padding: 1.15rem 1.1rem 1.2rem;

  // Layered parchment base: top-left lit, bottom-right aged dark
  background:
    radial-gradient(ellipse at 15% 12%, rgba(255, 248, 225, 0.22), transparent 45%),
    radial-gradient(ellipse at 80% 85%, rgba(110, 65, 18, 0.22), transparent 42%),
    radial-gradient(ellipse at 50% 50%, rgba(190, 145, 70, 0.08), transparent 65%),
    linear-gradient(158deg,
      #d4b483 0%,
      #c9a870 30%,
      #bb9558 65%,
      #a87840 100%
    );

  // Dark ink text on parchment
  color: $ink-text;

  // Aged paper border
  border: 1px solid rgba(100, 62, 18, 0.40);

  box-shadow:
    // Inner edge darkening — aged paper corners
    inset 0 0 45px rgba(60, 30, 8, 0.28),
    // Top surface highlight
    inset 0 2px 0 rgba(255, 248, 220, 0.38),
    // Elevation
    0 8px 32px rgba(0, 0, 0, 0.55),
    0 2px 6px rgba(0, 0, 0, 0.30);

  overflow: hidden;
}

// Paper fiber grain lines — subtle horizontal texture
.parchment__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.65;

  background:
    // Horizontal fiber texture
    repeating-linear-gradient(
      180deg,
      transparent 0px,
      transparent 3px,
      rgba(140, 90, 30, 0.06) 3px,
      rgba(140, 90, 30, 0.06) 4px
    ),
    // Slight vertical grain variation
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 18px,
      rgba(180, 120, 50, 0.04) 18px,
      rgba(180, 120, 50, 0.04) 19px
    );

  mix-blend-mode: multiply;
}

// Water stains and aging marks
.parchment__stain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.55;

  background:
    // Bottom-right corner old water stain
    radial-gradient(ellipse at 88% 90%, rgba(120, 70, 18, 0.30), transparent 32%),
    // Top edge darker (dried and curled)
    radial-gradient(ellipse at 50% 0%, rgba(90, 50, 12, 0.20), transparent 28%),
    // Side edge aging
    radial-gradient(ellipse at 0% 55%, rgba(100, 60, 15, 0.15), transparent 25%),
    // Faint center stain
    radial-gradient(ellipse at 62% 38%, rgba(160, 105, 35, 0.12), transparent 30%);

  mix-blend-mode: multiply;
}
</style>
