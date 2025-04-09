<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { createTimeline } from 'animejs'

const letters = ['K', 'A', 'I', 'T', 'Z']
const svgs = reactive<Record<string, string>>({})
const logoContainer = ref<HTMLDivElement>()

const loadSvgs = async () => {
  for (const letter of letters) {
    const res = await fetch(`/kaitz-logo/${letter}.svg`)
    svgs[letter] = await res.text()
  }
}

const animateLogo = () => {
  const paths = logoContainer.value?.querySelectorAll('path')
  if (!paths) return

  const strokeDuration = 3000
  const fillDuration = strokeDuration / 5
  const perLetterDelay = strokeDuration / 5

  // Initial setup
  paths.forEach((path) => {
    const length = path.getTotalLength()
    path.setAttribute('stroke-dasharray', length.toString())
    path.setAttribute('stroke-dashoffset', length.toString())
    path.setAttribute('stroke', '#cabed2')
    path.setAttribute('stroke-opacity', '1')
    path.setAttribute('fill', '#ffffff')
    path.style.filter = 'none'
    path.style.opacity = '0'
  })

  // Animate each letter forward
  paths.forEach((path, index) => {
    const startTime = index * perLetterDelay
    const fillProgress =
      index === 0 ? 0.2 :
        index === 1 ? 0.33 :
          index === 2 ? 0.33 :
            index === 3 ? 0.6 :
              0.5

    const fillStart = startTime + strokeDuration * fillProgress

    const tl = createTimeline({ delay: 0 })

    tl.add(path, {
      opacity: { from: 0, to: 1 },
      duration: 1,
    }, startTime)

    tl.add(path, {
      strokeDashoffset: {
        from: path.getTotalLength(),
        to: 0,
      },
      stroke: {
        from: '#cabed2',
        to: '#2c1a3c',
      },
      easing: 'easeOutQuad',
      duration: strokeDuration,
    }, startTime)

    tl.add(path, {
      fill: {
        from: '#ffffff',
        to: '#2c1a3c',
      },
      easing: 'easeOutQuad',
      duration: fillDuration,
    }, fillStart)
  })

  // Step 2: After pause, animate each letter backward
  const lastLetterIndex = paths.length - 1
  const lastStartTime = lastLetterIndex * perLetterDelay
  const lastFillEnd = lastStartTime + strokeDuration
  const pauseBeforeRewind = 2000

  const eraseDuration = strokeDuration / 3
  const eraseFillDuration = fillDuration / 2

  setTimeout(() => {
    [...paths].reverse().forEach((path, revIndex) => {
      const reverseStart = revIndex * perLetterDelay
      const tl = createTimeline({ delay: 0 })

      tl.add(path, {
        fill: {
          from: '#2c1a3c',
          to: '#ffffff',
        },
        easing: 'easeInOutQuad',
        duration: eraseFillDuration,
      }, reverseStart)

      tl.add(path, {
        strokeDashoffset: {
          from: 0,
          to: path.getTotalLength(),
        },
        stroke: {
          from: '#2c1a3c',
          to: '#cabed2',
        },
        easing: 'easeInOutQuad',
        duration: eraseDuration,
      }, reverseStart + eraseFillDuration)

      tl.add(path, {
        opacity: {
          from: 1,
          to: 0,
        },
        duration: 1,
      }, reverseStart + eraseFillDuration + eraseDuration)
    })

    const rewindTotalTime = paths.length * perLetterDelay + eraseDuration + eraseFillDuration + 1000
    setTimeout(() => {
      animateLogo()
    }, rewindTotalTime)

  }, lastFillEnd + pauseBeforeRewind)
}

onMounted(async () => {
  await loadSvgs()
  setTimeout(() => {
    animateLogo()
  }, 100)
})
</script>

<template>
  <div class="kaitz-logo" ref="logoContainer">
    <div
      v-for="(letter, index) in letters"
      :key="index"
      v-html="svgs[letter]"
      class="svg-letter"
    />
  </div>
</template>

<style scoped lang="scss">
.kaitz-logo {
  display: flex;
  align-items: center;
  gap: -5px;

  .svg-letter {
    width: auto;
    height: auto;
    display: inline-block;
    padding: 0;
    margin: 0;

    &:first-of-type {
      margin-right: -10px;
    }
  }

  path {
    transition: fill 0.3s ease;
  }
}
</style>
