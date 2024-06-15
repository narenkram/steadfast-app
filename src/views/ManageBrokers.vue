<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const APIKEY = 'e44ac8efec6f44de9dd8581fc7bd9281';
const secretKey = '2024.f8792c44c9cd4366b56779cad79e49b015493894fe9eaf39';
const reqCode = ref('');
const token = ref('');
const errorMessage = ref('');
const statusMessage = ref('');
const userTriggeredTokenGeneration = ref(false); // Flag to track user-triggered token generation

const brokers = ref([]);
const fetchBrokers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/brokers');
    brokers.value = response.data;
  } catch (error) {
    console.error('Failed to fetch brokers:', error);
  }
};

onMounted(() => {
  fetchBrokers();

  const storedCode = localStorage.getItem('reqCode');
  if (storedCode) {
    reqCode.value = storedCode;
  }
  statusMessage.value = localStorage.getItem('statusMessage') || '';

  // Add event listener for postMessage
  window.addEventListener('message', (event) => {
    if (event.data.type === 'reqCode' && event.data.code) {
      reqCode.value = event.data.code;
      localStorage.setItem('reqCode', event.data.code); // Update local storage with new reqCode
    }
  });
});

watch(reqCode, (newCode) => {
  if (newCode && userTriggeredTokenGeneration.value) {
    statusMessage.value = `Received reqCode: ${newCode}`;
    generateToken();
  }
});

const openFlattradeAuthUrl = () => {
  localStorage.setItem('statusMessage', 'Waiting for broker auth to complete...');
  const authUrl = `https://auth.flattrade.in/?app_key=${APIKEY}`;
  window.open(authUrl, '_blank');
};

const clearErrorMessage = () => {
  setTimeout(() => {
    errorMessage.value = '';
  }, 5000); // Clear error message after 5 seconds
};

const generateToken = async (broker) => {
  userTriggeredTokenGeneration.value = true; // Set the flag when user triggers token generation

  if (!broker) {
    errorMessage.value = 'Broker information is missing';
    clearErrorMessage();
    return;
  }

  if (broker.brokerName === 'Flattrade') {
    openFlattradeAuthUrl();
    statusMessage.value = 'Waiting for reqCode...';
    return;
  }

  if (!reqCode.value) {
    errorMessage.value = 'Request code is missing';
    clearErrorMessage();
    return;
  }
};

watch(reqCode, async (newCode) => {
  if (newCode && userTriggeredTokenGeneration.value) {
    const api_secret = APIKEY + newCode + secretKey;
    const hashedSecret = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(api_secret));
    const apiSecretHex = Array.from(new Uint8Array(hashedSecret)).map(b => b.toString(16).padStart(2, '0')).join('');

    const payload = {
      api_key: APIKEY,
      request_code: newCode,
      api_secret: apiSecretHex,
    };

    try {
      const res = await axios.post('/flattradeApi/trade/apitoken', payload);
      const generatedToken = res.data.token;
      if (!generatedToken) {
        errorMessage.value = "Token generation failed";
        clearErrorMessage();
      } else {
        token.value = generatedToken;
        localStorage.setItem('generatedToken', generatedToken); // Store the token in localStorage
        errorMessage.value = '';
        statusMessage.value = `Token generated successfully: ${generatedToken}`;
        console.log('Token generated successfully:', generatedToken);
      }
    } catch (error) {
      errorMessage.value = 'Error generating token: ' + error.message;
      clearErrorMessage();
      console.error('Error generating token:', error);
    }
  }
});

const maskBrokerClientId = (brokerClientId) => {
  if (!brokerClientId) return 'N/A'; // Ensure brokerClientId is defined

  const length = brokerClientId.length;
  if (length <= 2) return brokerClientId; // If the length is 2 or less, return as is

  const maskLength = Math.max(1, Math.floor(length / 2)); // Mask at least 1 character, up to half the length
  const startUnmaskedLength = Math.ceil((length - maskLength) / 2);
  const endUnmaskedLength = length - startUnmaskedLength - maskLength;

  const firstPart = brokerClientId.slice(0, startUnmaskedLength);
  const lastPart = brokerClientId.slice(-endUnmaskedLength);
  const middleMask = '*'.repeat(maskLength); // Mask middle portion dynamically

  return `${firstPart}${middleMask}${lastPart}`;
};

const maskApiSecret = (apiSecret) => {
  if (!apiSecret || apiSecret.length < 10) return '******'; // Ensure there are enough characters to mask
  if (!apiSecret || apiSecret.length < 10) return '******';
  const start = apiSecret.slice(0, 3);
  const end = apiSecret.slice(-3);
  return `${start}******${end}`;
};

const fundLimits = ref('');
const getFundLimits = async () => {
  let jKey = localStorage.getItem('generatedToken') || token.value;

  if (!jKey) {
    errorMessage.value = 'Token is missing. Please generate a token first.';
    clearErrorMessage();
    return;
  }

  const jData = JSON.stringify({ uid: 'FT014523', actid: 'FT014523' });
  const payload = `jKey=${jKey}&jData=${jData}`;

  try {
    const res = await axios.post('https://piconnect.flattrade.in/PiConnectTP/Limits', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    fundLimits.value = res.data;
    console.log(res.data);
  } catch (error) {
    errorMessage.value = 'Error fetching fund limits: ' + error.message;
    clearErrorMessage();
    console.error('Error fetching fund limits:', error);
  }
};
</script>

<template>
  <section class="row py-5">
    <div class="col-6 text-start">
      <RouterLink to="/add-broker">
        <button class="btn btn-primary">Add New Broker</button>
      </RouterLink>
      <button class="ms-3 btn btn-outline-secondary" @click="fetchBrokers">Refresh Broker List</button>
    </div>
    <div class="col-6 text-end">
      <RouterLink to="/">
        <button class="btn btn-primary">
          Open 1 Click Trade View
        </button>
      </RouterLink>
    </div>
  </section>

  <section class="row">
    <div class="col-12">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Broker</th>
            <th scope="col">Broker Client ID</th>
            <th scope="col">App ID</th>
            <th scope="col">App Secret Key</th>
            <th scope="col">Status</th>
            <th scope="col">Last Token Generated At</th>
            <th scope="col">Generate Token</th>
            <th scope="col">Action</th>
            <th scope="col">Added At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="broker in brokers" :key="broker.id">
            <td>{{ broker.brokerName }}</td>
            <td>
              <span class="badge bg-primary">{{ maskBrokerClientId(broker.brokerClientId) }}</span>
            </td>
            <td>{{ broker.appId }}</td>
            <td>{{ maskApiSecret(broker.appSecretKey) }}</td>
            <td>{{ broker.status }}</td>
            <td>{{ broker.lastTokenGeneratedAt }}</td>
            <td><a class="link" @click.prevent="generateToken(broker)">Generate Token</a></td>
            <td>
              <!-- Add any additional actions here -->
            </td>
            <td>{{ broker.addedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="row">
    <div class="col-12">
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="statusMessage" class="alert alert-info">{{ statusMessage }}</div>
    </div>
  </section>

  <button @click="getFundLimits">Get Fund Limits</button>
  {{ fundLimits }}
</template>