import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Trickcal 工具集' }
  },
  {
    path: '/board',
    name: 'Board',
    component: () => import('@/views/Board.vue'),
    meta: { title: '金蠟筆記錄本' }
  },
  {
    path: '/sweep',
    name: 'Sweep',
    component: () => import('@/views/Sweep.vue'),
    meta: { title: '掃蕩工具' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守衛：更新頁面標題
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router

