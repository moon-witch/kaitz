import { createRouter, createWebHistory } from 'vue-router'
import Landing from "@/views/Landing.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing,
      meta: { layout: 'default' }
    },
    {
      path: '/logo',
      name: 'logo',
      component: () => import('../views/LogoDisplay.vue'),
      meta: { layout: 'empty' }
    },
  ],
})

export default router
