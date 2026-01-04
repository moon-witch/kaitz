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
  { label: "Zuhause", to: "/",       x: "-35px",  y: "40px"   },
  { label: "News",    to: "/news",   x: "-85px",  y: "8px"  },
  { label: "Autor",    to: "/about",  x: "-125px", y: "-31px"  },
  { label: "Stories", to: "/stories",x: "-155px", y: "-75px"  },
  { label: "Tagebuch",to: "/diary",  x: "-160px", y: "-122px" },
] as const;


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
    el.style.setProperty("--s", "0.92");
  }

  animate(itemEls.value, {
    opacity: [0, 1],
    "--s": [0.92, 1],
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
        el.style.setProperty("--s", "0.92");
      }

      // Stagger in
      animate(els, {
        opacity: [0, 1],
        "--s": [0.92, 1],
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
          :style="{ '--x': it.x, '--y': it.y }"
          :ref="setItemRef"
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
  background: rgba(0, 0, 0, 0.35);
  opacity: 1;
}

/*
  Anchor point:
  Your compass is fixed: top: 10px; right: 10px; max-width: 360px.
  Its center is approximately:
    x = 100vw - 10px - 180px
    y = 10px + 180px
*/
.runeMenu__anchor {
  position: absolute;
  left: calc(100vw - 10px - 45px);
  top: calc(10px + 120px);
  width: 0;
  height: 0;
  pointer-events: none; /* only items are clickable */
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.35));
}

/* Item */
.runeMenu__item {
  pointer-events: auto;

  position: absolute;
  width: fit-content;
  height: 42px;
  border-radius: 999px;

  display: grid;
  place-items: center;

  font-family: $font-serif;
  font-size: 1rem;
  letter-spacing: 0.02em;

  color: rgba($moon-100, 0.96);
  text-decoration: none;

  padding: 0 0.75rem;

  /* placement + scalable transform without losing translate */
  --s: 1;
  transform: translate(var(--x), var(--y)) scale(var(--s));

  /* Start hidden (for your stagger animation) */
  opacity: 0;

  /* “Arcane glass + aura” */
  background:
      /* 1) thin inner rim glow */
      radial-gradient(120% 180% at 18% 20%, rgba($accent-500, 0.55), transparent 55%),
      radial-gradient(140% 160% at 82% 75%, rgba($accent-500, 0.22), transparent 60%),

        /* 2) etched highlight band (like a sigil stroke) */
      linear-gradient(90deg,
          rgba(255, 255, 255, 0.00) 0%,
          rgba(255, 255, 255, 0.10) 18%,
          rgba(255, 255, 255, 0.02) 55%,
          rgba(255, 255, 255, 0.00) 100%
      ),

        /* 3) “foggy glass” base */
      linear-gradient(180deg,
          rgba(255, 255, 255, 0.06),
          rgba(255, 255, 255, 0.02)
      ),

        /* 4) deep ink backing */
      rgba(10, 6, 18, 0.52);

  /* Depth and bloom without a hard border */
  box-shadow:
      /* outer bloom */
      0 0 22px rgba($accent-500, 0.22),
      0 0 48px rgba($accent-500, 0.12),

        /* elevation */
      0 14px 34px rgba(0, 0, 0, 0.42),

        /* subtle inner bevel */
      inset 0 1px 0 rgba(255, 255, 255, 0.10),
      inset 0 -1px 0 rgba(0, 0, 0, 0.45),
      inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  /* Make text feel slightly luminous */
  text-shadow:
      0 0 10px rgba($accent-500, 0.18),
      0 1px 0 rgba(0, 0, 0, 0.35);

  /* Smooth, “alive” transitions */
  transition:
      box-shadow 420ms ease,
      background 420ms ease,
      transform 420ms ease;

  /* Decorative pseudo-elements */
  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 999px;
    pointer-events: none;
  }

  /* Etched inner line + rune dust */
  &::before {
    background:
        /* etched inner ring (no visible border) */
        linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.02)),
          /* “rune dust” speckle illusion via micro-gradients */
        radial-gradient(circle at 22% 45%, rgba(255, 255, 255, 0.06), transparent 32%),
        radial-gradient(circle at 60% 30%, rgba($accent-500, 0.10), transparent 34%),
        radial-gradient(circle at 78% 68%, rgba(255, 255, 255, 0.05), transparent 34%);
    opacity: 0.55;
    mix-blend-mode: screen;
  }

  /* Shimmer band (animated on hover) */
  &::after {
    inset: 0;
    background: linear-gradient(
            115deg,
            rgba(255, 255, 255, 0.00) 0%,
            rgba(255, 255, 255, 0.10) 35%,
            rgba(255, 255, 255, 0.00) 70%
    );
    opacity: 0.0;
    transform: translateX(-35%);
  }

  &:hover {
    box-shadow:
        0 0 28px rgba($accent-500, 0.32),
        0 0 62px rgba($accent-500, 0.18),
        0 16px 40px rgba(0, 0, 0, 0.46),
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        inset 0 -1px 0 rgba(0, 0, 0, 0.50),
        inset 0 0 0 1px rgba(255, 255, 255, 0.06);

    background:
        radial-gradient(130% 200% at 18% 18%, rgba($accent-500, 0.72), transparent 58%),
        radial-gradient(160% 180% at 80% 78%, rgba($accent-500, 0.30), transparent 62%),
        linear-gradient(90deg,
            rgba(255, 255, 255, 0.00) 0%,
            rgba(255, 255, 255, 0.14) 18%,
            rgba(255, 255, 255, 0.03) 55%,
            rgba(255, 255, 255, 0.00) 100%
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025)),
        rgba(10, 6, 18, 0.50);

    transform: translate(var(--x), var(--y)) scale(calc(var(--s) * 1.02));
  }

  &:hover::after {
    opacity: 0.55;
    animation: runeShimmer 1.2s ease-out forwards;
  }

  &:active {
    transform: translate(var(--x), var(--y)) scale(var(--s));
  }

  &:focus-visible {
    outline: 2px solid rgba($accent-500, 0.7);
    outline-offset: 3px;
  }
}

@keyframes runeShimmer {
  from { transform: translateX(-35%); }
  to   { transform: translateX(35%); }
}

@media (prefers-reduced-motion: reduce) {
  .runeMenu__item::after {
    animation: none !important;
  }
}
</style>
