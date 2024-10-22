<template>
    <NormalNavigationComponent />
    <div class="container-fluid">

        <!-- Key Features Section -->
        <section class="row py-5 bg-color-2 rounded">
            <div class="col-lg-10 mx-auto">
                <h2 class="text-center mb-5 display-4 fw-bold">Lightning-Fast Trades, Tactical Limits: Execute with
                    Precision</h2>
                <p class="lead text-center mb-5">Gain Your Edge with Built-in Safeguards</p>
                <div class="row">
                    <div v-for="(feature, index) in features" :key="index" class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 shadow hover-effect"
                            :style="{ backgroundColor: `var(--card-bg-${index + 1})` }">
                            <div class="card-body text-center">
                                <h3 class="card-title h4 mb-4 fw-bold">{{ feature.title }}</h3>
                                <component :is="feature.mediaType" :src="feature.mediaSrc" :alt="feature.title"
                                    class="img-fluid mb-3 rounded" style="max-height: 100px;" autoplay loop muted
                                    playsinline>
                                    <source :src="feature.mediaSrc" type="video/mp4"
                                        v-if="feature.mediaType === 'video'">
                                    Your browser does not support the video tag.
                                </component>
                                <p class="card-text">{{ feature.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Multi-Broker Support Section -->
        <section class="row py-5 bg-color rounded">
            <div class="col-lg-10 mx-auto text-center">
                <h2 class="mb-4 display-4">Multi-Broker Trading</h2>
                <p class="lead mb-4">Manage multiple accounts from one powerful platform.</p>

                <div class="row justify-content-center">
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h3 class="card-title mb-3">Flattrade</h3>
                                <img src="/flattrade_logo.png" alt="Flattrade" class="img-fluid mb-3"
                                    style="max-height: 60px;">
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h3 class="card-title mb-3">Shoonya</h3>
                                <img src="/shoonya_logo.png" alt="Shoonya" class="img-fluid mb-3"
                                    style="max-height: 60px;">
                            </div>
                        </div>
                    </div>
                </div>

                <p class="mt-4 lead">More brokers coming soon!</p>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';

const features = [
    {
        title: '1-Click Trading',
        mediaType: 'img',
        mediaSrc: '/1click_arrow_keys.png',
        description: 'Execute trades instantly using arrow keys, providing lightning-fast control for capturing real-time market opportunities.'
    },
    {
        title: 'Kill Switch',
        mediaType: 'video',
        mediaSrc: '/videos/activate_killswitch.mp4',
        description: 'Activate to prevent overtrading, block further trades for the day, and put your mind at ease. Helps protect profits and limit potential losses.'
    },
    {
        title: 'Automatic TSL',
        mediaType: 'video',
        mediaSrc: '/videos/TSL.mp4',
        description: 'Implement automatic profit trailing with Trailing Stop Loss on individual positions, maximizing gains while minimizing risks.'
    },
    {
        title: 'Risk Management',
        mediaType: 'video',
        mediaSrc: '/videos/risk_mangement2.mp4',
        description: 'Set precise risk parameters using amount or percentage-based limits. Define maximum risk and target values to safeguard your capital and maintain disciplined trading practices.'
    }
];

onMounted(() => {
    const root = document.documentElement;
    const colors = [
        'rgba(255, 182, 193, 0.2)', // Light pink
        'rgba(173, 216, 230, 0.2)', // Light blue
        'rgba(144, 238, 144, 0.2)', // Light green
        'rgba(255, 255, 224, 0.2)', // Light yellow
        'rgba(230, 230, 250, 0.2)', // Lavender
        'rgba(255, 218, 185, 0.2)', // Peach
    ];

    colors.sort(() => Math.random() - 0.5);

    features.forEach((_, index) => {
        root.style.setProperty(`--card-bg-${index + 1}`, colors[index % colors.length]);
    });
});
</script>
