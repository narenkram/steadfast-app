<template>
    <!-- steadfast-app/src/components/NavigationComponent.vue -->
    <section class="Navigation">
        <nav class="navbar navbar-expand-lg shadow-sm mt-0 mb-3">
            <a class="navbar-brand p-0" href="#">
                <img src="/steadfast_logo.png" class="Navigation__logo img-fluid" alt="Steadfast" />
            </a>
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
                            {{ route.icon }} {{ route.name }}
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </nav>
    </section>
</template>

<script>
export default {
    name: "NormalNavigationComponent",
    data() {
        return {
            routes: [
                { path: '/', name: 'Home', icon: '⚡' },
                { path: '/pricing', name: 'Pricing', icon: '💰' },
                { path: '/login', name: 'Login', icon: '🔑' },
            ],
        };
    },
}
</script>