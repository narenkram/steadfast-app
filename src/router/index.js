import { createRouter, createWebHistory } from 'vue-router'
import TradeView from '@/views/TradeView.vue'
import ManageBrokers from '@/views/ManageBrokersView.vue'
import AddBroker from '@/views/AddBrokerView.vue'
import Flattrade_Redirect from '@/views/BrokerRedirect/Flattrade_Redirect.vue'
import HomeView from '@/views/HomeView.vue'
import AppSettingsView from '@/views/AppSettingsView.vue'
import ParallelCopyTradeView from '@/views/ParallelCopyTradeView.vue'
import PricingView from '@/views/PricingView.vue'
import LoginView from '@/views/LoginView.vue'
import AboutView from '@/views/AboutView.vue'
import ContactView from '@/views/ContactView.vue'
import FaqView from '@/views/FaqView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: PricingView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
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
  ]
})

export default router
