<template>
    <NormalNavigationComponent />
    <div class="container-fluid">
        <!-- About Section -->
        <section class="row py-5">
            <div class="col-lg-8 mx-auto text-center">
                <h1 class="display-3 mb-4 fw-bold">Empowering Traders</h1>
                <p class="lead mb-5">
                    Steadfast: Crafted by a trader, for traders. On a mission to revolutionize the trading experience
                    with powerful tools and intuitive design.
                </p>

                <div class="row mb-5">
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body">
                                <h3 class="h4 mb-3">🚀 Community-Driven Evolution</h3>
                                <p>
                                    The power of collective wisdom is harnessed. Steadfast evolves continuously, shaped
                                    by
                                    the insights and needs of the vibrant trading community.
                                </p>
                                <a href="https://t.me/steadfastapp" target="_blank" class="btn btn-outline btn-md">
                                    💬 Join Telegram Community
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body">
                                <h3 class="h4 mb-3">💡 The Guiding Vision</h3>
                                <p>
                                    The goal is to deliver a trading platform that's not just reliable and efficient,
                                    but truly
                                    transformative. The aim is to enhance decision-making and elevate the trading
                                    journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-5 p-4 bg-color-2 rounded shadow-sm developer-info">
                    <p class="mb-2">
                        Designed and developed with <span class="heart-icon">❤️</span> by
                    </p>
                    <a href="https://narenkram.com" target="_blank" rel="noopener noreferrer"
                        class="text-decoration-none text-danger fw-bold h5 developer-link">
                        narenkram
                    </a>
                    <p class="text-muted mt-2">
                        UX Engineer & Trading Enthusiast
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import NormalNavigationComponent from '@/components/LandingNavigationComponent.vue';

onMounted(() => {
    // Any necessary mounted logic
});
</script>