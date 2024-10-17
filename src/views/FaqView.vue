<template>
    <NormalNavigationComponent />
    <div class="container-fluid">
        <!-- FAQ Section -->
        <section class="row py-5 bg-light">
            <div class="col-lg-8 mx-auto">
                <h2 class="display-4 mb-5 text-center">Frequently Asked Questions</h2>
                <div class="accordion" id="faqAccordion">
                    <div class="accordion-item">
                        <h3 class="accordion-header" id="headingOne">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                What is Steadfast?
                            </button>
                        </h3>
                        <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne"
                            data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                Steadfast is a trading app designed by traders for traders. It offers advanced features
                                like automatic trailing stop-loss, multi-account support, and real-time data to help
                                traders make informed decisions and manage their trades effectively.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h3 class="accordion-header" id="headingTwo">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                How does the Kill Switch feature work?
                            </button>
                        </h3>
                        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                            data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                The Kill Switch is a client-side feature designed to help traders manage risk. When
                                activated, it immediately closes all open positions, helping to prevent further losses
                                in volatile market conditions. It's an effective psychological tool for maintaining
                                trading discipline.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h3 class="accordion-header" id="headingThree">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                Can I use Steadfast with multiple trading accounts?
                            </button>
                        </h3>
                        <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree"
                            data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                Yes, Steadfast supports multiple trading accounts. You can connect and manage trades
                                across different broker platforms simultaneously, making it easier to diversify your
                                trading strategies or manage accounts for different purposes.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h3 class="accordion-header" id="headingFour">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                                Is my data safe with Steadfast?
                            </button>
                        </h3>
                        <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
                            data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                We take data security very seriously. Steadfast uses industry-standard encryption
                                protocols to protect your data. We do not store your login credentials, and all
                                sensitive information is handled securely. For more details, please refer to our privacy
                                policy.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h3 class="accordion-header" id="headingFive">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                How often is Steadfast updated?
                            </button>
                        </h3>
                        <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive"
                            data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                Steadfast is continuously improved based on user feedback and market changes. We release
                                updates regularly to add new features, improve performance, and fix any issues. You can
                                always find the latest version information in the app's settings or on our website.
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h3 class="accordion-header" id="headingSix">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                                What is Steadfast's refund policy?
                            </button>
                        </h3>
                        <div id="collapseSix" class="accordion-collapse collapse" aria-labelledby="headingSix"
                            data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                <p>Steadfast has a strict no-refund policy. Here's why:</p>
                                <ul>
                                    <li>We put extensive effort and resources into developing a high-quality, reliable
                                        trading platform.</li>
                                    <li>Our pricing is transparent and clearly communicated before purchase.</li>
                                    <li>We continuously update and improve our service based on user feedback.</li>
                                    <li>Our support team is always available to assist with any issues or concerns.</li>
                                    <li>The nature of our product and the financial markets it interacts with makes
                                        refunds impractical.</li>
                                </ul>
                                <p>We encourage all potential users to carefully review our features and documentation
                                    to ensure Steadfast meets their needs before making a purchase. If you have any
                                    questions, please don't hesitate to contact our support team.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';

onMounted(() => {


});

</script>
