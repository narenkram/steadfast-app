<template>
    <NormalNavigationComponent />
    <div class="container-fluid">

        <!-- Key Features Section -->
        <section class="row py-5">
            <div class="col-lg-10 mx-auto">
                <h2 class="text-center mb-5">Key Features</h2>
                <div class="row">
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4">1-Click Trading</h3>
                                <img src="/1click_arrow_keys.png" alt="Keyboard Shortcuts for Trading"
                                    class="img-fluid mb-3" style="max-height: 100px;">
                                <p class="card-text">Execute trades instantly using arrow keys, providing lightning-fast
                                    control for capturing real-time market opportunities.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4">Kill Switch</h3>
                                <video autoplay loop muted playsinline class="img-fluid mb-3"
                                    style="max-height: 100px;">
                                    <source src="/activate_killswitch.mp4" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <p class="card-text">Activate to prevent overtrading, block further trades for the day,
                                    and put your mind at ease. Helps protect profits and limit potential losses.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4">Enforces Discipline</h3>
                                <img src="/message_1.png" alt="Discipline Enforcing Messages" class="img-fluid mb-3"
                                    style="max-height: 100px;">
                                <p class="card-text">Receive timely alerts for trade outcomes, including success
                                    messages and warnings for losing trades. Helps maintain trading discipline and
                                    awareness.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4">Automatic TSL</h3>
                                <img src="/message_1.png" alt="Automatic Trailing Stop Loss" class="img-fluid mb-3"
                                    style="max-height: 100px;">
                                <p class="card-text">Implement automatic profit trailing with Trailing Stop Loss on
                                    individual positions, maximizing gains while minimizing risks.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4">MTM Trailing</h3>
                                <img src="/message_1.png" alt="MTM Trailing" class="img-fluid mb-3"
                                    style="max-height: 100px;">
                                <p class="card-text">Enable automatic trailing on overall Mark-to-Market (MTM), ensuring
                                    optimal performance across your entire portfolio.</p>
                            </div>
                        </div>
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
