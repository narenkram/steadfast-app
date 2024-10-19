<template>
    <NormalNavigationComponent />
    <div class="container">
        <!-- Pricing Section -->
        <section class="row py-3">
            <div class="col-lg-6 mx-auto text-center border rounded-3 p-4">
                <h3 class="mb-4 fw-light">Go Steadfast</h3>
                <div class="card border-danger mb-4">
                    <div class="card-body">
                        <p class="text-danger mb-2 text-uppercase fw-bold">FOR 1 MONTH</p>
                        <p class="display-4 text-danger mb-2">
                            <!-- <small class="text-decoration-line-through text-muted fs-1">₹1199</small> -->
                            <small class="text-success fs-1">FREE</small>
                            ₹0<span class="fs-6"> / month</span>
                        </p>
                        <p class="text-success fw-bold">Launch Offer: 100% OFF</p>
                        <!-- <p class="text-muted mb-0">(Excluding GST from payment gateway)</p> -->
                    </div>
                </div>
                <ul class="list-group list-group-flush mb-4 text-start">
                    <li class="list-group-item">✅ 2 Broker(s) Allowed (Flattrade, Shoonya)</li>
                    <li class="list-group-item">🟨 1 Paper Trading Account (Coming Soon)</li>
                    <li class="list-group-item">✅ Automatic SL, Target when you place an order</li>
                    <li class="list-group-item">✅ Predefined SL & Target</li>
                    <li class="list-group-item">✅ Order Types: Market, Limit</li>
                    <li class="list-group-item">✅ Loss and Profit Alerts</li>
                    <li class="list-group-item">✅ Keyboard Shortcuts</li>
                    <li class="list-group-item">✅ Trailing SL - TSL</li>
                    <li class="list-group-item">✅ Live MTM update</li>
                    <li class="list-group-item">✅ Adjust SL & Target</li>
                    <li class="list-group-item">🟨 Parallel Copy Trading (Coming Soon)</li>
                    <li class="list-group-item">🟨 More Brokers (Coming Soon)</li>
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