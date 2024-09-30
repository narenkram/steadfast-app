<template>
  <NavigationComponent />
  <section class="container-fluid py-5">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">Option Greeks - NIFTY</h1>
        <div class="mb-3">
          <label for="strikePrice" class="form-label">Strike Price:</label>
          <input type="number" id="strikePrice" v-model="strikePrice" class="form-control" @change="loadOptionGreek" />
        </div>
        <div class="mb-3">
          <label for="spotPrice" class="form-label">Spot Price:</label>
          <input type="number" id="spotPrice" v-model="spotPrice" class="form-control" @change="loadOptionGreek" />
        </div>
        <div v-if="optionGreekData">
          <p>Request Time: {{ optionGreekData.request_time }}</p>
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Greek</th>
                  <th>Call</th>
                  <th>Put</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Price</td>
                  <td>{{ optionGreekData.cal_price }}</td>
                  <td>{{ optionGreekData.put_price }}</td>
                </tr>
                <tr>
                  <td>Delta</td>
                  <td>{{ optionGreekData.cal_delta }}</td>
                  <td>{{ optionGreekData.put_delta }}</td>
                </tr>
                <tr>
                  <td>Gamma</td>
                  <td>{{ optionGreekData.cal_gamma }}</td>
                  <td>{{ optionGreekData.put_gamma }}</td>
                </tr>
                <tr>
                  <td>Theta</td>
                  <td>{{ optionGreekData.cal_theta }}</td>
                  <td>{{ optionGreekData.put_theta }}</td>
                </tr>
                <tr>
                  <td>Rho</td>
                  <td>{{ optionGreekData.cal_rho }}</td>
                  <td>{{ optionGreekData.put_rho }}</td>
                </tr>
                <tr>
                  <td>Vega</td>
                  <td>{{ optionGreekData.cal_vega }}</td>
                  <td>{{ optionGreekData.put_vega }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import NavigationComponent from '../components/NavigationComponent.vue'
import { ref, onMounted } from 'vue';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const optionGreekData = ref(null);
const strikePrice = ref(25900);
const spotPrice = ref(25900);

// Fetch Flattrade credentials from localStorage
const flattradeCredentials = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
const clientId = flattradeCredentials.clientId;

const loadOptionGreek = async () => {
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
      exd: '03-OCT-2024', // You might want to make this dynamic
      strprc: strikePrice.value.toString(),
      sptprc: spotPrice.value.toString(),
      int_rate: '7', // You might want to make this configurable
      volatility: '12.8', // You might want to make this configurable
      optt: 'CE' // This will give Greeks for both CE and PE
    });

    const response = await axios.post(`${BASE_URL}/flattrade/getOptionGreek`, { jData }, {
      headers: {
        'Authorization': `Bearer ${jKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.stat === 'OK') {
      optionGreekData.value = response.data;
    } else {
      throw new Error(response.data.emsg || 'Failed to fetch option Greek data');
    }
  } catch (error) {
    console.error('Error loading option Greek:', error);
    // You may want to show an error message to the user here
  }
};

onMounted(() => {
  loadOptionGreek();
});
</script>

<style scoped>
.table th,
.table td {
  text-align: right;
  padding: 0.5rem;
}

.table th:first-child,
.table td:first-child {
  text-align: left;
}
</style>
