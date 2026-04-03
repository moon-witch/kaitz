<script setup lang="ts">
const route = useRoute();

// Initialized true on server for "/" — SSR overlay prevents flash
const active  = ref(route.path === "/");
const parting = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);

let raf          = 0;
let startTime    = 0;
let partingStart = 0;
let glCtx: WebGLRenderingContext | null = null;
let uTime  : WebGLUniformLocation | null = null;
let uSplit : WebGLUniformLocation | null = null;
let uRes   : WebGLUniformLocation | null = null;
let timers: ReturnType<typeof setTimeout>[] = [];

function clearTimers() { timers.forEach(clearTimeout); timers = []; }

// ── Shaders ───────────────────────────────────────────────────────────────────

const VERT = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;

const FRAG = `
precision mediump float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_split;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2  m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y;

  // Smooth easing on split progress
  float sp = u_split * u_split * (3.0 - 2.0 * u_split);

  // Organic edge noise — left and right use different seeds/speeds so they
  // move independently, giving a natural ragged tear rather than mirrored curves
  float noiseL = (noise(vec2(uv.y * 4.0 + u_time * 0.10, 0.3)) - 0.5) * 0.14;
  float noiseR = (noise(vec2(uv.y * 4.0 + u_time * 0.08, 0.8)) - 0.5) * 0.14;

  // Initial edges start at ±0.63/0.37 so that even at maximum noise amplitude
  // (±0.07) the centre pixels remain fully covered before any split begins.
  float fw = 0.06;
  float wipe;
  if (uv.x < 0.5) {
    float e = 0.63 - sp * 0.78 + noiseL;
    wipe = 1.0 - smoothstep(e - fw, e + fw, uv.x);
  } else {
    float e = 0.37 + sp * 0.78 + noiseR;
    wipe = smoothstep(e - fw, e + fw, uv.x);
  }

  // Domain-warped FBM for organic cloud shapes
  vec2 q = vec2(
    fbm(uv * 2.0 + u_time * 0.03),
    fbm(uv * 2.0 + vec2(5.2, 1.3))
  );
  float f = fbm(uv * 2.5 + 1.6 * q + u_time * 0.02);

  float cloud = smoothstep(0.32, 0.58, f);

  // Arcane purple palette — ink-800 (#1a0c2c) depths → candle-bright (#c890ff) wisps
  vec3 col = mix(
    vec3(0.102, 0.047, 0.173),   // ink-800: deep arcane purple
    vec3(0.784, 0.565, 1.000),   // candle-bright: arcane lavender glow
    cloud * 0.6 + f * 0.3
  );

  gl_FragColor = vec4(col, cloud * wipe);
}
`;

// ── WebGL setup ───────────────────────────────────────────────────────────────

function initGL(): boolean {
  const canvas = canvasRef.value;
  if (!canvas) return false;

  glCtx = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) as WebGLRenderingContext | null;
  if (!glCtx) return false;
  const gl = glCtx;

  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, VERT); gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, FRAG); gl.compileShader(fs);

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  uTime  = gl.getUniformLocation(prog, "u_time");
  uSplit = gl.getUniformLocation(prog, "u_split");
  uRes   = gl.getUniformLocation(prog, "u_res");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return true;
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas || !glCtx) return;
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  canvas.width  = Math.round(window.innerWidth  * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  glCtx.viewport(0, 0, canvas.width, canvas.height);
}

// ── Render loop ───────────────────────────────────────────────────────────────

const SPLIT_MS = 1200;

function renderFrame(now: number) {
  const gl     = glCtx;
  const canvas = canvasRef.value;
  if (!gl || !canvas) return;

  const t     = (now - startTime) / 1000;
  const split = partingStart > 0
    ? Math.min(1, (now - partingStart) / SPLIT_MS)
    : 0;

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(uTime!,  t);
  gl.uniform1f(uSplit!, split);
  gl.uniform2f(uRes!,   canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  if (split < 1) raf = requestAnimationFrame(renderFrame);
}

// ── Entrance logic ────────────────────────────────────────────────────────────

const HOLD_MS = 900;
const FADE_MS = 1200; // must match CSS transition below

function onTransitionEnd(e: TransitionEvent) {
  if (e.propertyName === "opacity" && e.target === e.currentTarget) {
    active.value = false;
  }
}

function runEntrance() {
  if (!import.meta.client) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    active.value = false;
    return;
  }

  clearTimers();
  cancelAnimationFrame(raf);
  parting.value  = false;
  partingStart   = 0;
  active.value   = true;

  nextTick(() => {
    resize();
    const ok = initGL();
    startTime = performance.now();
    if (ok) raf = requestAnimationFrame(renderFrame);

    // Shader split + CSS crossfade start simultaneously
    timers.push(setTimeout(() => {
      parting.value = true;
      partingStart  = performance.now();
    }, HOLD_MS));

    // Fallback in case transitionend never fires
    timers.push(setTimeout(() => {
      active.value = false;
    }, HOLD_MS + FADE_MS + 600));
  });
}

onMounted(() => {
  window.addEventListener("resize", resize, { passive: true });
  if (route.path === "/") runEntrance();
});

watch(() => route.path, (path) => {
  if (path === "/") runEntrance();
  else { clearTimers(); cancelAnimationFrame(raf); active.value = false; }
});

onUnmounted(() => {
  clearTimers();
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);
});
</script>

<template>
  <div
    v-if="active"
    class="entrance"
    :class="{ 'entrance--parting': parting }"
    aria-hidden="true"
    @transitionend="onTransitionEnd"
  >
    <canvas ref="canvasRef" class="entrance__canvas" />

    <!-- KAITZ — ghost letters barely perceptible in the fog -->
    <div class="logo" :class="{ 'logo--parting': parting }">
      <img class="letter letter--k" src="/kaitz-logo/K.svg" alt="" />
      <img class="letter letter--a" src="/kaitz-logo/A.svg" alt="" />
      <img class="letter letter--i" src="/kaitz-logo/I.svg" alt="" />
      <img class="letter letter--t" src="/kaitz-logo/T.svg" alt="" />
      <img class="letter letter--z" src="/kaitz-logo/Z.svg" alt="" />
    </div>
  </div>
</template>

<style scoped lang="scss">
// ── Shell ─────────────────────────────────────────────────────────────────────

.entrance {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: $ink-950;  // instantly covers page — no flash
  transition: opacity 1200ms ease-in; // keep in sync with FADE_MS

  &--parting {
    opacity: 0;
    pointer-events: none;
  }
}

// ── Canvas ────────────────────────────────────────────────────────────────────

.entrance__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  // Fog materialises over the dark background — no page flash possible
  animation: entrance-fadein 400ms ease-out both;
}

@keyframes entrance-fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

// ── KAITZ letters ─────────────────────────────────────────────────────────────
//
// Each SVG was drawn at a different viewBox height:
//   K=35, A=18, I=25, T=27, Z=18
// Scaling all to the same CSS height would over-magnify A and Z (18px tall
// viewBox → thick strokes). Heights are normalised to K's scale factor
// (100px / 35px = 2.86×) so all letters appear the same visual stroke weight.
//   K: 35 × 2.86 = 100px  A: 18 × 2.86 ≈ 51px  I: 25 × 2.86 ≈ 71px
//   T: 27 × 2.86 ≈ 77px   Z: 18 × 2.86 ≈ 51px
// Values are rounded to clean numbers within the same clamp rhythm.

.logo {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 1.8vw, 1rem);
  transition: opacity 600ms ease-in;
  pointer-events: none;
}

.logo--parting { opacity: 0; }

.letter {
  display: block;
  width: auto;
  opacity: 0.72;
  filter:
    drop-shadow(0 0 24px rgba(200, 144, 255, 0.80))
    drop-shadow(0 0 8px rgba(200, 144, 255, 0.50))
    drop-shadow(0 3px 8px rgba(9, 5, 17, 0.95));
}

// Per-letter height — normalised to K's viewBox scale factor
.letter--k { height: clamp(51px, 8.5vh, 100px); }  // viewBox h=35, baseline scale
.letter--a { height: clamp(26px, 4.3vh, 51px);  }  // viewBox h=18 → 51% of K
.letter--i { height: clamp(36px, 6.0vh, 71px);  }  // viewBox h=25 → 71% of K
.letter--t { height: clamp(39px, 6.6vh, 77px);  }  // viewBox h=27 → 77% of K
.letter--z { height: clamp(26px, 4.3vh, 51px);  }  // viewBox h=18 → 51% of K

@media (prefers-reduced-motion: reduce) {
  .entrance, .entrance__canvas, .logo { transition: none; animation: none; }
}
</style>
