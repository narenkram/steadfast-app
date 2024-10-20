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
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import SignUpView from '@/views/SignUpView.vue'
import DashboardView from '@/views/account/DashboardView.vue'

const requireAuth = (to, from, next) => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      next()
    } else {
      next('/login')
    }
  })
}

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
      component: ManageBrokers,
      beforeEnter: requireAuth
    },
    {
      path: '/steadfast',
      name: 'trade-view',
      component: TradeView,
      beforeEnter: requireAuth
    },
    {
      path: '/add-broker',
      name: 'add-broker',
      component: AddBroker,
      beforeEnter: requireAuth
    },
    {
      path: '/flattrade/redirect',
      component: Flattrade_Redirect
    },
    {
      path: '/app-settings',
      name: 'AppSettingsView',
      component: AppSettingsView,
      beforeEnter: requireAuth
    },
    {
      path: '/parallel-copy-trade',
      name: 'ParallelCopyTradeView',
      component: ParallelCopyTradeView,
      beforeEnter: requireAuth
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUpView
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top
    return { top: 0 }
  },
  beforeEach(to, from, next) {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const currentUser = getAuth().currentUser

    if (requiresAuth && !currentUser) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
