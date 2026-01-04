<script setup lang="ts">
import CompassSvg from "~/assets/svgs/Compass.svg?component";
import { animate } from "animejs/animation";

const emit = defineEmits<{ (e: "click"): void }>();
const props = defineProps<{ open: boolean }>();

const svgComp = ref<any>(null); // Vue component instance -> svgComp.value.$el is the <svg>

let innerAnim: any | null = null;
let outerAnim: any | null = null;
let glowAnim: any | null = null;

let triOuterAnim: any | null = null;
let triInnerAnim: any | null = null;

let triangleOuterEl: SVGGElement | null = null;
let triangleInnerEl: SVGGElement | null = null;

let triOuterBaseTransform = "";
let triInnerBaseTransform = "";

let cx = 0;
let cy = 0;

const prefersReducedMotion = ref(false);
const ready = ref(false);

const handleClick = () => emit("click");

function cancelAnim(a: any | null) {
  try {
    a?.cancel?.();
  } catch {
    // ignore
  }
}

function getSvgCenter(svgEl: SVGSVGElement): { cx: number; cy: number } {
  const vb = svgEl.viewBox?.baseVal;
  if (vb && vb.width && vb.height) return { cx: vb.x + vb.width / 2, cy: vb.y + vb.height / 2 };

  const bb = svgEl.getBBox();
  return { cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2 };
}

function rotateAround(el: SVGGElement, duration: number, direction: 1 | -1) {
  el.setAttribute("transform", `rotate(0 ${cx} ${cy})`);
  const state = { a: 0 };

  return animate(state, {
    a: direction * 360,
    duration,
    ease: "linear",
    loop: true,
    onUpdate: () => {
      el.setAttribute("transform", `rotate(${state.a} ${cx} ${cy})`);
    },
  });
}

function setRotateTransform(el: SVGGElement, base: string, angle: number) {
  const rot = `rotate(${angle} ${cx} ${cy})`;
  const trimmed = (base || "").trim();
  el.setAttribute("transform", trimmed ? `${trimmed} ${rot}` : rot);
}

function animateTrianglesOpen() {
  if (prefersReducedMotion.value) return;
  if (!triangleOuterEl || !triangleInnerEl) return;

  cancelAnim(triOuterAnim);
  cancelAnim(triInnerAnim);

  const sOuter = { a: 0 };
  const sInner = { a: 0 };

  triOuterAnim = animate(sOuter, {
    a: -120,
    duration: 1200,
    ease: "inOutSine",
    onUpdate: () => setRotateTransform(triangleOuterEl!, triOuterBaseTransform, sOuter.a),
  });

  triInnerAnim = animate(sInner, {
    a: 120,
    duration: 1200,
    ease: "inOutSine",
    onUpdate: () => setRotateTransform(triangleInnerEl!, triInnerBaseTransform, sInner.a),
  });
}

function animateTrianglesClose() {
  if (prefersReducedMotion.value) return;
  if (!triangleOuterEl || !triangleInnerEl) return;

  cancelAnim(triOuterAnim);
  cancelAnim(triInnerAnim);

  const sOuter = { a: -120 };
  const sInner = { a: 120 };

  triOuterAnim = animate(sOuter, {
    a: 0,
    duration: 700,
    ease: "outCubic",
    onUpdate: () => setRotateTransform(triangleOuterEl!, triOuterBaseTransform, sOuter.a),
    complete: () => triangleOuterEl!.setAttribute("transform", triOuterBaseTransform),
  });

  triInnerAnim = animate(sInner, {
    a: 0,
    duration: 700,
    ease: "outCubic",
    onUpdate: () => setRotateTransform(triangleInnerEl!, triInnerBaseTransform, sInner.a),
    complete: () => triangleInnerEl!.setAttribute("transform", triInnerBaseTransform),
  });
}

watch(
    () => props.open,
    (v) => {
      if (!ready.value) return;
      v ? animateTrianglesOpen() : animateTrianglesClose();
    },
    { flush: "post" }
);

onMounted(async () => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const set = () => (prefersReducedMotion.value = mq.matches);
  set();
  mq.addEventListener?.("change", set);

  await nextTick();

  const svgEl = (svgComp.value?.$el as SVGSVGElement | undefined) ?? null;
  if (!svgEl) {
    console.warn("[RuneCompass] Could not resolve <svg> root element.");
    return;
  }

  ({ cx, cy } = getSvgCenter(svgEl));

  const ringInner = svgEl.querySelector("#ringInner") as SVGGElement | null;
  const ringOuter = svgEl.querySelector("#ringOuter") as SVGGElement | null;
  const outerGlow = svgEl.querySelector("#outerGlow") as SVGGElement | null;

  triangleInnerEl = svgEl.querySelector("#triangleInner") as SVGGElement | null;
  triangleOuterEl = svgEl.querySelector("#triangleOuter") as SVGGElement | null;

  if (!triangleInnerEl || !triangleOuterEl) {
    console.warn("[RuneCompass] Triangle groups not found. Check SVG IDs.");
    return;
  }

  triInnerBaseTransform = triangleInnerEl.getAttribute("transform") ?? "";
  triOuterBaseTransform = triangleOuterEl.getAttribute("transform") ?? "";

  if (!prefersReducedMotion.value) {
    if (ringInner) {
      cancelAnim(innerAnim);
      innerAnim = rotateAround(ringInner, 60000, 1);
    }

    if (ringOuter) {
      cancelAnim(outerAnim);
      outerAnim = rotateAround(ringOuter, 90000, -1);
    }

    if (outerGlow) {
      cancelAnim(glowAnim);
      glowAnim = animate(outerGlow, {
        opacity: [0.15, 0.35],
        duration: 5000,
        ease: "inOutSine",
        loop: true,
        alternate: true,
      });
    }
  }

  ready.value = true;

  // Apply initial state once
  props.open ? animateTrianglesOpen() : animateTrianglesClose();
});

onBeforeUnmount(() => {
  cancelAnim(innerAnim);
  cancelAnim(outerAnim);
  cancelAnim(glowAnim);
  cancelAnim(triOuterAnim);
  cancelAnim(triInnerAnim);
});
</script>

<template>
  <div class="arcane-compass" aria-hidden="true" @click="handleClick">
    <CompassSvg ref="svgComp" class="arcane-compass__svg" />
  </div>
</template>

<style scoped lang="scss">
.arcane-compass {
  width: fit-content;
  height: fit-content;
  max-width: 360px;
  aspect-ratio: 1 / 1;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10;
  cursor: pointer;
}

.arcane-compass__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>


