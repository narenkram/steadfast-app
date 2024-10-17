<template>
    <div v-if="additionalSymbols" class="col-12 mt-3">
        <div class="table-responsive" style="height: auto; overflow: hidden;">
            <table class="table table-sm table-bordered">
                <thead>
                    <tr>
                        <th>Call LTP</th>
                        <th>Strike</th>
                        <th>Put LTP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="strike in additionalStrikes" :key="strike">
                        <td>{{ additionalStrikeLTPs.call[strike] || 'N/A' }}</td>
                        <td><strong>{{ strike }}</strong></td>
                        <td>{{ additionalStrikeLTPs.put[strike] || 'N/A' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    additionalSymbols: {
        type: Boolean,
        required: true
    },
    additionalStrikes: {
        type: Array,
        required: true
    },
    additionalStrikeLTPs: {
        type: Object,
        required: true
    }
});
</script>