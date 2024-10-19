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
                        <li class="nav-item" v-for="route in routes" :key="route.path">
                            <RouterLink :to="route.path" class="nav-link"
                                :class="{ 'active-route': $route.path === route.path }">
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

<style scoped lang="scss">
.Navigation {
    padding: 0.5rem 0;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.navbar {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 0 0 1rem 1rem;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.navbar-nav {
    gap: 0.5rem;
}

.nav-link {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.3s ease;
    color: var(--bs-body-color);

    &:hover,
    &.active-route {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }

    .nav-icon {
        font-size: 1.2rem;
        margin-right: 0.5rem;
        transition: transform 0.3s ease;
    }

    .nav-text {
        font-size: 0.9rem;
        font-weight: 600;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }

    &:hover {
        .nav-icon {
            transform: scale(1.1) rotate(15deg);
        }

        .nav-text {
            opacity: 1;
        }
    }
}

.Navigation__logo {
    height: 40px;
    width: auto;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }
}

@media (max-width: 991px) {
    .navbar-nav {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
        padding: 0.5rem;
    }
}
</style>
