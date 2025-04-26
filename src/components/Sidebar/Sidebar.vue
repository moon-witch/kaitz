<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import KaitzLogo from '@/components/KaitzLogo.vue'
import { animate, stagger } from 'animejs'

type StoryKey = 'fantasy' | 'dystopia' | 'magic'
const openDropdown = ref<StoryKey | null>(null)

function toggleDropdown(key: StoryKey) {
  openDropdown.value = openDropdown.value === key ? null : key
}

const fantasyItems  = [
  'A story about a boy...',
  'Thousands of years ago...',
  'Marvel is the best...'
]
const dystopiaItems = [
  'When the lights went out...',
  'City in ruins...',
  'Hope fades...'
]
const magicItems    = [
  'Wands at dawn...',
  'Dragons awaken...',
  'Spells fly...'
]

watch(openDropdown, async (key, prev) => {
  // 1) On close: fade out previous list before unmount
  if (prev && !key) {
    await nextTick()
    await new Promise<void>(resolve => {
      animate(`#dropdown-${prev} li`, {
        opacity:    [1, 0],
        translateY: [0, 10],
        ease:       'inQuad',
        duration:   200,
        delay:      stagger(80),
        complete:   () => resolve()
      })
    })
  }

  // 2) On open: fade & slide in the new list
  if (key) {
    await nextTick()
    animate(`#dropdown-${key} li`, {
      opacity:    [0, 1],
      translateY: [10, 0],
      ease:       'outQuad',
      duration:   300,
      delay:      stagger(100)
    })
  }
})
</script>

<template>
  <section class="sidebar">
    <div class="logo-wrapper">
      <KaitzLogo />
    </div>
    <ul class="nav">
      <li class="nav-item">
        <RouterLink to="/logo">Landing</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/logo">News</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink to="/logo">Diary</RouterLink>
      </li>
      <li class="subheader">Stories</li>

      <!-- Fantasy -->
      <li class="nav-item dropdown">
        <div class="dropdown-button">
          <RouterLink to="/logo">Fantasy</RouterLink>
          <button
            class="button"
            :class="{ open: openDropdown === 'fantasy' }"
            @click.prevent="toggleDropdown('fantasy')"
          >▼</button>
        </div>
        <transition name="dropdown">
          <div
            v-if="openDropdown === 'fantasy'"
            class="dropdown-content"
            id="dropdown-fantasy"
          >
            <ul>
              <li v-for="item in fantasyItems" :key="item">{{ item }}</li>
            </ul>
          </div>
        </transition>
      </li>

      <!-- Dystopia -->
      <li class="nav-item dropdown">
        <div class="dropdown-button">
          <RouterLink to="/logo">Dystopia</RouterLink>
          <button
            class="button"
            :class="{ open: openDropdown === 'dystopia' }"
            @click.prevent="toggleDropdown('dystopia')"
          >▼</button>
        </div>
        <transition name="dropdown">
          <div
            v-if="openDropdown === 'dystopia'"
            class="dropdown-content"
            id="dropdown-dystopia"
          >
            <ul>
              <li v-for="item in dystopiaItems" :key="item">{{ item }}</li>
            </ul>
          </div>
        </transition>
      </li>

      <!-- Magic -->
      <li class="nav-item dropdown">
        <div class="dropdown-button">
          <RouterLink to="/logo">Magic</RouterLink>
          <button
            class="button"
            :class="{ open: openDropdown === 'magic' }"
            @click.prevent="toggleDropdown('magic')"
          >▼</button>
        </div>
        <transition name="dropdown">
          <div
            v-if="openDropdown === 'magic'"
            class="dropdown-content"
            id="dropdown-magic"
          >
            <ul>
              <li v-for="item in magicItems" :key="item">{{ item }}</li>
            </ul>
          </div>
        </transition>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.sidebar {
  background: $purple;
  color: black;
  width: 150px;
  height: 100dvh;
  transition: width 0.2s ease-in-out;
  position: fixed;
  box-shadow: 0 0 5px 0 $purple;

  .logo-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
  }

  .nav {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;

    .subheader {
      text-align: center;
      font-weight: bold;
      border-top: 1px solid white;
      margin: 0.5rem 1rem;
      padding-top: 0.5rem;
      color: white;
    }

    .nav-item {
      background: white;
      margin: 0 0.5rem 0.5rem 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;

      a {
        color: black;
        padding: 0.25rem 0.5rem;
        width: 100%;
        text-align: center;
        border-radius: 10px;
      }

      &.dropdown {
        margin: 0 0.5rem 1rem 0.5rem;
        display: flex;
        flex-direction: column;

        .dropdown-button {
          position: relative;
          display: flex;
          width: 100%;

          .button {
            position: absolute;
            right: 50%;
            bottom: -15px;
            transform: translateX(50%) rotate(0deg);
            cursor: pointer;
            color: white;
            background: none;
            border: none;
            outline: none;
            transition: transform 250ms ease, color 250ms ease;

            &.open {
              color: black;
              transform: translateX(50%) rotate(180deg);
            }
          }
        }
      }

    }

    /* Transition classes for dropdown open/close */
    .dropdown-enter-from,
    .dropdown-leave-to {
      max-height: 0;
      opacity: 0;
    }

    .dropdown-enter-active,
    .dropdown-leave-active {
      transition: max-height 250ms ease, opacity 250ms ease;
      overflow: hidden;
    }

    .dropdown-enter-to,
    .dropdown-leave-from {
      max-height: 500px; /* large enough to show all items */
      opacity: 1;
    }

    .dropdown-content {
      margin: 0.5rem;

      ul {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      li {
        &:first-of-type {
          margin-top: .5rem;
        }

        opacity: 0;
        transform: translateY(10px);
        border: 1px solid $purple;
        margin-bottom: 0.5rem;
        padding: 0.25rem;
        border-radius: 10px;
        background: $purple;
        color: white;
      }
    }
  }
}
</style>
