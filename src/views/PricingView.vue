<template>
    <NormalNavigationComponent />
    <div class="container-fluid">
        <!-- Pricing Section -->
        <section class="row py-3">
            <div class="col-lg-8 mx-auto text-center">
                <h2 class="display-6 mb-4">Go Steadfast</h2>
                <div class="card border-danger mb-4">
                    <div class="card-body">
                        <p class="text-danger mb-2 text-uppercase fw-bold">FOR 1 MONTH</p>
                        <p class="display-4 text-danger mb-2">
                            <small class="text-decoration-line-through text-muted fs-1">₹1200</small>
                            ₹500<span class="fs-6"> / month</span>
                        </p>
                        <p class="text-success fw-bold">58% OFF</p>
                        <p class="text-muted mb-0">(Excluding GST from payment gateway)</p>
                    </div>
                </div>
                <ul class="list-group list-group-flush mb-4 text-start">
                    <li class="list-group-item">✅ 2 Broker(s) Allowed (Flattrade, Shoonya)</li>
                    <li class="list-group-item">✅ 1 Paper Trading Account</li>
                    <li class="list-group-item">✅ Basket Order</li>
                    <li class="list-group-item">✅ Place Unlimited Qty</li>
                    <li class="list-group-item">✅ Order Types: Market, Limit,
                        Limit at LTP, Limit at Offset, Market Protection</li>
                    <li class="list-group-item">✅ MTM Target And SL</li>
                    <li class="list-group-item">✅ 1 Click Trading using Arrow
                        Keys</li>
                    <li class="list-group-item">✅ Automatic Trailing SL & Manual
                        SL for your positions</li>
                    <li class="list-group-item">✅ Live MTM update</li>
                    <li class="list-group-item">✅ Predefined SL & Target</li>
                    <li class="list-group-item">✅ Keyboard Shortcuts</li>
                    <li class="list-group-item">🟨 Parallel Copy Trading (Coming Soon)</li>
                    <li class="list-group-item">🟨 More Brokers (Coming Soon)</li>
                    <li class="list-group-item">✅ Email Support available</li>
                </ul>
                <button class="btn btn-danger btn-lg">Subscribe Now</button>
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