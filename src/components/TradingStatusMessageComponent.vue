<template>
    <!-- Kill Switch MessageWindow -->
    <section v-if="killSwitchActive" class="row my-2">
        <div class="col-12">
            <div class="bg-danger text-white p-3 rounded-3 shadow">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <h5 class="mb-2">Kill switch activated</h5>
                        <p class="mb-0">
                            Trading has been blocked for the next 6 hours. Take a break to put your mind at ease.
                        </p>
                    </div>
                    <div class="text-center">
                        <span class="d-flex bg-color-2 text-color py-2 px-3 rounded-2 fs-6 fw-bold">
                            {{ killSwitchRemainingTime }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Trade Warning MessageWindow -->
    <section v-if="riskReached && !killSwitchActive && totalPositionQuantity !== 0" class="row my-2">
        <div class="col-12">
            <div class="bg-warning text-dark p-3 rounded-3 shadow">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <h5 class="mb-2">Trade Warning</h5>
                        <p class="mb-0">Risk Threshold Reached!</p>
                    </div>
                    <div class="text-center">
                        <span class="d-flex bg-color-2 text-color py-2 px-3 rounded-2 fs-6 fw-bold">
                            Make adjustments or close positions
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Trade Success MessageWindow -->
    <section v-if="targetReached && !killSwitchActive && totalPositionQuantity !== 0" class="row my-2">
        <div class="col-12">
            <div class="bg-success text-white p-3 rounded-3 shadow">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <h5 class="mb-2">Trade Success</h5>
                        <p class="mb-0">Target Reached!</p>
                    </div>
                    <div class="text-center">
                        <span class="d-flex bg-color-2 text-color py-2 px-3 rounded-2 fs-6 fw-bold">
                            Close positions to lock in profits
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
    killSwitchActive: Boolean,
    killSwitchRemainingTime: String,
    riskReached: Boolean,
    targetReached: Boolean,
    activeFetchFunction: String,
    flatTradePositionBook: Array,
    shoonyaPositionBook: Array,
});

const totalPositionQuantity = computed(() => {
    const positions = props.activeFetchFunction === 'fetchFlattradePositions'
        ? props.flatTradePositionBook
        : props.shoonyaPositionBook;

    return positions.reduce((total, position) => total + Math.abs(position.netqty), 0);
});
</script>