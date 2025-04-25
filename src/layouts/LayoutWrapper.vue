<script setup lang="ts">
import { shallowRef, watch, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { Component } from 'vue'

// define both layouts as actual Vue components
const layouts: Record<'default'|'empty', Component> = {
  default: DefaultLayout,
  empty: defineAsyncComponent(() => import('@/layouts/EmptyLayout.vue')),
}

type LayoutKey = keyof typeof layouts

const route = useRoute()

// compute the *desired* layout key from route.meta
const layoutName = computed<LayoutKey>(() => {
  const m = route.meta.layout
  return (typeof m === 'string' && m in layouts ? m : 'default') as LayoutKey
})

// initialize to the default layout
const layoutComponent = shallowRef<Component>(layouts.default)
const currentLayoutName = shallowRef<LayoutKey>('default')

// only re-assign when the layout key really changes
watch(layoutName, (newLayout) => {
  if (newLayout !== currentLayoutName.value) {
    layoutComponent.value = layouts[newLayout]
    currentLayoutName.value = newLayout
  }
})
</script>

<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>
