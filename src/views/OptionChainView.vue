<template>
  <NavigationComponent />
  <section class="container-fluid py-5">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">Option Chain - NIFTY</h1>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th colspan="5" class="text-center bg-light">CALLS</th>
                <th class="text-center bg-info">Strike Price</th>
                <th colspan="5" class="text-center bg-light">PUTS</th>
              </tr>
              <tr>
                <th>Symbol</th>
                <th>Token</th>
                <th>Price Precision</th>
                <th>Tick Size</th>
                <th>Lot Size</th>
                <th class="text-center bg-info">Strike</th>
                <th>Lot Size</th>
                <th>Tick Size</th>
                <th>Price Precision</th>
                <th>Token</th>
                <th>Symbol</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in optionChainData" :key="row.strikePrice">
                <td>{{ row.callSymbol }}</td>
                <td>{{ row.callToken }}</td>
                <td>{{ row.callPP }}</td>
                <td>{{ row.callTI }}</td>
                <td>{{ row.callLS }}</td>
                <td class="text-center bg-info">{{ row.strikePrice }}</td>
                <td>{{ row.putLS }}</td>
                <td>{{ row.putTI }}</td>
                <td>{{ row.putPP }}</td>
                <td>{{ row.putToken }}</td>
                <td>{{ row.putSymbol }}</td>
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
import { ref, onMounted } from 'vue';
import axios from 'axios';

const BASE_URL = 'https://piconnect.flattrade.in/PiConnectTP';
const optionChainData = ref([]);

// Fetch Flattrade credentials from localStorage
const flattradeCredentials = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
const clientId = flattradeCredentials.clientId;

const loadOptionChain = async () => {
  try {
    const jKey = localStorage.getItem('FLATTRADE_API_TOKEN');
    if (!jKey) {
      throw new Error('API Token not found. Please log in first.');
    }

    if (!clientId) {
      throw new Error('Flattrade Client ID not found. Please check your broker settings.');
    }

    const jData = JSON.stringify({
      uid: clientId,
      exch: 'NFO',
      tsym: 'NIFTY03OCT24C25900',
      strprc: '25900',
      cnt: '5'
    });

    const response = await axios.post(`${BASE_URL}/GetOptionChain`, `jData=${jData}&jKey=${jKey}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data.stat === 'Ok') {
      processOptionChainData(response.data.values);
    } else {
      throw new Error(response.data.emsg || 'Failed to fetch option chain data');
    }
  } catch (error) {
    console.error('Error loading option chain:', error);
    // You may want to show an error message to the user here
  }
};

const processOptionChainData = (data) => {
  const processedData = {};

  data.forEach(item => {
    const strikePrice = parseFloat(item.strprc);
    if (!processedData[strikePrice]) {
      processedData[strikePrice] = {
        strikePrice: strikePrice,
        callSymbol: '-',
        callToken: '-',
        callPP: '-',
        callTI: '-',
        callLS: '-',
        putSymbol: '-',
        putToken: '-',
        putPP: '-',
        putTI: '-',
        putLS: '-',
      };
    }

    const side = item.optt === 'CE' ? 'call' : 'put';
    processedData[strikePrice][`${side}Symbol`] = item.tsym;
    processedData[strikePrice][`${side}Token`] = item.token;
    processedData[strikePrice][`${side}PP`] = item.pp;
    processedData[strikePrice][`${side}TI`] = item.ti;
    processedData[strikePrice][`${side}LS`] = item.ls;
  });

  optionChainData.value = Object.values(processedData).sort((a, b) => a.strikePrice - b.strikePrice);
};

onMounted(() => {
  loadOptionChain();
});
</script>

<style scoped>
.table th,
.table td {
  text-align: right;
  padding: 0.5rem;
}

.table th.text-center,
.table td.text-center {
  text-align: center;
}
</style>
