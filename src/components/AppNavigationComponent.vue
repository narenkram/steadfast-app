<template>
    <SiteMessageComponent />
    <section class="Navigation AppNavigationComponent">
        <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
            <div class="container-fluid pt-0">
                <RouterLink to="/" class="navbar-brand">
                    <img src="/steadfast_logo.png" class="Navigation__logo" alt="Steadfast" />
                    <span class="ms-2 fw-bold text-color d-none d-md-inline">Steadfast</span>
                </RouterLink>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <font-awesome-icon icon="bars" class="text-color" />
                </button>
                <!-- Always-on Notification Area -->
                <div class="notification-area d-flex align-items-center ms-3 d-lg-none">
                    <div class="notification-icon me-2" :class="{ 'has-notification': showToast }">
                        <font-awesome-icon icon="bell" />
                    </div>
                    <div class="notification-message" :class="{ 'show-message': showToast }">
                        {{ toastMessage || 'No new notifications' }}
                    </div>
                </div>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-md-auto">
                        <li class="nav-item" v-for="route in routes" :key="route.path">
                            <RouterLink :to="route.path" class="nav-link"
                                :class="{ 'active-route': $route.path === route.path }">
                                <font-awesome-icon :icon="route.icon" :class="['nav-icon', route.iconClass]" />
                                <span class="nav-text">{{ route.name }}</span>
                            </RouterLink>
                        </li>
                    </ul>
                    <!-- Always-on Notification Area -->
                    <div class="notification-area d-none d-lg-flex align-items-center ms-3">
                        <div class="notification-icon me-2" :class="{ 'has-notification': showToast }">
                            <font-awesome-icon icon="bell" />
                        </div>
                        <div class="notification-message" :class="{ 'show-message': showToast }">
                            {{ toastMessage || 'No new notifications' }}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </section>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTradeView } from '@/composables/useTradingSystem';
import { FontAwesomeIcon } from '@/font-awesome';
import SiteMessageComponent from '@/components/SiteMessageComponent.vue';

const {
    showToast,
    toastMessage,
    notificationSound,
    selectedSound,
    updateToastVisibility,
} = useTradeView();

const routes = ref([
    { path: '/steadfast', name: 'Trade', icon: ['fas', 'bolt'], iconClass: 'text-danger' },
    { path: '/app-settings', name: 'Settings', icon: ['fas', 'cog'], iconClass: 'text-warning' },
    { path: '/manage-brokers', name: 'Brokers', icon: ['fas', 'dollar-sign'], iconClass: 'text-success' },
    // { path: '/parallel-copy-trade', name: 'Parallel Copy Trade', icon: ['fas', 'sync'], iconClass: 'text-info' },
]);

const audio = ref(null);
const notificationTimer = ref(null);

watch([showToast, toastMessage], ([newShowToast, newToastMessage], [oldShowToast, oldToastMessage]) => {
    if (newShowToast && (newShowToast !== oldShowToast || newToastMessage !== oldToastMessage)) {
        if (notificationSound.value) {
            playNotificationSound();
        }
        startNotificationTimer();
    }
});

const playNotificationSound = () => {
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
    }
    audio.value = new Audio(selectedSound.value);
    audio.value.play().catch(error => console.error('Error playing notification sound:', error));
};

const startNotificationTimer = () => {
    if (notificationTimer.value) {
        clearTimeout(notificationTimer.value);
    }
    notificationTimer.value = setTimeout(() => {
        clearNotification();
    }, 3000); // Hide after 3 seconds
};

const clearNotification = () => {
    updateToastVisibility(false);
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
    }
    if (notificationTimer.value) {
        clearTimeout(notificationTimer.value);
    }
};
</script>
