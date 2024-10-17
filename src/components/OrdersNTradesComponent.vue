<template>
    <div class="table-responsive">
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
</template>

<script setup>
import { defineProps } from 'vue';
import { useTradeView } from '@/composables/useTradingSystem';

const {
    formatTradingSymbol,
} = useTradeView();

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