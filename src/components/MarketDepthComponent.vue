<template>
    <div v-if="isDepthAvailable && marketDepth">
        <h6>Market Depth</h6>
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Buy Price</th>
                    <th>Buy Qty</th>
                    <th>Sell Price</th>
                    <th>Sell Qty</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in 5" :key="i">
                    <td>{{ depth[`bp${i}`] }}</td>
                    <td>{{ depth[`bq${i}`] }}</td>
                    <td>{{ depth[`sp${i}`] }}</td>
                    <td>{{ depth[`sq${i}`] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    isDepthAvailable: {
        type: Boolean,
        required: true
    },
    marketDepth: {
        type: Boolean,
        required: true
    },
    depth: {
        type: Object,
        required: true
    }
});
</script>