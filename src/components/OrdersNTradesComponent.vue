<template>
    <!-- Desktop view -->
    <div class="table-responsive d-none d-md-block">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th scope="col">Type</th>
                    <th scope="col">Side</th>
                    <th scope="col">Details</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Price</th>
                    <th scope="col">Time</th>
                    <th scope="col">Status & Reason</th>
                </tr>
            </thead>
            <tbody>
                <template v-if="combinedOrdersAndTrades.length">
                    <template v-for="item in combinedOrdersAndTrades" :key="item.norenordno">
                        <tr v-if="item.order.status !== 'COMPLETE'">
                            <td>Order</td>
                            <td>{{ formatTranType(item.order.trantype) }}</td>
                            <td>
                                {{ item.order.norenordno }}
                                <br />
                                {{ item.order.tsym }}
                            </td>
                            <td>{{ item.order.qty }}</td>
                            <td>{{ item.order.prc }}</td>
                            <td>{{ formatTime(item.order.norentm) }}</td>
                            <td :class="{
                                'text-danger': item.order.status === 'REJECTED',
                                'text-warning': item.order.status === 'PENDING' || item.order.status === 'OPEN'
                            }">
                                {{ item.order.status }} {{ item.order.rejreason }}
                            </td>
                        </tr>
                        <tr v-if="item.trade">
                            <td>Trade</td>
                            <td>{{ formatTranType(item.trade.trantype) }}</td>
                            <td>
                                {{ item.trade.norenordno }}
                                <br />
                                {{ formatTradingSymbol(item.trade.tsym) }}
                            </td>
                            <td>{{ item.trade.qty }}</td>
                            <td>{{ item.trade.flprc }}</td>
                            <td>{{ formatTime(item.trade.norentm) }}</td>
                            <td class="text-success">
                                {{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}
                            </td>
                        </tr>
                    </template>
                </template>
                <tr v-else>
                    <td colspan="9" class="text-center">
                        No orders or trades on selected broker {{ selectedBroker.brokerName }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Mobile view -->
    <div class="d-md-none mt-3">
        <div v-if="combinedOrdersAndTrades.length" class="list-group">
            <div v-for="item in combinedOrdersAndTrades" :key="item.norenordno" class="list-group-item bg-color">
                <template v-if="item.order.status !== 'COMPLETE'">
                    <h6 class="mb-2">Order</h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Side:</span>
                        <strong>{{ formatTranType(item.order.trantype) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Order No:</span>
                        <strong>{{ item.order.norenordno }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Symbol:</span>
                        <strong>{{ item.order.tsym }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Quantity:</span>
                        <strong>{{ item.order.qty }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Price:</span>
                        <strong>{{ item.order.prc }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Time:</span>
                        <strong>{{ formatTime(item.order.norentm) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Status:</span>
                        <strong :class="{
                            'text-danger': item.order.status === 'REJECTED',
                            'text-warning': item.order.status === 'PENDING' || item.order.status === 'OPEN'
                        }">{{ item.order.status }}</strong>
                    </div>
                    <div v-if="item.order.rejreason" class="mb-2">
                        <span>Reason:</span>
                        <strong class="text-danger ms-2 text-end w-100">{{ item.order.rejreason }}</strong>
                    </div>
                </template>
                <template v-if="item.trade">
                    <h6 class="mb-2">Trade</h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Side:</span>
                        <strong>{{ formatTranType(item.trade.trantype) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Order No:</span>
                        <strong>{{ item.trade.norenordno }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Symbol:</span>
                        <strong>{{ formatTradingSymbol(item.trade.tsym) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Quantity:</span>
                        <strong>{{ item.trade.qty }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Price:</span>
                        <strong>{{ item.trade.flprc }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Time:</span>
                        <strong>{{ formatTime(item.trade.norentm) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Status:</span>
                        <strong class="text-success">{{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat
                            }}</strong>
                    </div>
                </template>
            </div>
        </div>
        <div v-else class="text-center p-3">
            No orders or trades on selected broker {{ selectedBroker.brokerName }}
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

// Formatters
import { formatTradingSymbol } from '@/composables/useFormatters';

const props = defineProps({
    combinedOrdersAndTrades: {
        type: Array,
        required: true,
    },
    selectedBroker: {
        type: Object,
        required: true,
    },
    formatTime: {
        type: Function,
        required: true,
    },
});

// Format trantype
const formatTranType = (trantype) => {
    switch (trantype) {
        case 'S':
            return 'SELL';
        case 'B':
            return 'BUY';
        default:
            return trantype;
    }
};
</script>
