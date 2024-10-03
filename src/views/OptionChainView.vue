<template>
  <NavigationComponent />
  <section class="container-fluid py-5">
    <div class="row">
      <div class="col-12">
        <h5 class="text-danger">This feature is under development</h5>
        <h1 class="mb-4">Option Chain - {{ selectedMasterSymbol }}</h1>
        <div class="mb-3 d-flex gap-3">
          <div>
            <label for="spotPrice" class="form-label">Spot Price:</label>
            <input type="number" id="spotPrice" v-model="spotPrice" class="form-control" @change="updateOptionChain" />
          </div>
          <div>
            <label for="expiryDate" class="form-label">Expiry Date:</label>
            <select id="expiryDate" v-model="selectedExpiry" class="form-control" @change="updateOptionChain">
              <option v-for="expiry in expiryDates" :key="expiry" :value="expiry">{{ expiry }}</option>
            </select>
          </div>
        </div>
        <div v-if="optionChainData.length > 0" class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead>
              <tr>
                <th colspan="6">CALL</th>
                <th>Strike</th>
                <th colspan="6">PUT</th>
              </tr>
              <tr>
                <th>LTP</th>
                <th>Delta</th>
                <th>Gamma</th>
                <th>Theta</th>
                <th>Vega</th>
                <th>IV</th>
                <th></th>
                <th>IV</th>
                <th>Vega</th>
                <th>Theta</th>
                <th>Gamma</th>
                <th>Delta</th>
                <th>LTP</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in optionChainData" :key="row.strikePrice"
                :class="{ 'table-active': row.strikePrice === nearestStrike }">
                <td>{{ row.call.ltp || 'N/A' }}</td>
                <td>{{ row.call.delta }}</td>
                <td>{{ row.call.gamma }}</td>
                <td>{{ row.call.theta }}</td>
                <td>{{ row.call.vega }}</td>
                <td>{{ row.call.iv }}</td>
                <td><strong>{{ row.strikePrice }}</strong></td>
                <td>{{ row.put.iv }}</td>
                <td>{{ row.put.vega }}</td>
                <td>{{ row.put.theta }}</td>
                <td>{{ row.put.gamma }}</td>
                <td>{{ row.put.delta }}</td>
                <td>{{ row.put.ltp || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import NavigationComponent from '../components/NavigationComponent.vue'
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import {
  BASE_URL,
  selectedMasterSymbol,
  selectedExpiry,
  expiryDates,
  callStrikes,
  putStrikes,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  socket,
  ltpCallbacks
} from '../composables/useGlobalState';

const optionChainData = ref([]);
const spotPrice = ref(0);

const nearestStrike = computed(() => Math.round(spotPrice.value / 50) * 50);

const updateOptionChain = async () => {
  const strikes = [];
  for (let i = -5; i <= 5; i++) {
    strikes.push(nearestStrike.value + i * 50);
  }

  optionChainData.value = await Promise.all(strikes.map(async (strike) => {
    const callData = await loadOptionGreek(strike, 'CE');
    const putData = await loadOptionGreek(strike, 'PE');
    return {
      strikePrice: strike,
      call: {
        ltp: null, // This will be updated by WebSocket
        delta: callData?.cal_delta,
        gamma: callData?.cal_gamma,
        theta: callData?.cal_theta,
        vega: callData?.cal_vega,
        iv: callData?.cal_iv,
      },
      put: {
        ltp: null, // This will be updated by WebSocket
        delta: putData?.put_delta,
        gamma: putData?.put_gamma,
        theta: putData?.put_theta,
        vega: putData?.put_vega,
        iv: putData?.put_iv,
      },
    };
  }));

  subscribeToOptionChainLTPs();
};

const loadOptionGreek = async (strike, optionType) => {
  try {
    const jKey = localStorage.getItem('FLATTRADE_API_TOKEN');
    const clientId = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}').clientId;

    if (!jKey || !clientId) {
      throw new Error('API Token or Client ID not found. Please log in first.');
    }

    const jData = JSON.stringify({
      uid: clientId,
      exd: selectedExpiry.value,
      strprc: strike.toString(),
      sptprc: spotPrice.value.toString(),
      int_rate: '7', // You might want to make this configurable
      volatility: '12.8', // You might want to make this configurable
      optt: optionType
    });

    const response = await axios.post(`${BASE_URL}/flattrade/getOptionGreek`, { jData }, {
      headers: {
        'Authorization': `Bearer ${jKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.stat === 'OK') {
      return response.data;
    } else {
      throw new Error(response.data.emsg || 'Failed to fetch option Greek data');
    }
  } catch (error) {
    console.error('Error loading option Greek:', error);
    return null;
  }
};

const subscribeToOptionChainLTPs = () => {
  optionChainData.value.forEach(row => {
    const callSecurityId = getSecurityIdForStrike(row.strikePrice, 'CE');
    const putSecurityId = getSecurityIdForStrike(row.strikePrice, 'PE');

    if (callSecurityId) subscribeToLTP(callSecurityId, updateOptionChainLTP);
    if (putSecurityId) subscribeToLTP(putSecurityId, updateOptionChainLTP);
  });
};

const getSecurityIdForStrike = (strike, optionType) => {
  const strikes = optionType === 'CE' ? callStrikes.value : putStrikes.value;
  const strikeInfo = strikes.find(s => s.strikePrice === strike);
  return strikeInfo ? strikeInfo.securityId : null;
};

const subscribeToLTP = (securityId, callback) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const data = {
      action: 'subscribe',
      symbols: [`NSE|${securityId}`]
    };
    socket.value.send(JSON.stringify(data));
    ltpCallbacks.value[securityId] = callback;
  }
};

const updateOptionChainLTP = (data) => {
  const row = optionChainData.value.find(r =>
    getSecurityIdForStrike(r.strikePrice, 'CE') === data.tk ||
    getSecurityIdForStrike(r.strikePrice, 'PE') === data.tk
  );

  if (row) {
    if (getSecurityIdForStrike(row.strikePrice, 'CE') === data.tk) {
      row.call.ltp = data.lp;
    } else {
      row.put.ltp = data.lp;
    }
  }
};

const getMasterSymbolPrice = () => {
  switch (selectedMasterSymbol.value) {
    case 'NIFTY': return niftyPrice.value;
    case 'BANKNIFTY': return bankNiftyPrice.value;
    case 'FINNIFTY': return finniftyPrice.value;
    case 'MIDCPNIFTY': return midcpniftyPrice.value;
    case 'SENSEX': return sensexPrice.value;
    case 'BANKEX': return bankexPrice.value;
    default: return 'N/A';
  }
};

watch([selectedMasterSymbol, selectedExpiry], updateOptionChain);

onMounted(() => {
  spotPrice.value = getMasterSymbolPrice();
  updateOptionChain();
});
</script>

<style scoped>
.table th,
.table td {
  text-align: right;
  padding: 0.5rem;
}

.table th:first-child,
.table td:first-child,
.table th:nth-child(7),
.table td:nth-child(7),
.table th:last-child,
.table td:last-child {
  text-align: center;
}
</style>