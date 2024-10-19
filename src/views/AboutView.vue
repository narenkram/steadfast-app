<template>
    <NormalNavigationComponent />
    <div class="container-fluid">
        <!-- About Section -->
        <section class="row py-5 bg-gradient">
            <div class="col-lg-8 mx-auto text-center">
                <h1 class="display-3 mb-4 fw-bold">Empowering Traders</h1>
                <p class="lead mb-5">
                    Steadfast: Crafted by a trader, for traders. Our mission is to revolutionize your trading experience
                    with powerful tools and intuitive design.
                </p>

                <div class="row mb-5">
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body">
                                <h3 class="h4 mb-3">🚀 Community-Driven Evolution</h3>
                                <p>
                                    We harness the power of collective wisdom. Steadfast evolves continuously, shaped by
                                    the insights and needs of our vibrant trading community.
                                </p>
                                <a href="https://t.me/steadfastapp" target="_blank" class="btn btn-primary btn-sm mt-3">
                                    Join Our Telegram Community
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body">
                                <h3 class="h4 mb-3">💡 Our Guiding Vision</h3>
                                <p>
                                    To deliver a trading platform that's not just reliable and efficient, but truly
                                    transformative. We're here to enhance your decision-making and elevate your trading
                                    journey.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-5 p-4 bg-white rounded shadow-sm">
                    <p class="mb-2">
                        Designed and developed with ❤️ by
                    </p>
                    <a href="https://narenkram.com" target="_blank" rel="noopener noreferrer"
                        class="text-decoration-none fw-bold h5">
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
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';

onMounted(() => {
    // Any necessary mounted logic
});
</script>

<style scoped>
.bg-gradient {
    background: var(--custom-gradient);
}

.hover-effect {
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
