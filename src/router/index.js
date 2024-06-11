import { createRouter, createWebHistory } from 'vue-router'
import AccountView from '../views/AccountView.vue'
import TradeView from '../views/TradeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'trade-view',
      component: TradeView,
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
    },

  ]

})
export default router
