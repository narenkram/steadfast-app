<template>
    <NormalNavigationComponent />
    <div class="container-fluid bg-gradient py-5">
        <!-- Pricing Section -->
        <section class="row">
            <div class="col-lg-8 col-xl-6 mx-auto">
                <div class="text-center mb-5">
                    <h2 class="display-4 fw-bold mb-3">Unleash Your Trading Potential</h2>
                    <p class="lead">Experience the power of Steadfast with our exclusive launch offer!</p>
                </div>
                <div class="card shadow-lg border-0 rounded-lg overflow-hidden">
                    <div class="card-header bg-primary text-white text-center py-4">
                        <h3 class="mb-0 fw-bold">Go Steadfast</h3>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-4">
                            <p class="text-uppercase fw-bold mb-1">FOR 1 MONTH</p>
                            <p class="display-3 text-primary mb-0">
                                <!-- <span class="text-decoration-line-through text-muted"
                                    style="font-size: 0.5em;">₹1199</span> -->
                                <span class="text-success">FREE</span>
                            </p>
                            <p class="h3 text-primary mb-0">₹0<span class="fs-6"> / month</span></p>
                            <p class="text-success fw-bold mt-2">Launch Offer: 100% OFF</p>
                        </div>
                        <ul class="list-group list-group-flush mb-4">
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                2 Broker(s) Allowed (Flattrade, Shoonya)
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'clock']" class="text-warning me-2" />
                                1 Paper Trading Account (Coming Soon)
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Automatic SL, Target when you place an order
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Predefined SL & Target
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Order Types: Market, Limit
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Loss and Profit Alerts
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Keyboard Shortcuts
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Trailing SL - TSL
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Live MTM update
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                Adjust SL & Target
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'clock']" class="text-warning me-2" />
                                Parallel Copy Trading (Coming Soon)
                            </li>
                            <li class="list-group-item d-flex align-items-center">
                                <font-awesome-icon :icon="['fas', 'clock']" class="text-warning me-2" />
                                More Brokers (Coming Soon)
                            </li>
                        </ul>
                        <div class="text-center">
                            <button class="btn btn-primary btn-lg px-5 py-3 fw-bold">Subscribe Now</button>
                        </div>
                    </div>
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

.card {
    transition: transform 0.3s ease-in-out;
}

.card:hover {
    transform: translateY(-10px);
}
</style>
