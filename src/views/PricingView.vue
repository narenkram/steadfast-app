<template>
    <NormalNavigationComponent />
    <div class="container-fluid py-5">
        <!-- Pricing Section -->
        <section class="row">
            <div class="col-lg-10 mx-auto">
                <div class="text-center mb-5">
                    <h2 class="display-4 fw-bold mb-3">Unleash Your Trading Potential</h2>
                    <p class="lead">Choose the perfect plan that suits your trading needs</p>
                </div>
                <div class="row justify-content-center g-4">
                    <!-- Open Source Version -->
                    <div class="col-lg-6">
                        <div class="card shadow-lg border-0 rounded-lg overflow-hidden h-100">
                            <div class="card-header bg-primary text-white text-center py-4">
                                <h3 class="mb-0 fw-bold">Open Source</h3>
                            </div>
                            <div class="card-body">
                                <div class="text-center mb-4">
                                    <p class="text-uppercase fw-bold mb-1">SELF-HOSTED</p>
                                    <p class="display-3 text-primary mb-0">
                                        <span class="text-color">FREE</span>
                                    </p>
                                    <p class="text-muted mt-2">Localhost</p>
                                </div>
                                <ul class="list-group list-group-flush mb-4">
                                    <li class="list-group-item d-flex align-items-center">
                                        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                        All Core Trading Features
                                    </li>
                                    <li class="list-group-item d-flex align-items-center">
                                        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                        Same Features as Cloud Version
                                    </li>
                                    <li class="list-group-item d-flex align-items-center">
                                        <font-awesome-icon :icon="['fas', 'info-circle']" class="text-primary me-2" />
                                        Manual Updates Required
                                    </li>
                                    <li class="list-group-item d-flex align-items-center">
                                        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                        Run Locally on your machine
                                    </li>
                                    <li class="list-group-item d-flex align-items-center">
                                        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                        Community Support
                                    </li>
                                </ul>
                                <div class="text-center">
                                    <a href="https://github.com/narenkram/steadfast-monorepo" target="_blank"
                                        class="btn btn-primary btn-lg px-5 py-3 fw-bold">
                                        Get Started
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cloud Version -->
                    <div class="col-lg-6">
                        <div class="card shadow-lg border-0 rounded-lg overflow-hidden h-100">
                            <div class="card-header bg-success text-white text-center py-4">
                                <h3 class="mb-0 fw-bold">Cloud Premium</h3>
                                <span class="badge bg-warning text-dark mt-2">Coming Soon</span>
                            </div>
                            <div class="card-body">
                                <div class="text-center mb-4">
                                    <p class="text-uppercase fw-bold mb-1">CLOUD HOSTED</p>
                                    <p class="display-3 text-primary mb-0">
                                        <span class="text-decoration-line-through text-muted"
                                            style="font-size: 0.5em;">₹1199</span>
                                        <span class="text-color">₹499</span>
                                    </p>
                                    <p class="h3 mb-0">₹499<span class="fs-6"> / month</span></p>
                                    <p class="text-success fw-bold mt-2">Launch Offer: 58% OFF</p>
                                </div>
                                <ul class="list-group list-group-flush mb-4">
                                    <li class="list-group-item d-flex align-items-center">
                                        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-success me-2" />
                                        Automatic Updates & Maintenance
                                    </li>
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
                                    <button class="btn btn-success btn-lg px-5 py-3 fw-bold" disabled>Coming
                                        Soon</button>
                                </div>
                            </div>
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
