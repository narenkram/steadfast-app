<template>
    <div v-if="additionalSymbols" class="col-12 mt-3">
        <div class="table-responsive text-center" style="height: auto; overflow: hidden;">
            <table class="table table-sm table-bordered">
                <thead>
                    <tr>
                        <th>Call LTP</th>
                        <th>Action</th>
                        <th>Strike</th>
                        <th>Action</th>
                        <th>Put LTP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="strike in additionalStrikes" :key="strike">
                        <td>
                            {{ additionalStrikeLTPs.call[strike] || 'N/A' }}
                        </td>
                        <td>
                            <button @click="handleMultiStrikeOrderClick('BUY', 'CALL', strike)"
                                class="btn btn-sm btn-success">B</button>
                            <button @click="handleMultiStrikeOrderClick('SELL', 'CALL', strike)"
                                class="btn btn-sm btn-danger ms-2">S</button>
                        </td>
                        <td><strong>{{ strike }}</strong></td>
                        <td>
                            <button @click="handleMultiStrikeOrderClick('BUY', 'PUT', strike)"
                                class="btn btn-sm btn-success">B</button>
                            <button @click="handleMultiStrikeOrderClick('SELL', 'PUT', strike)"
                                class="btn btn-sm btn-danger ms-2">S</button>
                        </td>
                        <td>
                            {{ additionalStrikeLTPs.put[strike] || 'N/A' }}
                        </td>
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
    },
    selectedCallStrike: {
        type: Object,
        required: true
    },
    selectedPutStrike: {
        type: Object,
        required: true
    },
    handleOrderClick: {
        type: Function,
        required: true
    }
});

const handleMultiStrikeOrderClick = (transactionType, optionType, strike) => {
    // Update the selected strike based on the option type
    if (optionType === 'CALL') {
        props.selectedCallStrike.strikePrice = strike;
    } else if (optionType === 'PUT') {
        props.selectedPutStrike.strikePrice = strike;
    }

    // Call the existing handleOrderClick function
    props.handleOrderClick(transactionType, optionType);
};
</script>
