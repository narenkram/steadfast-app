<template>
  <section class="Navigation AppNavigationComponent">
    <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
      <div class="container-fluid pt-0">
        <RouterLink to="/" class="navbar-brand d-none">
          <img src="/steadfast_logo.png" class="Navigation__logo" alt="Steadfast" />
          <span class="ms-2 fw-bold text-color d-none d-md-inline">Steadfast</span>
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <font-awesome-icon icon="bars" class="text-color" />
        </button>
        <!-- Always-on Notification Area -->
        <div class="notification-area d-flex align-items-center ms-3 d-lg-none">
          <NotificationComponent
            v-model:showToast="showToast"
            v-model:message="toastMessage"
            :notificationSound="notificationSound"
          />
        </div>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-md-auto">
            <li class="nav-item" v-for="route in routes" :key="route.path">
              <RouterLink
                v-if="!route.external"
                :to="route.path"
                class="nav-link"
                :class="{ 'active-route': $route.path === route.path }"
              >
                <font-awesome-icon :icon="route.icon" :class="['nav-icon', route.iconClass]" />
                <span class="nav-text">{{ route.name }}</span>
              </RouterLink>
              <a v-else :href="route.path" target="_blank" class="nav-link premium-button">
                <div class="premium-button-background"></div>
                <font-awesome-icon :icon="route.icon" :class="['nav-icon', route.iconClass]" />
                <span class="nav-text">{{ route.name }}</span>
              </a>
            </li>
          </ul>
          <!-- Always-on Notification Area -->
          <div class="notification-area d-none d-lg-flex align-items-center ms-3">
            <NotificationComponent
              v-model:showToast="showToast"
              v-model:message="toastMessage"
              :notificationSound="notificationSound"
            />
          </div>
        </div>
      </div>
    </nav>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@/font-awesome'
import { useRouter } from 'vue-router'
import NotificationComponent from './NotificationComponent.vue'

// Global State
import { notificationSound, toastMessage, showToast } from '@/stores/globalStore'

const routes = ref([
  { path: '/steadfast', name: 'Trade', icon: ['fas', 'bolt'], iconClass: 'text-danger' },
  { path: '/app-settings', name: 'Settings', icon: ['fas', 'cog'], iconClass: 'text-purple' },
  {
    path: '/manage-brokers',
    name: 'Brokers',
    icon: ['fas', 'dollar-sign'],
    iconClass: 'text-success'
  },
  {
    path: 'https://www.steadfastapp.in',
    name: 'Get Premium',
    icon: ['fas', 'gem'],
    iconClass: 'text-white',
    external: true
  }
])

const router = useRouter()
</script>

<style scoped>
.premium-button {
  position: relative;
  overflow: hidden;
  color: white !important;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.premium-button-background {
  position: absolute;
  width: 102%;  /* Slightly wider to prevent gaps */
  height: 102%; /* Slightly taller to prevent gaps */
  background-image: url('/colors.png');
  background-size: 200% 100%;
  opacity: 0.8;
  z-index: -1;
  left: -1%;  /* Offset to center the expanded element */
  top: -1%;   /* Offset to center the expanded element */
  background-color: black;
  background-repeat: repeat-x;
  animation: moveBackgroundWithVibration 15s linear infinite;
}

@keyframes moveBackgroundWithVibration {
  0% { 
    background-position: 0 0;
    transform: translateY(0);
  }
  10% {
    transform: translateY(-1px);
  }
  20% {
    transform: translateY(1px);
  }
  30% {
    transform: translateY(-1px);
  }
  40% {
    transform: translateY(1px);
  }
  50% { 
    background-position: -100% 0;
    transform: translateY(-1px);
  }
  60% {
    transform: translateY(1px);
  }
  70% {
    transform: translateY(-1px);
  }
  80% {
    transform: translateY(1px);
  }
  90% {
    transform: translateY(-1px);
  }
  100% { 
    background-position: -200% 0;
    transform: translateY(0);
  }
}

.premium-button:hover .premium-button-background {
  animation-duration: 7s;
}
.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.premium-button .nav-icon {
  color: white !important;
  position: relative;
  z-index: 2;
}

.premium-button .nav-text {
  color: white !important;
  opacity: 1;
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
