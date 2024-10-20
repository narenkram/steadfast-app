<template>
    <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
        <div class="container-fluid">
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
                        <font-awesome-icon icon="bell" />
                    </div>
                    <div class="notification-message" :class="{ 'show-message': showToast }">
                        {{ toastMessage || 'No new notifications' }}
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTradeView } from '@/composables/useTradingSystem';
import { FontAwesomeIcon } from '@/font-awesome';

const {
    showToast,
    toastMessage,
    notificationSound,
    selectedSound,
} = useTradeView();

const routes = ref([
    { path: '/steadfast', name: 'Trade', icon: '⚡' },
    { path: '/app-settings', name: 'Settings', icon: '⚙️' },
    { path: '/manage-brokers', name: 'Brokers', icon: '🏦' },
    // { path: '/parallel-copy-trade', name: 'Parallel Copy Trade', icon: '🔄' },
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
