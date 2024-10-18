<template>
    <NormalNavigationComponent />
    <div class="container-fluid">
        <!-- About Section -->
        <section class="row py-5 bg-light">
            <div class="col-lg-8 mx-auto text-center">
                <h2 class="display-4 mb-4">About Steadfast</h2>
                <p class="lead mb-4">
                    Steadfast is an app built by a trader, for traders. It's committed to empowering the trading
                    community with powerful tools and intuitive design.
                </p>
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <h3 class="h5 mb-3">🚀 Community-Driven Improvements</h3>
                        <p>
                            Steadfast believes in the power of collective wisdom. The app evolves with continuous
                            feedback and
                            suggestions from its vibrant trading community, ensuring that it always meets the real
                            needs of traders.
                        </p>
                        <a href="https://t.me/steadfastapp" target="_blank" class="btn btn-outline-primary btn-sm">
                            Join Telegram Community
                        </a>
                    </div>
                </div>
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <h3 class="h5 mb-3">💡 The Mission</h3>
                        <p>
                            To provide traders with a reliable, efficient, and user-friendly platform that enhances
                            their trading experience and helps them make informed decisions.
                        </p>
                    </div>
                </div>
                <p class="mt-5">
                    Designed and developed with ❤️ by
                    <a href="https://narenkram.com" target="_blank" rel="noopener noreferrer"
                        class="text-decoration-none fw-bold">
                        narenkram
                    </a>
                </p>
                <p class="text-muted">
                    UX Engineer & Trading Enthusiast
                </p>
            </div>
        </section>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';

onMounted(() => {
    // Any necessary mounted logic
});
</script>
