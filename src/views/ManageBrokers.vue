<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const FLATTRADE_APIKEY = ref('');
const FLATTRADE_API_SECRET = ref('');

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

const fetchFlattradeCredentials = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/flattrade-credentials');
    FLATTRADE_APIKEY.value = response.data.apiKey;
    FLATTRADE_API_SECRET.value = response.data.apiSecret;

    // Store the API key and secret in localStorage
    localStorage.setItem('FLATTRADE_APIKEY', FLATTRADE_APIKEY.value);
    localStorage.setItem('FLATTRADE_API_SECRET', FLATTRADE_API_SECRET.value);

    return {
      apiKey: FLATTRADE_APIKEY.value,
      apiSecret: FLATTRADE_API_SECRET.value
    };
  } catch (error) {
    console.error('Failed to fetch Flattrade credentials:', error);
    return null;
  }
};


onMounted(() => {
  fetchBrokers();
  fetchFlattradeCredentials();

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
  const storedFlattradeApiKey = localStorage.getItem('FLATTRADE_APIKEY');

  if (!storedFlattradeApiKey) {
    errorMessage.value = 'API key is missing';
    clearErrorMessage();
    return;
  }

  const authUrl = `https://auth.flattrade.in/?app_key=${storedFlattradeApiKey}`;
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
    const storedApiKey = localStorage.getItem('FLATTRADE_APIKEY');
    const storedApiSecret = localStorage.getItem('FLATTRADE_API_SECRET');

    if (!storedApiKey || !storedApiSecret) {
      errorMessage.value = 'API key or secret is missing';
      clearErrorMessage();
      return;
    }

    const api_secret = storedApiKey + newCode + storedApiSecret;
    const hashedSecret = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(api_secret));
    const apiSecretHex = Array.from(new Uint8Array(hashedSecret)).map(b => b.toString(16).padStart(2, '0')).join('');

    const payload = {
      api_key: storedApiKey,
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
const flattradeFundLimits = async () => {
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
const flatOrderBook = ref('');
const flatTradeBook = ref('');

const flattradeTrades = async () => {
  let jKey = localStorage.getItem('generatedToken') || token.value;

  if (!jKey) {
    errorMessage.value = 'Token is missing. Please generate a token first.';
    clearErrorMessage();
    return;
  }

  const orderBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: 'FT014523', prd: 'M' })}`;
  const tradeBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: 'FT014523', actid: 'FT014523' })}`;

  try {
    // Fetch Order Book
    const orderBookRes = await axios.post('https://piconnect.flattrade.in/PiConnectTP/OrderBook', orderBookPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    flatOrderBook.value = orderBookRes.data;
    console.log('Order Book:', orderBookRes.data);

    // Fetch Trade Book
    const tradeBookRes = await axios.post('https://piconnect.flattrade.in/PiConnectTP/TradeBook', tradeBookPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    flatTradeBook.value = tradeBookRes.data;
    console.log('Trade Book:', tradeBookRes.data);
  } catch (error) {
    errorMessage.value = 'Error fetching trades: ' + error.message;
    clearErrorMessage();
    console.error('Error fetching trades:', error);
  }
};
const flatPositionBook = ref([]);

const flattradePositionBook = async () => {
  let jKey = localStorage.getItem('generatedToken') || token.value;

  if (!jKey) {
    errorMessage.value = 'Token is missing. Please generate a token first.';
    clearErrorMessage();
    return;
  }

  const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: 'FT014523', actid: 'FT014523' })}`;

  try {
    const positionBookRes = await axios.post('https://piconnect.flattrade.in/PiConnectTP/PositionBook', positionBookPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (positionBookRes.data.stat === 'Ok') {
      flatPositionBook.value = positionBookRes.data;
      console.log('Position Book:', positionBookRes.data);
    } else {
      errorMessage.value = `Error fetching position book: ${positionBookRes.data.emsg}`;
      clearErrorMessage();
      console.error('Error fetching position book:', positionBookRes.data.emsg);
    }
  } catch (error) {
    errorMessage.value = 'Error fetching position book: ' + error.message;
    clearErrorMessage();
    console.error('Error fetching position book:', error);
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

  <button @click="flattradeFundLimits">Get Fund Limits</button>
  {{ fundLimits }}
  <!-- <button @click="flattradeOrderBook">Get Order Book</button>
  {{ flatOrderBook }}
  <button @click="flattradeTradeBook">Get Trade Book</button>
  {{ flatTradeBook }} -->
  <button @click="flattradeTrades">Get Trades</button>

  <table class="table table-hover" v-if="flatOrderBook.length || flatTradeBook.length">
    <thead>
      <tr>
        <th scope="col">Type</th>
        <th scope="col">Order ID</th>
        <th scope="col">Trade ID</th>
        <th scope="col">Symbol</th>
        <th scope="col">Quantity</th>
        <th scope="col">Price</th>
        <th scope="col">Date</th>
        <th scope="col">Status</th>
        <th scope="col">Reason</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in flatOrderBook" :key="order.norenordno">
        <td>Order</td>
        <td>{{ order.norenordno }}</td>
        <td>N/A</td>
        <td>{{ order.tsym }}</td>
        <td>{{ order.qty }}</td>
        <td>{{ order.prc }}</td>
        <td>{{ order.norentm }}</td>
        <td>{{ order.status }}</td>
        <td>{{ order.rejreason }}</td>
      </tr>
      <tr v-for="trade in flatTradeBook" :key="trade.norenordno">
        <td>Trade</td>
        <td>{{ trade.norenordno }}</td>
        <td>{{ trade.norenordno }}</td>
        <td>{{ trade.tsym }}</td>
        <td>{{ trade.qty }}</td>
        <td>{{ trade.prc }}</td>
        <td>{{ trade.norentm }}</td>
        <td>{{ trade.status }}</td>
        <td>{{ trade.rejreason }}</td>
      </tr>
    </tbody>
  </table>


  <button @click="flattradePositionBook">Get Position Book</button>
  <div v-if="flatPositionBook.length">
    <table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Symbol</th>
          <th scope="col">Quantity</th>
          <th scope="col">Average Price</th>
          <th scope="col">Current Price</th>
          <th scope="col">Profit/Loss</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="position in flatPositionBook" :key="position.tsym">
          <td>{{ position.tsym }}</td>
          <td>{{ position.netqty }}</td>
          <td>{{ position.netavgprc }}</td>
          <td>{{ position.lp }}</td>
          <td>{{ position.rpnl }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>