<template>
    <NormalNavigationComponent />
    <div class="container-fluid">

        <!-- Key Features Section -->
        <section class="row py-5">
            <div class="col-lg-10 mx-auto">
                <h2 class="text-center mb-5">Key Features</h2>
                <div class="row">
                    <div class="col-md-4 mb-4 text-center">
                        <img src="/1click_arrow_keys.png" alt="1-Click Trading" class="img-fluid mb-3"
                            style="max-height: 100px;">
                        <h3>1-Click Trading</h3>
                        <p>Execute trades with lightning speed, perfect for capturing real-time market opportunities.
                        </p>
                    </div>
                    <div class="col-md-4 mb-4 text-center">
                        <h3>Kill Switch</h3>
                        <p>Automatically block overtrading to protect your profits or prevent excessive losses.</p>
                    </div>
                    <div class="col-md-4 mb-4 text-center">
                        <h3>Enforces Discipline</h3>
                        <p>Set predefined deployment values and risk limits to protect your capital.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why Steadfast Section -->
        <section class="row py-5 bg-light">
            <div class="col-lg-10 mx-auto">
                <h2 class="text-center mb-5 display-4">Why Choose Steadfast?</h2>
                <p class="lead text-center mb-5 text-muted">Designed to help small retail traders survive and thrive in
                    the options market.</p>
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h4 class="card-title mb-4 text-primary">
                                    🛠️ Advanced Features
                                </h4>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">
                                        ✅ Kill Switch
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Enforces discipline
                                    </li>
                                    <li class="list-group-item">
                                        ✅ 1-Click Trading buttons
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Automatic Trailing Stop-loss
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Automatic MTM Trailing
                                    </li>
                                </ul>
                                <p class="mt-3 text-muted small">
                                    <strong>Note on Kill Switch:</strong> This client-side feature acts as a
                                    psychological safeguard. It does not affect your ability to trade directly
                                    through your broker's platform.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h4 class="card-title mb-4 text-primary">
                                    👥 Multi-Account Support
                                </h4>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">
                                        ✅ Supports truly free broker platforms
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Real-time LTP via your broker's API
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Dual Mode reliability for LTP Data
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Basket Orders
                                    </li>
                                    <li class="list-group-item">
                                        ✅ Simultaneous trading across multiple accounts
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Multi-Broker Support Section -->
        <section class="row py-5">
            <div class="col-lg-10 mx-auto text-center">
                <h2 class="mb-5">Supported Brokers</h2>
                <div class="d-flex justify-content-center align-items-center mb-4">
                    <img src="/flattrade_logo.png" alt="Flattrade" class="img-fluid mx-3" style="max-height: 50px;">
                    <img src="/shoonya_logo.png" alt="Shoonya" class="img-fluid mx-3" style="max-height: 50px;">
                </div>
                <p>Seamlessly integrate with Flattrade, and Shoonya. Manage all your accounts from one platform.
                </p>
            </div>
        </section>

    </div>
</template>
<script setup>
import { ref } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
</script>
