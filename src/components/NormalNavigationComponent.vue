<template>
    <SiteMessageComponent />
    <!-- steadfast-app/src/components/NavigationComponent.vue -->
    <section class="Navigation NormalNavigationComponent">
        <nav class="navbar navbar-expand-lg">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img src="/steadfast_logo.png" class="Navigation__logo" alt="Steadfast" />
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item" v-for="(route, index) in routes" :key="route.path">
                            <RouterLink :to="route.path" class="nav-link"
                                :class="{ 'active-route': $route.path === route.path }"
                                :style="{ '--icon-color': route.color }">
                                <font-awesome-icon :icon="route.icon" class="nav-icon" />
                                <span class="nav-text">{{ route.name }}</span>
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </section>
</template>

<script>
import { defineComponent } from 'vue';
import SiteMessageComponent from '@/components/SiteMessageComponent.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default defineComponent({
    name: "NormalNavigationComponent",
    components: {
        SiteMessageComponent,
        FontAwesomeIcon
    },
    data() {
        return {
            routes: [
                { path: '/', name: 'Home', icon: ['fas', 'bolt'], color: '#FFD700' },
                { path: '/about', name: 'About', icon: ['fas', 'lightbulb'], color: '#4CAF50' },
                { path: '/pricing', name: 'Pricing', icon: ['fas', 'dollar-sign'], color: '#2196F3' },
                { path: '/contact', name: 'Contact', icon: ['fas', 'comment'], color: '#FF5722' },
                { path: '/faq', name: 'FAQ', icon: ['fas', 'question-circle'], color: '#9C27B0' },
                // { path: '/login', name: 'Login', icon: ['fas', 'key'], color: '#607D8B' },
            ],
        };
    },
});
</script>