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
                    <li class="nav-item">
                        <RouterLink to="/steadfast" class="nav-link">⚡ Trade</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/option-chain" class="nav-link">⛓️ Option Chain</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/app-settings" class="nav-link">⚙️ Settings</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/manage-brokers" class="nav-link">🏦 Manage Brokers</RouterLink>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/parallel-copy-trade" class="nav-link">🔄 Parallel Copy Trade</RouterLink>
                    </li>
                </ul>
            </div>
        </nav>
    </section>
</template>

<script>
export default {
    name: "NavigationComponent",
}
</script>

<style scoped>
/* You can add styles for the component here */
</style>