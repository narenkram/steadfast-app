<template>
    <SiteMessageComponent />
    <section class="Navigation AppNavigationComponent">
        <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
            <div class="container-fluid pt-0">
                <RouterLink to="/" class="navbar-brand d-none">
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
                    <NotificationComponent v-model:showToast="showToast" v-model:message="toastMessage"
                        :notificationSound="notificationSound" :selectedSound="selectedSound" />
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
                        <NotificationComponent v-model:showToast="showToast" v-model:message="toastMessage"
                            :notificationSound="notificationSound" :selectedSound="selectedSound" />
                    </div>
                    <div class="ms-auto" v-if="user">
                        <button class="btn btn-outline-secondary" @click="logout">Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTradeView } from '@/composables/useTradingSystem';
import { FontAwesomeIcon } from '@/font-awesome';
import SiteMessageComponent from '@/components/SiteMessageComponent.vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import NotificationComponent from './NotificationComponent.vue'

const {
    showToast,
    toastMessage,
    notificationSound,
    selectedSound,
} = useTradeView();

const routes = ref([
    { path: '/steadfast', name: 'Trade', icon: ['fas', 'bolt'], iconClass: 'text-danger' },
    { path: '/app-settings', name: 'Settings', icon: ['fas', 'cog'], iconClass: 'text-purple' },
    { path: '/manage-brokers', name: 'Brokers', icon: ['fas', 'dollar-sign'], iconClass: 'text-success' },
    { path: '/dashboard', name: 'Account', icon: ['fas', 'user-astronaut'], iconClass: 'text-secondary' },
    // { path: '/parallel-copy-trade', name: 'Parallel Copy Trade', icon: ['fas', 'sync'], iconClass: 'text-info' },
]);

const user = ref(null);

const router = useRouter();

onMounted(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
    });
});

const logout = async () => {
    const auth = getAuth();
    try {
        await signOut(auth);
        // Redirect to the login page after successful logout
        router.push('/login');
    } catch (error) {
        console.error('Error during logout:', error);
    }
};
</script>
