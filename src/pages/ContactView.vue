<template>
    <NormalNavigationComponent />
    <div class="container-fluid py-5">
        <!-- Contact Section -->
        <section class="row">
            <div class="col-lg-8 mx-auto text-center">
                <h1 class="display-3 fw-bold mb-4">Get in Touch</h1>
                <p class="lead mb-5">Steadfast is here to revolutionize your trading experience.</p>

                <div class="row justify-content-center">
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body">
                                <font-awesome-icon :icon="['fas', 'envelope']" class="fa-3x text-secondary mb-3" />
                                <h3 class="h4 mb-3">Email</h3>
                                <p class="mb-0">
                                    <a href="mailto:email@narenkram.com" class="text-decoration-none text-color">
                                        email@narenkram.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow hover-effect">
                            <div class="card-body">
                                <font-awesome-icon :icon="['fab', 'telegram']" class="fa-3x text-secondary mb-3" />
                                <h3 class="h4 mb-3">Telegram</h3>
                                <p class="mb-0">
                                    <a href="https://t.me/narenkram" target="_blank" rel="noopener noreferrer"
                                        class="text-decoration-none text-color">
                                        Direct Message on Telegram
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p class="mt-5">Get in touch with us for general inquiries or to learn more about our platform.</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

onMounted(() => {
    // Any necessary mounted logic
});
</script>