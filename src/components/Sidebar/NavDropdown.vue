<script setup lang="ts">
import { watch, nextTick, ref, type PropType} from 'vue'
import { animate, stagger } from 'animejs'
import type { StoryKey } from '@/components/Sidebar/sidebar.config'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
    default: []
  },
  open: {
    type: Boolean,
    required: true,
    default: false,
  },
  keyName: {
    type: String as PropType<StoryKey>
  },
  to: {
    type: String,
    required: true
  }
})

const emit  = defineEmits(['toggle'])

const wrapperEl  = ref<HTMLElement | null>(null)
const dropdownEl = ref<HTMLElement | null>(null)

// Animate list items (fade/slide) as before
watch(() => props.open, async (opened, prev) => {
  if (prev && !opened) {
    await nextTick()
    await new Promise<void>(resolve => {
      animate(`#dropdown-${props.keyName} li`, {
        opacity:    [1, 0],
        translateY: [0, 10],
        ease:       'inQuad',
        duration:   200,
        delay:      stagger(80),
        complete:   () => resolve(),
      })
    })
  }
  if (opened) {
    await nextTick()
    animate(`#dropdown-${props.keyName} li`, {
      opacity:    [0, 1],
      ease:       'outQuad',
      duration:   300,
      delay:      stagger(100),
    })
  }
})

// Transition hooks on the WRAPPER
function beforeEnter(el: HTMLElement) {
  el.style.height      = '0'
  el.style.opacity     = '0'
  el.style.overflow    = 'hidden'
  el.style.paddingTop  = '0'
  el.style.paddingBottom = '0'
}

function enter(el: HTMLElement, done: () => void) {
  // restore CSS padding value so we can animate to it
  // temporarily remove our inline zero-padding:
  el.style.removeProperty('padding-top')
  el.style.removeProperty('padding-bottom')
  const cs = getComputedStyle(el)
  const targetPadTop  = cs.paddingTop
  const targetPadBottom = cs.paddingBottom

  // now clamp back to zero to start the animation:
  el.style.paddingTop    = '0'
  el.style.paddingBottom = '0'

  // calculate the full height (includes dropdown-content + its padding)
  const fullHeight = el.scrollHeight + 'px'

  // include padding in the transition
  el.style.transition =
    'height 250ms ease, opacity 250ms ease, padding 250ms ease'
  void el.offsetHeight // force repaint

  el.style.height       = fullHeight
  el.style.opacity      = '1'
  el.style.paddingTop   = targetPadTop
  el.style.paddingBottom= targetPadBottom

  setTimeout(() => {
    // only remove the transition rule;
    // keep inline height & padding locked until removal/next cycle
    el.style.transition = ''
    done()
  }, 250)
}

function afterEnter(el: HTMLElement) {
  // no cleanup of height/padding: leave them inline so auto-removal is gap-free
}

function beforeLeave(el: HTMLElement) {
  // start from whatever height & padding we currently have
  el.style.height   = el.scrollHeight + 'px'
  el.style.opacity  = '1'
  el.style.overflow = 'hidden'
}

function leave(el: HTMLElement, done: () => void) {
  // animate height → 0, opacity → 0, padding → 0
  el.style.transition =
    'height 250ms ease, opacity 250ms ease, padding 250ms ease'
  void el.offsetHeight

  el.style.height        = '0'
  el.style.opacity       = '0'
  el.style.paddingTop    = '0'
  el.style.paddingBottom = '0'

  setTimeout(() => {
    // remove only the transition, leave everything else until Vue unmounts
    el.style.transition = ''
    done()
  }, 250)
}
</script>

<template>
  <li class="nav-item dropdown" :class="{ open: open }">
    <div class="dropdown-button">
      <RouterLink :to="to">{{ label }}</RouterLink>
      <button
        class="button"
        :class="{ open: open }"
        @click.prevent="emit('toggle')"
      >▼</button>
    </div>

    <transition
      @before-enter="beforeEnter"
      @enter="enter"
      @after-enter="afterEnter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div
        v-if="props.open"
        ref="wrapperEl"
        class="dropdown-wrapper"
      >
        <div
          ref="dropdownEl"
          class="dropdown-content"
          :id="`dropdown-${keyName}`"
        >
          <ul>
            <li v-for="item in items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </transition>
  </li>
</template>

<style scoped lang="scss">
.nav-item.dropdown {
  margin: .5rem 1.5rem;
  border-bottom: 1px solid $white;
  transition: all $transition;

  &.open {
    border: 1px solid $white;
    border-radius: $radius;
  }

  .dropdown-button {
    position: relative;
    background: transparent;
    padding: .25rem .5rem;
    margin: 0 .5rem;
    border-radius: 10px;
    text-align: center;

    a {
      color: $white;
    }

    .button {
      position: absolute;
      right: 50%;
      bottom: -14px;
      transform: translateX(50%) rotate(0deg);
      background: none;
      border: none;
      cursor: pointer;
      transition: transform .25s ease, color .25s ease;
      color: $white;

      &.open {
        transform: translateX(50%) rotate(180deg);
        z-index: 2;
      }
    }
  }
}

/* wrapping container that animates */
.dropdown-wrapper {
  /* originally margin: .5rem; moved into padding so we can animate it */
  padding: .5rem;
  overflow: hidden;
  will-change: height, opacity, padding;
}

/* actual dropdown visuals */
.dropdown-content {
  padding-top: 1rem;

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }

  li {
    color: $white;
    text-align: center;
    padding: .2rem;
    border-radius: $radius;
    transition: all $transition;

    &:hover {
      background: $white;
      color: $purple;
      cursor: pointer;
    }
  }
}
</style>
