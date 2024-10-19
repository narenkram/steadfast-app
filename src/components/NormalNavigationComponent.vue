<template>
    <SiteMessageComponent />
    <!-- steadfast-app/src/components/NavigationComponent.vue -->
    <section class="Navigation NormalNavigationComponent">
        <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
            <!-- <a class="navbar-brand p-0" href="#">
                <img src="/steadfast_logo.png" class="Navigation__logo img-fluid" alt="Steadfast" />
            </a> -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav justify-content-between w-100 mb-2 mb-lg-0">
                    <li class="nav-item" v-for="route in routes" :key="route.path">
                        <RouterLink :to="route.path" class="nav-link"
                            :class="{ 'active-route': $route.path === route.path }">
                            <font-awesome-icon :icon="route.icon" class="me-2" /> {{ route.name }}
                        </RouterLink>
                    </li>
                </ul>
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
                { path: '/', name: 'Home', icon: ['fas', 'bolt'] },
                { path: '/about', name: 'About', icon: ['fas', 'lightbulb'] },
                { path: '/pricing', name: 'Pricing', icon: ['fas', 'dollar-sign'] },
                { path: '/contact', name: 'Contact', icon: ['fas', 'comment'] },
                { path: '/faq', name: 'FAQ', icon: ['fas', 'question-circle'] },
                // { path: '/login', name: 'Login', icon: ['fas', 'key'] },
            ],
        };
    },
});
</script>
