<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const APIKEY = 'e44ac8efec6f44de9dd8581fc7bd9281';
const secretKey = '2024.f8792c44c9cd4366b56779cad79e49b015493894fe9eaf39';
const reqCode = ref('');
const token = ref('');
const errorMessage = ref('');
const statusMessage = ref('');
const brokers = ref([]);

onMounted(() => {
  const storedCode = localStorage.getItem('authCode');
  if (storedCode) {
    reqCode.value = storedCode;
    localStorage.removeItem('authCode');
    localStorage.removeItem('statusMessage');
  } else {
    statusMessage.value = localStorage.getItem('statusMessage') || '';
  }
});

watch(reqCode, (newCode) => {
  if (newCode) {
    generateToken();
  }
});

const openAuthUrl = () => {
  localStorage.setItem('statusMessage', 'Waiting for broker auth to complete...');
  const authUrl = `https://auth.flattrade.in/?app_key=${APIKEY}`;
  window.open(authUrl, '_blank');
};

const generateToken = async () => {
  if (!reqCode.value) {
    errorMessage.value = 'Request code is missing';
    return;
  }

  const api_secret = APIKEY + reqCode.value + secretKey;
  const hashedSecret = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(api_secret));
  const apiSecretHex = Array.from(new Uint8Array(hashedSecret)).map(b => b.toString(16).padStart(2, '0')).join('');

  const payload = {
    api_key: APIKEY,
    request_code: reqCode.value,
    api_secret: apiSecretHex
  };

  try {
    const res = await axios.post('/flattradeApi/trade/apitoken', payload);
    const generatedToken = res.data.token;
    if (!generatedToken) {
      errorMessage.value = "Token generation failed";
    } else {
      token.value = generatedToken;
      errorMessage.value = '';
      console.log('Token generated successfully:', generatedToken);
      const data = {
        token: generatedToken,
        api_key: APIKEY,
        api_secret: secretKey,
        userid: 'userid',
        password: 'password'
      };
      // Use the data object as needed
    }
  } catch (error) {
    errorMessage.value = 'Error generating token: ' + error.message;
    console.error('Error generating token:', error);
  }
};
</script>

<template>
  <section class="row py-5">
    <div class="col-6 text-start">
      <RouterLink to="/add-broker">
        <button class="btn btn-primary">Add New Broker</button>
      </RouterLink>
      <button class="ms-3 btn btn-outline-secondary">Refresh Broker List</button>
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
            <td>{{ maskApiSecret(broker.apiSecret) }}</td>
            <td><span class="badge text-bg-success">{{ broker.status }}</span></td>
            <td>{{ broker.lastTokenGeneratedAt }}</td>
            <td><a class="link" @click="loginBrokerAccount(broker)">Generate Token</a></td>
            <td>
              <a class="mx-1"><span class="SelectBroker">▶️</span></a>
              <a class="mx-1"><span class="PauseBroker">⏸️</span></a>
              <a class="mx-1"><span class="DeleteBroker">❌</span></a>
            </td>
            <td>{{ broker.addedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  
  <main>
      <button @click="openAuthUrl">Open Authorization URL</button>
      <div v-if="reqCode">Request Code: {{ reqCode }}</div>
      <div v-if="token">Token: {{ token }}</div>
      <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
      <div v-if="statusMessage" style="color: blue;">{{ statusMessage }}</div>
    </main>
</template>
