<template>
    <NormalNavigationComponent />
    <div class="container-fluid bg-color-2 py-5">
        <!-- FAQ Section -->
        <section class="row">
            <div class="col-lg-8 mx-auto">
                <h1 class="display-3 fw-bold text-center mb-5">Uncover the Power of Steadfast</h1>
                <p class="lead text-center mb-5">Explore our frequently asked questions and discover how Steadfast can
                    revolutionize your trading experience.</p>
                <div class="accordion shadow-lg" id="faqAccordion">
                    <div class="accordion-item" v-for="(faq, index) in faqs" :key="index">
                        <h3 class="accordion-header" :id="'heading' + index">
                            <button class="accordion-button" :class="{ collapsed: index !== 0 }" type="button"
                                data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"
                                :aria-expanded="index === 0" :aria-controls="'collapse' + index">
                                <font-awesome-icon :icon="['fas', 'question-circle']" class="me-2" />
                                {{ faq.question }}
                            </button>
                        </h3>
                        <div :id="'collapse' + index" class="accordion-collapse collapse" :class="{ show: index === 0 }"
                            :aria-labelledby="'heading' + index" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                <p>{{ faq.answer }}</p>
                                <ul v-if="faq.list">
                                    <li v-for="(item, itemIndex) in faq.list" :key="itemIndex">{{ item }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Steadfast AI Assistant -->
        <div class="col-lg-8 mx-auto mt-5 text-center">
            <button data-bs-toggle="modal" data-bs-target="#SteadfastAIAssistantModal" class="btn btn-purple btn-lg">
                <font-awesome-icon :icon="['fas', 'hat-wizard']" class="me-2 sparkle-icon" />
                Ask Steadfast AI Assistant
            </button>
        </div>
    </div>

    <!-- Steadfast AI Assistant Modal -->
    <div class="modal fade" id="SteadfastAIAssistantModal" tabindex="-1"
        aria-labelledby="SteadfastAIAssistantModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-body p-0">
                    <ChatAIComponent />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import ChatAIComponent from '@/components/ChatAIComponent.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const faqs = ref([
    {
        question: "What is Steadfast?",
        answer: "Steadfast is a trading app designed by traders for traders. It offers advanced features like automatic trailing stop-loss, multi-account support, and real-time data to help traders make informed decisions and manage their trades effectively."
    },
    {
        question: "How does the Kill Switch feature work?",
        answer: "The Kill Switch is a client-side feature designed to help traders manage risk. When activated, it immediately closes all open positions, helping to prevent further losses in volatile market conditions. It's an effective psychological tool for maintaining trading discipline."
    },
    {
        question: "Can I use Steadfast with multiple trading accounts?",
        answer: "Yes, Steadfast supports multiple trading accounts. You can connect and manage trades across different broker platforms simultaneously, making it easier to diversify your trading strategies or manage accounts for different purposes."
    },
    {
        question: "How often is Steadfast updated?",
        answer: "Steadfast is continuously improved based on user feedback and market changes. We release updates regularly to add new features, improve performance, and fix any issues. You can always find the latest version information in the app's settings or on our website."
    },
    {
        question: "What is Steadfast's refund policy?",
        answer: "Steadfast offers a 1-month free trial for new users to test the platform risk-free. After the trial period, we have a strict no-refund policy. Here's why:",
        list: [
            "Extensive effort and resources are invested in developing a high-quality, reliable trading platform.",
            "The pricing is transparent and clearly communicated before purchase.",
            "The service is continuously updated and improved based on user feedback.",
            "Support is always available to assist with any issues or concerns.",
            "The nature of the product and the financial markets it interacts with makes refunds impractical."
        ]
    }
]);

onMounted(() => {
    // Any necessary mounted logic
});
</script>
