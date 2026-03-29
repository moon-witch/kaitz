<script setup lang="ts">
import { animate } from "animejs/animation";
import {stagger} from "animejs";

const props = defineProps<{ open: boolean }>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const router = useRouter();
router.afterEach(() => emit("close"));

const backdropEl = ref<HTMLDivElement | null>(null);
const items = [
  //                desktop               mobile
  { label: "Zuhause",  to: "/",        x: "-95px",  y: "13px",   xm: "-70px", ym: "30px"  },
  { label: "News",     to: "/news",    x: "-125px",  y: "-15px",    xm: "-85px", ym: "6px"   },
  { label: "Autor",    to: "/about",   x: "-150px", y: "-47px",  xm: "-120px", ym: "-18px" },
  { label: "Stories",  to: "/stories", x: "-155px", y: "-79px",  xm: "-140px",ym: "-44px" },
  { label: "Tagebuch", to: "/diary",   x: "-160px", y: "-112px", xm: "-150px",ym: "-70px" },
];


const itemEls = ref<HTMLElement[]>([]);
function setItemRef(el: Element | null) {
  if (!el) return;
  itemEls.value.push(el as HTMLElement);
}

function close() {
  emit("close");
}

function prefersReducedMotion(): boolean {
  if (process.server) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateIn() {
  if (prefersReducedMotion()) return;

  if (backdropEl.value) {
    animate(backdropEl.value, {
      opacity: [0, 1],
      duration: 180,
      ease: "outQuad",
    });
  }

  // Ensure we start hidden then animate to visible
  for (const el of itemEls.value) {
    el.style.opacity = "0";
  }

  animate(itemEls.value, {
    opacity: [0, 1],
    duration: 260,
    delay: stagger(35),
    ease: "outCubic",
  });
}

watch(
    () => props.open,
    async (v) => {
      if (!v) return;

      // Wait until the v-if content is in the DOM
      await nextTick();

      const els = Array.from(
          document.querySelectorAll<HTMLElement>(".runeMenu__item")
      );

      if (!els.length) return;

      // Ensure starting state (covers HMR / re-open edge cases)
      for (const el of els) {
        el.style.opacity = "0";
      }

      // Stagger in
      animate(els, {
        opacity: [0, 1],
        duration: 320,
        delay: stagger(55),
        ease: "outCubic",
      });
    }
);
</script>

<template>
  <div v-if="open" class="runeMenu" @keydown.esc.prevent="close">
    <div ref="backdropEl" class="runeMenu__backdrop" @click="close" aria-hidden="true"></div>

    <!-- Anchor to compass center (tuned to your compass placement: top=10, right=10, size=360) -->
    <div class="runeMenu__anchor" role="menu" aria-label="Hauptnavigation">
      <NuxtLink
          v-for="it in items"
          :key="it.to"
          :to="it.to"
          class="runeMenu__item"
          role="menuitem"
          @click="close"
          :style="{ '--x': it.x, '--y': it.y, '--xm': it.xm, '--ym': it.ym }"
          :ref="setItemRef"
          :data-label="it.label"
      >
        {{ it.label }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* IMPORTANT: compass is z-index: 10, so keep menu below it */
.runeMenu {
  position: fixed;
  inset: 0;
  z-index: 9;
}

/* Backdrop */
.runeMenu__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  opacity: 1;

  @media (max-width: 1024px) {
    background: rgba(0, 0, 0, 0.72);
  }
}

.runeMenu__anchor {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;

  // --spread cascades to child .runeMenu__item elements
  // and scales the arc without changing the JS item positions
  --spread: 1;

  // Desktop: compass is 100px at top:10 right:10
  left: calc(100vw - 10px - 20px);
  top: 130px;

  // Tablet: compass is 200px
  @media (min-width: 721px) and (max-width: 1024px) {
    left: calc(100vw - 10px - 25px);
    top: 130px;
    --spread: 0.85;
  }

  // Mobile: compass is 70px at top:20 right:6
  @media (max-width: 720px) {
    left: calc(100vw - 6px - 12px);
    top: 90px;
    --spread: 0.48;
  }
}

/* Item — ghostly floating label */
.runeMenu__item {
  pointer-events: auto;
  position: absolute;
  width: fit-content;
  padding: 0 0.4rem;

  display: grid;
  place-items: center;

  font-family: $font-serif;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;

  color: rgba($moon-100, 0.90);
  text-decoration: none;
  background: none;

  --s: 1;
  --spread: 1; /* fallback; actual value cascades from .runeMenu__anchor */
  transform: translate(calc(var(--x) * var(--spread)), calc(var(--y) * var(--spread))) scale(var(--s));

  @media (max-width: 720px) {
    transform: translate(calc(var(--xm) * var(--spread)), calc(var(--ym) * var(--spread))) scale(var(--s));
  }
  opacity: 0;

  /* Contrast: dark drop shadow beneath, soft purple glow */
  text-shadow:
    0 1px 8px  rgba(0, 0, 0, 1.00),
    0 2px 16px rgba(0, 0, 0, 0.85),
    0 0 14px   rgba($accent-500, 0.50);

  will-change: opacity;
  transition: color 280ms ease, text-shadow 280ms ease;

  /* Ghost echo — duplicate text layer that drifts */
  &::before {
    content: attr(data-label);
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;

    font-family: $font-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;

    color: rgba($candle-bright, 0.82);
    text-shadow:
      0 0 10px rgba($accent-500, 0.90),
      0 0 22px rgba($candle-bright, 0.55);

    pointer-events: none;
    opacity: 0;
    filter: blur(1.5px);
    transform: translateX(0px);
    transition: opacity 200ms ease;
  }

  &:hover {
    color: rgba($moon-100, 0.96);
    text-shadow:
      0 1px 8px  rgba(0, 0, 0, 1.00),
      0 2px 16px rgba(0, 0, 0, 0.85),
      0 0 16px   rgba($accent-500, 0.70);
  }

  &:hover::before {
    opacity: 1;
    animation: ghostEcho 2.6s ease-in-out infinite;
  }

  &:active {
    transform: translate(calc(var(--x) * var(--spread)), calc(var(--y) * var(--spread))) scale(var(--s));

    @media (max-width: 720px) {
      transform: translate(calc(var(--xm) * var(--spread)), calc(var(--ym) * var(--spread))) scale(var(--s));
    }
  }

  &:focus-visible {
    outline: 1px solid rgba($accent-500, 0.50);
    outline-offset: 6px;
    border-radius: 2px;
  }
}

/* Ghost echo: the duplicate text layer drifts left ↔ right and pulses blur */
@keyframes ghostEcho {
  0%   { transform: translateX(0px);   filter: blur(1.5px); opacity: 0.82; }
  20%  { transform: translateX(4px);   filter: blur(2.5px); opacity: 0.60; }
  42%  { transform: translateX(1px);   filter: blur(0.8px); opacity: 0.90; }
  65%  { transform: translateX(-4px);  filter: blur(2.2px); opacity: 0.55; }
  82%  { transform: translateX(-1px);  filter: blur(1.2px); opacity: 0.85; }
  100% { transform: translateX(0px);   filter: blur(1.5px); opacity: 0.82; }
}

@media (prefers-reduced-motion: reduce) {
  .runeMenu__item::before {
    animation: none !important;
    opacity: 0 !important;
  }
}
</style>
