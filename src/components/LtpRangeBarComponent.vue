<template>
    <div class="ltp-range-bar mt-3 mb-2">
        <div class="ltp-range">
            <div class="ltp-range-fill" :style="{ width: ltpRangeWidth + '%' }"></div>
            <div class="ltp-range-marker" :style="{ left: ltpRangeWidth + '%' }"></div>
            <div class="ltp-range-open-marker" :style="{ left: openMarkerPosition + '%' }"></div>
        </div>
        <div class="d-flex justify-content-between">
            <span class="ltp-range-low">L: {{ lowPrice }}</span>
            <span class="ltp-range-high">H: {{ highPrice }}</span>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    ltpRangeWidth: {
        type: Number,
        required: true
    },
    openMarkerPosition: {
        type: Number,
        required: true
    },
    lowPrice: {
        type: String,
        required: true
    },
    highPrice: {
        type: String,
        required: true
    }
});
</script>
