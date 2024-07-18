<template>
    <div class="container-fluid">
        <!-- Hero Section -->
        <section class="row py-5 bg-light">
            <div class="col-lg-8 mx-auto text-center">
                <h1 class="display-4 mb-4">Steadfast</h1>
                <p class="lead mb-5">Your Ultimate Options Trading Companion</p>
                <button @click="openTradeView" class="btn btn-primary btn-lg mb-5">Launch App</button>
            </div>
        </section>

        <!-- Key Features Section -->
        <!-- <section class="row py-5">
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
                        <h3>Discipline Automation</h3>
                        <p>Set predefined deployment values and risk limits to protect your capital.</p>
                    </div>
                </div>
            </div>
        </section> -->

        <!-- Multi-Broker Support Section -->
        <!-- <section class="row py-5 bg-light">
            <div class="col-lg-10 mx-auto text-center">
                <h2 class="mb-5">Multi-Broker Support</h2>
                <div class="d-flex justify-content-center align-items-center mb-4">
                    <img src="/flattrade_logo.png" alt="Flattrade" class="img-fluid mx-3" style="max-height: 50px;">
                    <img src="/shoonya_logo.png" alt="Shoonya" class="img-fluid mx-3" style="max-height: 50px;">
                    <img src="/dhan_logo.png" alt="Dhan" class="img-fluid mx-3" style="max-height: 50px;">
                </div>
                <p>Seamlessly integrate with Flattrade, Shoonya, and Dhan. Manage all your accounts from one platform.
                </p>
            </div>
        </section> -->

        <!-- Why Steadfast Section -->
        <!-- <section class="row py-5">
            <div class="col-lg-10 mx-auto">
                <h2 class="text-center mb-5">Why Choose Steadfast?</h2>
                <p class="lead text-center mb-5">Designed to help small retail traders survive and thrive in the options
                    market.</p>
                <div class="row">
                    <div class="col-md-4 mb-4">
                        <h4>Advanced Features</h4>
                        <ul class="list-unstyled">
                            <li>✓ Kill Switch (Client-side, psychologically effective)</li>
                            <li>✓ Discipline Automation</li>
                            <li>✓ 1-Click Trading buttons</li>
                            <li>✓ Automatic Trailing Stop-loss</li>
                            <li>✓ Automatic MTM Trailing</li>
                        </ul>
                    </div>
                    <div class="col-md-4 mb-4">
                        <h4>Multi-Account Support</h4>
                        <ul class="list-unstyled">
                            <li>✓ Supports truly free broker platforms</li>
                            <li>✓ Real-time LTP Data via free brokers</li>
                            <li>✓ Dual Mode reliability for LTP Data</li>
                            <li>✓ Basket Orders</li>
                            <li>✓ Simultaneous trading across multiple accounts</li>
                        </ul>
                    </div>
                    <div class="col-md-4 mb-4">
                        <h4>Privacy & Security</h4>
                        <ul class="list-unstyled">
                            <li>✓ Zero user data collection</li>
                            <li>✓ No sensitive information stored</li>
                            <li>✓ No tracking, 100% private</li>
                            <li>✓ Verify Open Source Code on GitHub</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section> -->

        <!-- Pricing Section -->
        <!-- <section class="row py-5 bg-light">
            <div class="col-lg-8 mx-auto text-center">
                <h2 class="mb-4">Pricing</h2>
                <p class="display-4 text-success mb-4">FREE FOREVER</p>
                <p>Enjoy all features at no cost. Steadfast is committed to remaining free for all users.</p>
            </div>
        </section> -->

        <!-- Community Section -->
        <section class="row py-5">
            <div class="col-lg-8 mx-auto text-center">
                <h2 class="mb-4">Join Our Community</h2>
                <p class="mb-4">Stay updated with the latest features and trading insights.</p>
                <a href="https://t.me/steadfaststoic" target="_blank" class="btn btn-outline-primary btn-lg">Join
                    Telegram Channel</a>
            </div>
        </section>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';


const tradeViewWindow = ref(null)
const openTradeView = () => {
    const url = `${window.location.origin}/steadfast`
    const windowFeatures = 'width=1024,height=936,resizable=yes,scrollbars=yes,status=1'
    tradeViewWindow.value = window.open(url, 'TradeView', windowFeatures)
}
onMounted(() => {


    window.addEventListener('beforeunload', () => {
        if (tradeViewWindow.value) {
            tradeViewWindow.value.close()
        }
    })
});

</script>