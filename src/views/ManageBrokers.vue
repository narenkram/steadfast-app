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
            <td><a class="link" @click="generateToken(broker)">Generate Token</a></td>
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

  <div v-if="request_code">
    <h1>Request Code: {{ request_code }}</h1>
    <h1>Client: {{ client }}</h1>
    <h1>Token: {{ token }}</h1>
  </div>
</template>

<script>
import axios from 'axios';
import crypto from 'crypto-js'; // Ensure you have crypto-js installed
import qs from 'qs'; // Ensure you have qs installed

export default {
  data() {
    return {
      brokers: [],
      request_code: null,
      client: null,
      token: null
    };
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:3000/brokers');
      this.brokers = response.data;
    } catch (error) {
      console.error('Failed to fetch brokers:', error);
    }
  },
  methods: {
    maskApiSecret(apiSecret) {
      if (!apiSecret || apiSecret.length < 10) return '******';
      const start = apiSecret.slice(0, 3);
      const end = apiSecret.slice(-3);
      return `${start}******${end}`;
    },
    maskBrokerClientId(brokerClientId) {
      if (!brokerClientId) return 'N/A';
      const length = brokerClientId.length;
      if (length <= 2) return brokerClientId;
      const maskLength = Math.max(1, Math.floor(length / 2));
      const startUnmaskedLength = Math.ceil((length - maskLength) / 2);
      const endUnmaskedLength = length - startUnmaskedLength - maskLength;
      const firstPart = brokerClientId.slice(0, startUnmaskedLength);
      const lastPart = brokerClientId.slice(-endUnmaskedLength);
      const middleMask = '*'.repeat(maskLength);
      return `${firstPart}${middleMask}${lastPart}`;
    },
    async generateToken(broker) {
      if (broker.brokerName !== 'Flattrade') return;

      const apiKey = broker.apiKey;
      const apiSecret = broker.apiSecret;
      const authUrl = `https://auth.flattrade.in/?app_key=${apiKey}`;

      console.log('Opening auth URL:', authUrl);
      const authWindow = window.open(authUrl, '_blank');

      if (!authWindow) {
        console.error('Failed to open auth URL. Check for pop-up blockers.');
        return;
      }

      const messageListener = async (event) => {
        console.log('Received event:', event);
        console.log('Event origin:', event.origin);
        console.log('Event data:', event.data);

        if (event.origin !== 'http://localhost:5173') {
          console.error('Invalid origin:', event.origin);
          return;
        }

        if (typeof event.data !== 'string' || !event.data.includes('request_code')) {
          console.error('Invalid event data:', event.data);
          return;
        }

        try {
          const url = new URL(event.data);
          const requestCode = url.searchParams.get('request_code');
          const client = url.searchParams.get('client');
          console.log('Extracted request code:', requestCode);
          console.log('Extracted client:', client);

          if (!requestCode) {
            console.error('Request code is undefined');
            return;
          }

          const concatenatedValue = `${apiKey}${requestCode}${apiSecret}`;
          const hashedSecret = crypto.SHA256(concatenatedValue).toString();
          console.log('Generated hashed secret:', hashedSecret);

          try {
            const response = await axios.post('https://authapi.flattrade.in/trade/apitoken', qs.stringify({
              api_key: apiKey,
              request_code: requestCode,
              api_secret: hashedSecret,
            }), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            console.log('Token:', response.data.token);
            this.token = response.data.token;
          } catch (error) {
            console.error('Failed to generate token:', error);
          }
        } catch (error) {
          console.error('Failed to construct URL:', error);
        }

        authWindow.close();
        window.removeEventListener('message', messageListener);
      };

      window.addEventListener('message', messageListener);
    },
  },
};
</script>