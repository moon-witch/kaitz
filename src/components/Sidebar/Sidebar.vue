<script setup lang="ts">
import { ref } from 'vue'
import KaitzLogo   from '@/components/KaitzLogo.vue'
import NavItem     from '@/components/Sidebar/NavItem.vue'
import NavDropdown from '@/components/Sidebar/NavDropdown.vue'
import { navItems } from '@/components/Sidebar/sidebar.config'
import type { StoryKey, NavItemData, DropItem } from '@/components/Sidebar/sidebar.config'

const openDropdown = ref<StoryKey|null>(null)
function toggleDropdown(key: StoryKey) {
  openDropdown.value = openDropdown.value === key ? null : key
}

const sidebarOpen = ref(true)
</script>

<template>
  <section class="sidebar" :class="{'open': sidebarOpen}">
    <div v-if="sidebarOpen"class="logo-wrapper"><KaitzLogo/></div>
    <ul v-if="sidebarOpen" class="nav">
      <template v-for="item in navItems" :key="item.label">
        <NavItem
          v-if="item.type === 'link'"
          :label="item.label"
          :to="item.to"
        />
      </template>
      <li class="subheader">Stories</li>
      <template v-for="item in navItems" :key="item.label">
        <NavDropdown
          v-if="item.type === 'drop'"
          :label="item.label"
          :items="(item as DropItem).items"
          :open="openDropdown === item.key"
          :keyName="item.key"
          @toggle="toggleDropdown(item.key)"
        />
      </template>
    </ul>
    <button class="sidebarButton" :class="{'open': sidebarOpen}" @click="sidebarOpen = !sidebarOpen">
      ▼
    </button>
  </section>
</template>

<style scoped lang="scss">
.sidebar {
  background: $purple;
  width: 150px;
  height: 100dvh;
  position: fixed;
  box-shadow: 0 0 5px 0 $purple;
  overflow: visible;
  transition: all 0.1s ease-in-out;

  &:not(.open) {
    width: 20px;
    overflow: hidden;
  }
  .logo-wrapper {
    display:flex;
    justify-content:center;
    padding-top:1rem;
    overflow: hidden;
  }

  .nav {
    margin-top:1rem;
    display:flex;flex-direction:column;
    gap:.5rem;
    .subheader {
      text-align:center; font-weight:bold;
      border-top:1px solid white;
      padding-top:.5rem; margin:0 .5rem;
      color:white;
    }
  }

  .sidebarButton {
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
    background: $purple;
    border: none;
    color: white;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    cursor: pointer;
    transition: all .2s ease-in-out;

    &:not(.open) {
      transform: translateY(-50%) rotate(-90deg);
      border-bottom-right-radius: 10px;
      border-bottom-left-radius: 10px;
      right: -3px;
    }
  }
}
</style>
