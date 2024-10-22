<template>
    <SiteMessageComponent />
    <!-- steadfast-app/src/components/NavigationComponent.vue -->
    <section class="Navigation NormalNavigationComponent">
        <nav class="navbar navbar-expand-lg">
            <div class="container-fluid">
                <RouterLink to="/" class="navbar-brand">
                    <img src="/steadfast_logo.png" class="Navigation__logo" alt="Steadfast" />
                    <span class="ms-2 fw-bold text-color">Steadfast</span>
                </RouterLink>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <font-awesome-icon icon="bars" class="text-color" />
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item" v-for="(route, index) in routes" :key="route.path">
                            <RouterLink :to="route.path" class="nav-link"
                                :class="{ 'active-route': $route.path === route.path }">
                                <font-awesome-icon :icon="route.icon" :class="['nav-icon', route.iconClass]" />
                                <span class="nav-text">{{ route.name }}</span>
                            </RouterLink>
                        </li>
                        <li class="nav-item" v-if="!user">
                            <RouterLink to="/login" class="nav-link">
                                <font-awesome-icon icon="key" class="nav-icon text-secondary" />
                                <span class="nav-text">Login</span>
                            </RouterLink>
                        </li>
                        <li class="nav-item" v-if="user">
                            <RouterLink to="/steadfast" class="nav-link">
                                <font-awesome-icon icon="bolt" class="nav-icon text-danger" />
                                Trade
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </section>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import SiteMessageComponent from '@/components/SiteMessageComponent.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default defineComponent({
    name: "NormalNavigationComponent",
    components: {
        SiteMessageComponent,
        FontAwesomeIcon
    },
    data() {
        return {
            routes: [
                { path: '/', name: 'Home', icon: ['fas', 'bolt'], iconClass: 'text-danger' },
                { path: '/about', name: 'About', icon: ['fas', 'lightbulb'], iconClass: 'text-warning' },
                { path: '/pricing', name: 'Pricing', icon: ['fas', 'dollar-sign'], iconClass: 'text-success' },
                { path: '/contact', name: 'Contact', icon: ['fas', 'comment'], iconClass: 'text-secondary' },
                { path: '/faq', name: 'FAQ', icon: ['fas', 'question-circle'], iconClass: 'text-purple' },
            ],
        };
    },
    setup() {
        const user = ref(null);

        onMounted(() => {
            const auth = getAuth();
            onAuthStateChanged(auth, (currentUser) => {
                user.value = currentUser;
            });
        });

        return {
            user,
        };
    },
});
</script>
