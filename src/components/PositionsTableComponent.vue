<template>
    <!-- Desktop view -->
    <div class="table-responsive d-none d-md-block">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th scope="col">Select</th>
                    <th scope="col">Symbol</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Side</th>
                    <th scope="col">TSL / SL</th>
                    <th scope="col">LTP</th>
                    <th scope="col">Target</th>
                    <th scope="col">Type</th>
                    <th scope="col">B.Avg</th>
                    <th scope="col">S.Avg</th>
                    <th scope="col">Realized</th>
                    <th scope="col">Unrealized</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="sortedPositions.length > 0">
                    <tr v-for="position in sortedPositions" :key="position.tsym">
                        <td class="position-relative">
                            <label
                                class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
                                <input type="checkbox" :id="'position-' + position.tsym" :value="position.tsym"
                                    :checked="safeSelectedPositionsSet.has(position.tsym)"
                                    :disabled="position.netqty == 0"
                                    @change="$emit('update:selectedPositionsSet', handleCheckboxChange($event, position.tsym))" />
                            </label>
                        </td>
                        <td>{{ formatTradingSymbol(position.tsym) }}</td>
                        <td :class="[
                            position.netqty > 0 ? 'text-success' :
                                position.netqty < 0 ? 'text-danger' :
                                    'text-secondary'
                        ]">
                            {{ position.netqty }}
                        </td>
                        <td :class="{ 'text-success': position.netqty > 0, 'text-danger': position.netqty < 0 }">
                            {{ position.netqty > 0 ? 'BUY' : position.netqty < 0 ? 'SELL' : '-' }} </td>
                        <td v-if="position.netqty != 0">
                            <!-- SL & TSL -->
                            <div class="row" style="height: 30px;">
                                <div class="col-12" v-if="trailingStoplosses[position.tsym] !== null">
                                    <div class="d-flex align-items-center">
                                        <span class="me-2">TSL:</span>
                                        <span class="bg-danger text-white px-2 py-1 rounded">
                                            {{ trailingStoplosses[position.tsym] }}
                                        </span>
                                    </div>
                                </div>
                                <div class="col-12" v-else-if="stoplosses[position.tsym] !== null">
                                    <div class="btn-group" role="group">
                                        <button class="btn btn-sm btn-outline-danger"
                                            @click="$emit('decrease-stoploss', position)">
                                            - SL
                                        </button>
                                        <span class="d-flex align-items-center bg-danger text-white px-2">
                                            {{ stoplosses[position.tsym] }}
                                        </span>
                                        <button class="btn btn-sm btn-outline-success"
                                            @click="$emit('increase-stoploss', position)">
                                            + SL
                                        </button>
                                    </div>
                                </div>
                                <div v-else>-</div>
                            </div>
                            <div class="btn-group mt-2" role="group" style="width: 165px;">
                                <button class="btn btn-sm btn-outline"
                                    v-if="trailingStoplosses[position.tsym] === null && stoplosses[position.tsym] === null"
                                    @click="$emit('set-stoploss', position, 'static')">
                                    ➕
                                </button>
                                <button class="btn btn-sm btn-outline"
                                    v-if="trailingStoplosses[position.tsym] !== null || stoplosses[position.tsym] !== null"
                                    @click="$emit('set-stoploss', position, trailingStoplosses[position.tsym] !== null ? 'convert_to_sl' : 'convert_to_tsl')">
                                    {{ trailingStoplosses[position.tsym] !== null ? 'S' : 'T' }}
                                </button>
                                <button
                                    v-if="trailingStoplosses[position.tsym] !== null || stoplosses[position.tsym] !== null"
                                    class="btn btn-sm btn-outline" @click="$emit('remove-stoploss', position)">
                                    ❌
                                </button>
                            </div>
                        </td>
                        <td v-else>-</td>
                        <td style="width: 80px;"
                            :class="{ 'text-success': parseFloat(positionLTPs[position.tsym]) > parseFloat(position.totbuyavgprc), 'text-danger': parseFloat(positionLTPs[position.tsym]) < parseFloat(position.totbuyavgprc) }">
                            {{ positionLTPs[position.tsym] }}
                        </td>
                        <td v-if="position.netqty != 0">
                            <!-- TG -->
                            <div class="row" style="height: 30px;">
                                <div class="col-12" v-if="targets[position.tsym] !== null">
                                    <div class="btn-group" role="group">
                                        <button class="btn btn-sm btn-outline-danger"
                                            @click="$emit('decrease-target', position)">
                                            - TG
                                        </button>
                                        <span class="d-flex align-items-center bg-success text-white px-2">
                                            {{ targets[position.tsym] }}
                                        </span>
                                        <button class="btn btn-sm btn-outline-success"
                                            @click="$emit('increase-target', position)">
                                            + TG
                                        </button>
                                    </div>
                                </div>
                                <div v-else>-</div>
                            </div>
                            <div class="btn-group mt-2" role="group" style="width: 165px;">
                                <button class="btn btn-sm btn-outline" v-if="targets[position.tsym] === null"
                                    @click="$emit('set-target', position)">
                                    ➕
                                </button>
                                <button class="btn btn-sm btn-outline" v-if="targets[position.tsym] !== null"
                                    @click="$emit('remove-target', position)">
                                    ❌
                                </button>
                            </div>
                        </td>
                        <td v-else>-</td>
                        <td>{{ formatProductType(position.prd) }}</td>
                        <td>{{ position.totbuyavgprc }}</td>
                        <td>{{ position.totsellavgprc }}</td>
                        <td :class="position.rpnl > 0 ? 'text-success' : position.rpnl < 0 ? 'text-danger' : null">
                            {{ position.rpnl }}
                        </td>
                        <td
                            :class="position.calculatedUrmtom > 0 ? 'text-success' : position.calculatedUrmtom < 0 ? 'text-danger' : null">
                            {{ position.calculatedUrmtom != null ? position.calculatedUrmtom.toFixed(2) : '-' }}
                        </td>
                    </tr>
                </template>
                <tr v-else>
                    <td colspan="13" class="text-center">
                        No positions on selected broker {{ selectedBroker.brokerName }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Mobile view -->
    <div class="d-md-none mt-3">
        <div v-if="sortedPositions.length > 0" class="list-group">
            <div v-for="position in sortedPositions" :key="position.tsym" class="list-group-item bg-color">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <strong>{{ formatTradingSymbol(position.tsym) }}</strong>
                        <span :class="[
                            'badge ms-2',
                            position.netqty > 0 ? 'bg-success' : position.netqty < 0 ? 'bg-danger' : 'bg-secondary'
                        ]">
                            {{ position.netqty > 0 ? 'BUY' : position.netqty < 0 ? 'SELL' : 'CLOSED' }} </span>
                    </div>
                    <div>
                        <span :class="[
                            'badge',
                            position.calculatedUrmtom > 0 ? 'bg-success' : 'bg-danger'
                        ]">
                            {{ position.calculatedUrmtom != null ? position.calculatedUrmtom.toFixed(2) : '-' }}
                        </span>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <small>Qty: {{ position.netqty }}</small>
                    </div>
                    <div>
                        <small>LTP: {{ positionLTPs[position.tsym] }}</small>
                    </div>
                </div>

                <!-- SL & TSL -->
                <div v-if="position.netqty != 0" class="mb-2">
                    <div v-if="trailingStoplosses[position.tsym] !== null" class="d-flex align-items-center">
                        <span class="me-2">TSL:</span>
                        <span class="bg-danger text-white px-2 py-1 rounded">
                            {{ trailingStoplosses[position.tsym] }}
                        </span>
                    </div>
                    <div v-else-if="stoplosses[position.tsym] !== null" class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-danger" @click="$emit('decrease-stoploss', position)">-</button>
                        <span class="btn btn-danger">{{ stoplosses[position.tsym] }}</span>
                        <button class="btn btn-outline-danger" @click="$emit('increase-stoploss', position)">+</button>
                    </div>
                    <div v-else class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-danger" @click="$emit('set-stoploss', position, 'static')">Set
                            SL</button>
                    </div>
                </div>

                <!-- Target -->
                <div v-if="position.netqty != 0" class="mb-2">
                    <div v-if="targets[position.tsym] !== null" class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-success" @click="$emit('decrease-target', position)">-</button>
                        <span class="btn btn-success">{{ targets[position.tsym] }}</span>
                        <button class="btn btn-outline-success" @click="$emit('increase-target', position)">+</button>
                    </div>
                    <div v-else class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-success" @click="$emit('set-target', position)">Set
                            Target</button>
                    </div>
                </div>

                <!-- SL/TSL/Target Management -->
                <div v-if="position.netqty != 0" class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-secondary"
                        v-if="trailingStoplosses[position.tsym] !== null || stoplosses[position.tsym] !== null"
                        @click="$emit('set-stoploss', position, trailingStoplosses[position.tsym] !== null ? 'convert_to_sl' : 'convert_to_tsl')">
                        {{ trailingStoplosses[position.tsym] !== null ? 'Convert to SL' : 'Convert to TSL' }}
                    </button>
                    <button class="btn btn-outline-secondary"
                        v-if="trailingStoplosses[position.tsym] !== null || stoplosses[position.tsym] !== null"
                        @click="$emit('remove-stoploss', position)">
                        Remove SL/TSL
                    </button>
                    <button class="btn btn-outline-secondary" v-if="targets[position.tsym] !== null"
                        @click="$emit('remove-target', position)">
                        Remove Target
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="text-center p-3">
            No positions on selected broker {{ selectedBroker.brokerName }}
        </div>
    </div>
</template>

<script setup>
import { positionsWithCalculatedProfit } from '@/composables/useTradeView';
import { computed, watch } from 'vue';

const props = defineProps({
    selectedBroker: {
        type: Object,
        required: true,
    },
    selectedPositionsSet: {
        type: Set,
        default: () => new Set(),
    },
    positions: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits([
    'update:selectedPositionsSet',
    'set-stoploss',
    'remove-stoploss',
    'increase-stoploss',
    'decrease-stoploss',
    'set-target',
    'remove-target',
    'increase-target',
    'decrease-target',
]);


// Formatters
import { formatTradingSymbol } from '@/composables/useFormatters';

// Global State
import { positionLTPs, stoplosses, targets, trailingStoplosses } from '@/stores/globalStore'


const sortedPositions = computed(() => {
    return [...positionsWithCalculatedProfit.value].sort((a, b) => {
        // First, sort by open/closed status
        if (Number(a.netqty) !== 0 && Number(b.netqty) === 0) return -1
        if (Number(a.netqty) === 0 && Number(b.netqty) !== 0) return 1

        // Then, for open positions, sort by absolute quantity in descending order
        if (Number(a.netqty) !== 0 && Number(b.netqty) !== 0) {
            return Math.abs(Number(b.netqty)) - Math.abs(Number(a.netqty))
        }

        // For closed positions, maintain their original order
        return 0
    })
})

// New function to format product type
const formatProductType = (prd) => {
    switch (prd) {
        case 'M':
            return 'Overnight';
        case 'I':
            return 'Intraday';
        default:
            return prd;
    }
}

// Compute a safe version of selectedPositionsSet
const safeSelectedPositionsSet = computed(() => props.selectedPositionsSet || new Set());

function handleCheckboxChange(event, tsym) {
    const updatedSet = new Set(safeSelectedPositionsSet.value);
    if (event.target.checked) {
        updatedSet.add(tsym);
    } else {
        updatedSet.delete(tsym);
    }
    return updatedSet;
}
</script>
