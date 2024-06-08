import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CreateAccount from '../views/CreateAccount.vue'
import AccountView from '../views/AccountView.vue'
import TradeView from '../views/TradeView.vue'
import store from '../stores/store'
import { IS_USER_AUTHENTICATED_GETTER } from '@/stores/storeconstants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        auth: false
      }
    },
    {
      path: '/create-account',
      name: 'create-account',
      component: CreateAccount,
      meta: {
        auth: false
      }
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: {
        auth: true
      }
    },
    {
      path: '/trade-view',
      name: 'trade-view',
      component: TradeView,
      meta: {
        auth: true
      }
    },

    // {
    //   path: '/account',
    //   name: 'account',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AccountView.vue')
    // }

  ]

})

router.beforeEach((to, from, next) => {
  // Temporary flag to disable auth for development
  const isDevelopment = true; // Set this to false to re-enable auth checks

  if (!isDevelopment) {
    if (
      'auth' in to.meta &&
      to.meta.auth &&
      !store.getters[`auth/${IS_USER_AUTHENTICATED_GETTER}`]
    ) {
      next('/login');
    } else if (
      'auth' in to.meta &&
      !to.meta.auth &&
      store.getters[`auth/${IS_USER_AUTHENTICATED_GETTER}`]
    ) {
      next('/trade-view');
    } else {
      next();
    }
  } else {
    next(); // Bypass all auth checks in development mode
  }
});

export default router
