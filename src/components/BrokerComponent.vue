<template>
    <section class="row justify-content-between my-3">
        <!-- Broker Information -->
        <div class="col-12 col-md-4 col-lg-4 d-flex align-items-center justify-content-start">
            <select class="form-select form-select-sm me-2" v-model="selectedBroker" @change="updateSelectedBroker">
                <option value="" disabled selected>Select broker</option>
                <option v-for="brokerName in availableBrokers" :key="brokerName" :value="brokerName">
                    {{ brokerName }} {{ maskBrokerClientId(getBrokerClientId(brokerName)) }}
                </option>
            </select>
            <span class="badge me-2" :class="{
                'bg-success': brokerStatus === 'Connected',
                'bg-danger': brokerStatus === 'Not Connected',
                'bg-warning text-dark': brokerStatus === 'Token Expired'
            }">{{ brokerStatus }}</span>
        </div>

        <!-- Funds -->
        <div
            class="col-7 col-md-5 col-lg-5 d-flex align-items-center justify-content-md-around justify-content-between">
            <span class="me-3">
                <small class="text-muted">Total</small>
                <span class="ms-1 fw-bold">₹{{ availableBalance !== null ? availableBalance.toLocaleString('en-IN', {
                    maximumFractionDigits: 2
                }) : 'N/A' }}</span>
            </span>
            <span>
                <small class="text-muted">Used</small>
                <span class="ms-1 fw-bold">₹{{ usedAmount }}</span>
            </span>
        </div>

        <!-- Today's Expiry -->
        <div class="col-5 col-md-3 col-lg-3 d-flex align-items-center justify-content-lg-end justify-content-end">
            <span class="me-2">
                <small class="text-muted">Expiry</small>
                <span class="ms-1 fw-bold" :class="todayExpirySymbol ? 'text-danger' : 'text-secondary'">
                    {{ todayExpirySymbol || '-' }}
                </span>
            </span>
            <span class="fs-5 text-danger" id="events-tab" data-bs-toggle="modal" data-bs-target="#eventsModal"
                style="cursor: pointer;">
                📅
            </span>
        </div>
    </section>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
    selectedBrokerName: String,
    availableBrokers: Array,
    brokerStatus: String,
    availableBalance: Number,
    usedAmount: [Number, String],
    todayExpirySymbol: String,
});

const emit = defineEmits(['update:selectedBrokerName', 'updateSelectedBroker']);

const selectedBroker = computed({
    get: () => props.selectedBrokerName,
    set: (value) => emit('update:selectedBrokerName', value)
});

const updateSelectedBroker = () => {
    emit('updateSelectedBroker');
};

const maskBrokerClientId = (clientId) => {
    if (!clientId) return 'N/A'
    const length = clientId.length
    if (length <= 2) return clientId
    const maskLength = Math.max(1, Math.floor(length / 2))
    const startUnmaskedLength = Math.ceil((length - maskLength) / 2)
    const endUnmaskedLength = length - startUnmaskedLength - maskLength
    const firstPart = clientId.slice(0, startUnmaskedLength)
    const lastPart = clientId.slice(-endUnmaskedLength)
    const middleMask = '*'.repeat(maskLength)
    return `${firstPart}${middleMask}${lastPart}`
}

const getBrokerClientId = (brokerName) => {
    const brokerDetails = JSON.parse(localStorage.getItem(`broker_${brokerName}`) || '{}')
    return brokerDetails.clientId ? `(${brokerDetails.clientId})` : ''
}
</script>
