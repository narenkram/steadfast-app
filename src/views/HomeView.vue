<template>
    <NormalNavigationComponent />
    <div class="container-fluid">

        <!-- Key Features Section -->
        <section class="row py-5 bg-color-2 rounded">
            <div class="col-lg-10 mx-auto">
                <h2 class="text-center mb-5 display-4 fw-bold">Revolutionize Your Trading</h2>
                <p class="lead text-center mb-5">Discover the cutting-edge features that set us apart</p>
                <div class="row">
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4 fw-bold">1-Click Trading</h3>
                                <img src="/1click_arrow_keys.png" alt="Keyboard Shortcuts for Trading"
                                    class="img-fluid mb-3 rounded" style="max-height: 100px;">
                                <p class="card-text">Execute trades instantly using arrow keys, providing lightning-fast
                                    control for capturing real-time market opportunities.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4 fw-bold">Kill Switch</h3>
                                <video autoplay loop muted playsinline class="img-fluid mb-3 rounded"
                                    style="max-height: 100px;">
                                    <source src="/videos/activate_killswitch.mp4" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <p class="card-text">Activate to prevent overtrading, block further trades for the day,
                                    and put your mind at ease. Helps protect profits and limit potential losses.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4 fw-bold">Automatic TSL</h3>
                                <video class="img-fluid mb-3 rounded" style="max-height: 100px;" autoplay loop muted
                                    playsinline>
                                    <source src="/videos/TSL.mp4" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <p class="card-text">Implement automatic profit trailing with Trailing Stop Loss on
                                    individual positions, maximizing gains while minimizing risks.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4 fw-bold">Risk Management</h3>
                                <video class="img-fluid mb-3 rounded" style="max-height: 100px;" autoplay loop muted
                                    playsinline>
                                    <source src="/videos/risk_mangement2.mp4" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                                <p class="card-text">Set precise risk parameters using amount or percentage-based
                                    limits. Define maximum risk and target values to safeguard your capital and maintain
                                    disciplined trading practices.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Multi-Broker Support Section -->
        <section class="row py-5 bg-color rounded">
            <div class="col-lg-10 mx-auto text-center">
                <h2 class="mb-5 display-4">Unleash the Power of Multi-Broker Trading</h2>
                <p class="lead mb-5">Experience seamless integration and manage all your accounts from one powerful
                    platform.</p>

                <div class="row justify-content-center">
                    <div class="col-md-6 mb-4">
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h3 class="card-title mb-4">Flattrade</h3>
                                <img src="/flattrade_logo.png" alt="Flattrade" class="img-fluid mb-4"
                                    style="max-height: 80px;">
                                <p class="card-text">Harness the potential of Flattrade's robust trading infrastructure,
                                    now seamlessly integrated into our platform.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h3 class="card-title mb-4">Shoonya</h3>
                                <img src="/shoonya_logo.png" alt="Shoonya" class="img-fluid mb-4"
                                    style="max-height: 80px;">
                                <p class="card-text">Leverage Shoonya's cutting-edge technology and competitive pricing,
                                    all within our unified trading environment.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p class="mt-5 lead">One platform. Multiple brokers. Infinite possibilities.</p>
            </div>
        </section>

    </div>
</template>
<script setup>
import { ref } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
</script>