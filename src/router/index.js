// Vue Router
import { createRouter, createWebHistory } from 'vue-router'

// App Views
import TradeView from '@/pages/app/TradeView.vue'
import ManageBrokers from '@/pages/app/ManageBrokersView.vue'
import AddBroker from '@/pages/app/AddBrokerView.vue'
import AppSettingsView from '@/pages/app/AppSettingsView.vue'
import ParallelCopyTradeView from '@/pages/app/ParallelCopyTradeView.vue'

// Landing Pages
import HomeView from '@/pages/landing/HomeView.vue'

// Broker Integration
import Flattrade_Redirect from '@/pages/BrokerRedirect/Flattrade_Redirect.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/manage-brokers',
      name: 'manage-brokers',
      component: ManageBrokers
    },
    {
      path: '/steadfast',
      name: 'trade-view',
      component: TradeView
    },
    {
      path: '/add-broker',
      name: 'add-broker',
      component: AddBroker
    },
    {
      path: '/flattrade/redirect',
      component: Flattrade_Redirect
    },
    {
      path: '/app-settings',
      name: 'AppSettingsView',
      component: AppSettingsView
    },
    {
      path: '/parallel-copy-trade',
      name: 'ParallelCopyTradeView',
      component: ParallelCopyTradeView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router
