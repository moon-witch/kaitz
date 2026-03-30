<template>
  <div>
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 200ms ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>