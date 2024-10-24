<template>
    <section class="row justify-content-between my-3">
        <!-- Broker Information -->
        <div class="col-12 col-md-4 col-lg-4 d-flex align-items-center justify-content-start">
            <select class="form-select form-select-sm me-2" v-model="selectedBroker">
                <option value="" disabled>Select broker</option>
                <option v-for="broker in availableBrokers" :key="broker.clientId" :value="broker.brokerName">
                    {{ broker.brokerName }} {{ maskBrokerClientId(broker.clientId) }}
                </option>
            </select>
            <span class="badge me-2" :class="{
                'bg-success': brokerStatus === 'Connected',
                'bg-danger': brokerStatus === 'Not Connected',
                'bg-warning text-color': brokerStatus === 'Token Expired'
            }">{{ brokerStatus }}</span>
        </div>

        <!-- Funds -->
        <div
            class="col-7 col-md-5 col-lg-5 d-flex align-items-center justify-content-md-around justify-content-between mt-2 mt-md-0">
            <span class="me-3">
                <small class="text-muted">Funds</small>
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
        <div
            class="col-5 col-md-3 col-lg-3 d-flex align-items-center justify-content-lg-end justify-content-end mt-2 mt-md-0">
            <span class="me-2">
                <small class="text-muted">Expiry</small>
                <span class="ms-1 fw-bold" :class="todayExpirySymbol ? 'text-danger' : 'text-secondary'">
                    {{ todayExpirySymbol || '-' }}
                </span>
            </span>
            <span class="fs-6 text-danger" id="events-tab" data-bs-toggle="modal" data-bs-target="#eventsModal"
                style="cursor: pointer;">
                📅
            </span>
        </div>
    </section>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { updateSelectedBrokerOnServer } from '../api/broker';

const props = defineProps({
    selectedBrokerName: String,
    availableBrokers: Array,
    brokerStatus: String,
    availableBalance: Number,
    usedAmount: [Number, String],
    todayExpirySymbol: String,
});

const emit = defineEmits(['update:selectedBrokerName']);

const selectedBroker = computed({
    get: () => props.selectedBrokerName,
    set: async (value) => {
        emit('update:selectedBrokerName', value);
        if (value) {
            try {
                await updateSelectedBrokerOnServer(value.toLowerCase());
            } catch (error) {
                console.error('Failed to update broker on server:', error);
                // You might want to handle this error, perhaps by showing a notification to the user
            }
        }
    }
});

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
    let clientId = '';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`broker_${brokerName}_`)) {
            const brokerDetails = JSON.parse(localStorage.getItem(key));
            clientId = brokerDetails.clientId;
            break;
        }
    }
    return clientId ? `(${clientId})` : '';
}
</script>
