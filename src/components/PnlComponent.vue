<template>
    <section class="row mt-3 mx-0 bg-light rounded" :class="{ 'MTM': stickyMTM }">
        <div class="col-12 d-flex align-items-center justify-content-between p-0">
            <span class="ms-3">
                <small class="text-muted">Total Capital</small>
                <span class="ms-1 fw-bold"
                    :class="totalCapitalPercentage > 0 ? 'text-success' : totalCapitalPercentage < 0 ? 'text-danger' : null">
                    {{ totalCapitalPercentage.toFixed(2) }}%
                </span>
            </span>
            <span>
                <small class="text-muted">Total Profit</small>
                <span class="ms-1 fw-bold"
                    :class="totalProfit > 0 ? 'text-success' : totalProfit < 0 ? 'text-danger' : null">
                    ₹{{ totalProfit.toFixed(2) }}
                </span>
            </span>
            <span>
                <small class="text-muted">Net Qty</small>
                <span class="ms-1 fw-bold"
                    :class="totalNetQty > 0 ? 'text-success' : totalNetQty < 0 ? 'text-danger' : null">
                    {{ totalNetQty }}
                </span>
            </span>
            <span>
                <small class="text-muted">Net PNL (est.)</small>
                <span class="ms-1 fw-bold" :class="netPnl > 0 ? 'text-success' : netPnl < 0 ? 'text-danger' : null">
                    ₹{{ netPnl.toFixed(2) }}
                </span>
            </span>
            <span>
                <small class="text-muted">Kill Switch</small>
                <a :class="['ms-2', 'btn', 'btn-sm', killSwitchButtonClass]" @click="handleKillSwitchClick"
                    :data-bs-target="killSwitchActive ? '' : '#KillSwitchActivationConfirmationModal'"
                    :data-bs-toggle="killSwitchActive ? '' : 'modal'">
                    {{ killSwitchButtonText }} <span v-if="killSwitchActive">{{ currentClockEmoji }}</span>
                </a>
            </span>
        </div>
    </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    stickyMTM: Boolean,
    totalCapitalPercentage: Number,
    totalProfit: Number,
    totalNetQty: Number,
    netPnl: Number,
    killSwitchActive: Boolean,
    killSwitchButtonClass: String,
    killSwitchButtonText: String,
    currentClockEmoji: String
});

const emit = defineEmits(['handleKillSwitchClick']);

const handleKillSwitchClick = () => {
    emit('handleKillSwitchClick');
};
</script>