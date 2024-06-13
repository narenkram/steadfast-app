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

  <div v-if="statusMessage">
    <h1>{{ statusMessage }}</h1>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      brokers: [],
      statusMessage: null,
      token: null,
      isAuthActive: false // Flag to indicate if authentication is active
    };
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:3000/brokers');
      this.brokers = response.data;
    } catch (error) {
      console.error('Failed to fetch brokers:', error);
    }

    window.addEventListener('message', this.handleMessage);
  },
  beforeUnmount() {
    window.removeEventListener('message', this.handleMessage);
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
    generateToken(broker) {
      if (broker.brokerName !== 'Flattrade') return;

      const apiKey = broker.apiKey;
      const authUrl = `https://auth.flattrade.in/?app_key=${apiKey}&redirect_uri=${encodeURIComponent(window.location.origin + '/redirect')}`;

      console.log('Opening auth URL:', authUrl);
      const authWindow = window.open(authUrl, '_blank');

      if (!authWindow) {
        console.error('Failed to open auth URL. Check for pop-up blockers.');
        return;
      }

      this.isAuthActive = true; // Set the flag to true when authentication starts
      this.statusMessage = 'Waiting for user to complete auth on broker portal...';
    },
    async handleMessage(event) {
      if (!this.isAuthActive) return; // Ignore messages if authentication is not active

      console.log('Received event:', event);
      console.log('Event origin:', event.origin);
      console.log('Event data:', event.data);

      // Ensure the event data is in the expected format
      if (event.origin !== 'http://localhost:5173') {
        console.error('Invalid origin:', event.origin);
        return;
      }

      if (typeof event.data !== 'string' || !event.data.startsWith('http://localhost:5173?request_code=')) {
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

        this.statusMessage = 'Receiving request code, now making call to obtain token...';

        const broker = this.brokers.find(b => b.brokerName === 'Flattrade');
        if (!broker) {
          console.error('Broker not found');
          return;
        }

        const apiKey = broker.apiKey;
        const apiSecret = broker.apiSecret;

        try {
          const response = await axios.post('http://localhost:3000/api/exchange-code', {
            api_key: apiKey,
            request_code: requestCode,
            api_secret: apiSecret,
          });

          const token = response.data.token;
          if (token) {
            console.log('Token:', token);
            this.token = token;
            this.statusMessage = `Token Key Obtained: ${token}`;
          } else {
            console.error('Token not found in response');
            this.statusMessage = 'Failed to obtain token.';
          }
        } catch (error) {
          console.error('Failed to generate token:', error);
          this.statusMessage = 'Failed to obtain token.';
        } finally {
          this.isAuthActive = false; // Reset the flag after processing
        }
      } catch (error) {
        console.error('Failed to construct URL:', error);
        this.statusMessage = 'Failed to process request code.';
        this.isAuthActive = false; // Reset the flag in case of error
      }
    }
  }
};
</script>
