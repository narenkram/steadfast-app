<template>
    <section class="row py-5">
        <div class="col-12 text-center">
            <h1 class="display-4 mb-4">Steadfast</h1>
            <p class="lead mb-5">Your Ultimate Options Trading Companion</p>

            <button @click="openTradeView" class="btn btn-primary btn-lg mb-5">Launch App</button>

            <!-- <div class="row mt-5">
                <div class="col-6 mb-4">
                    <img src="/1click_arrow_keys.png" alt="1-Click Trading" class="img-fluid arrow_keys">
                    <h2>1-Click Trading</h2>
                    <p>Execute trades with lightning speed using our intuitive 1-Click Trading feature. Perfect for
                        capturing market opportunities in real-time.</p>
                </div>
                <div class="col-6 mb-4">
                    <h2>Kill Switch</h2>
                    <p>Take control of your emotions and prevent overtrading with our unique Kill Switch. Automatically
                        block trading for 6 hours, giving you time to reassess and regroup.</p>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-4 mb-4">
                    <img src="/flattrade_logo.png" alt="Flattrade" class="img-fluid broker-logo">
                    <img src="/shoonya_logo.png" alt="Shoonya" class="img-fluid broker-logo">
                    <img src="/dhan_logo.png" alt="Dhan" class="img-fluid broker-logo">
                    <h3>Multi-Broker Support</h3>
                    <p>
                        Seamlessly integrate with Flattrade, Dhan, and Shoonya. Manage all your accounts from one
                        platform.
                    </p>
                </div>
                <div class="col-4 mb-4">
                    <h3>Real-Time Market Data</h3>
                    <p>Stay informed with live LTP updates for underlying assets and selected strikes.</p>
                </div>
                <div class="col-4 mb-4">
                    <h3>Advanced Order Types</h3>
                    <p>Place market orders, limit orders, and manage your positions with ease.</p>
                </div>
            </div> -->

            <div class="mt-5">
                <h2>Join Our Community</h2>
                <p>Stay updated with the latest features and trading insights.</p>
                <a href="https://t.me/steadfaststoic" target="_blank" class="btn btn-outline-primary">Join Telegram
                    Channel</a>
            </div>
        </div>
    </section>
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