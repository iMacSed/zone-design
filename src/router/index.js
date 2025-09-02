import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

export const constantRoutes = [
  {
    path: '/',
    name: 'Home',
    component: ()=>import('@/pages/Home.vue')
  },
  {
    path: '/CodeTextArea',
    name: 'CodeTextArea',
    component: ()=>import('@/components/CodeTextArea.vue')
  }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: constantRoutes
})

export default router
