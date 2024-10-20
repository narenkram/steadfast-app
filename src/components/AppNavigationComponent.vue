<template>
    <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
        <div class="container-fluid">
            <a class="navbar-brand p-0" href="#">
                <img src="/steadfast_logo.png" class="Navigation__logo img-fluid" alt="Steadfast" />
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item" v-for="route in routes" :key="route.path">
                        <RouterLink :to="route.path" class="nav-link"
                            :class="{ 'active-route': $route.path === route.path }">
                            {{ route.icon }} {{ route.name }}
                        </RouterLink>
                    </li>
                </ul>
                <!-- Always-on Notification Area -->
                <div class="notification-area d-flex align-items-center">
                    <div class="notification-icon me-2" :class="{ 'has-notification': showToast }">
                        <i class="bi bi-bell-fill"></i>
                    </div>
                    <div class="notification-message" :class="{ 'show-message': showToast }">
                        {{ toastMessage || 'No new notifications' }}
                    </div>
                    <button v-if="showToast" @click="updateToastVisibility(false)" class="btn btn-sm btn-close ms-2"
                        aria-label="Close"></button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useTradeView } from '@/composables/useTradingSystem';

const {
    showToast,
    toastMessage,
    notificationSound,
    selectedSound,
    updateToastVisibility
} = useTradeView();

const routes = ref([
    { path: '/steadfast', name: 'Trade', icon: '⚡' },
    { path: '/app-settings', name: 'Settings', icon: '⚙️' },
    { path: '/manage-brokers', name: 'Manage Brokers', icon: '🏦' },
    { path: '/parallel-copy-trade', name: 'Parallel Copy Trade', icon: '🔄' },
]);
</script>
