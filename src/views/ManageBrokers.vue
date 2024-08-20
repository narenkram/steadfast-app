<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { validateToken, checkAllTokens, getBrokerStatus, tokenStatus } from '../utils/brokerTokenValidator';

const FLATTRADE_API_KEY = ref('');
const FLATTRADE_API_SECRET = ref('');
const FLATTRADE_CLIENT_ID = ref('');
const FLATTRADE_API_TOKEN = ref('');
const SHOONYA_API_KEY = ref('');
const SHOONYA_CLIENT_ID = ref('');
const SHOONYA_API_TOKEN = ref('');
const PAPERTRADING_API_KEY = ref('logicGate'); // Default value for PaperTrading
const PAPERTRADING_CLIENT_ID = ref('Sp0ck'); // Default value for PaperTrading

const flattradeReqCode = ref('');
const shoonyaBrokerUserId = ref('');
const shoonyaBrokerPassword = ref('');
const shoonyaOneTimePassword = ref('');

const token = ref('');
const errorMessage = ref('');
const statusMessage = ref('');
const userTriggeredTokenGeneration = ref(false); // Flag to track user-triggered token generation

const brokers = computed(() => {
  const brokersArray = [];

  if (FLATTRADE_CLIENT_ID.value && FLATTRADE_API_KEY.value && FLATTRADE_API_SECRET.value) {
    brokersArray.push({
      id: 'Flattrade',
      brokerName: 'Flattrade',
      brokerClientId: FLATTRADE_CLIENT_ID.value,
      apiKey: FLATTRADE_API_KEY.value,
      apiSecret: FLATTRADE_API_SECRET.value,
      apiToken: FLATTRADE_API_TOKEN.value
    });
  }

  if (SHOONYA_CLIENT_ID.value && SHOONYA_API_KEY.value) {
    brokersArray.push({
      id: 'Shoonya',
      brokerName: 'Shoonya',
      brokerClientId: SHOONYA_CLIENT_ID.value,
      apiKey: SHOONYA_API_KEY.value,
      apiToken: SHOONYA_API_TOKEN.value
    });
  }

  // Add PaperTrading broker
  if (PAPERTRADING_CLIENT_ID.value && PAPERTRADING_API_KEY.value) {
    brokersArray.push({
      id: 'PaperTrading',
      brokerName: 'PaperTrading',
      brokerClientId: PAPERTRADING_CLIENT_ID.value,
      apiKey: PAPERTRADING_API_KEY.value,
      apiToken: '' // PaperTrading does not have an API token
    });
  }

  return brokersArray;
});

const selectedBrokerToDelete = ref(null); // Store the broker to be deleted

onMounted(() => {
  // Retrieve Flattrade details
  const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
  FLATTRADE_API_KEY.value = flattradeDetails.apiKey || '';
  FLATTRADE_API_SECRET.value = flattradeDetails.apiSecret || '';
  FLATTRADE_CLIENT_ID.value = flattradeDetails.clientId || '';
  FLATTRADE_API_TOKEN.value = localStorage.getItem('FLATTRADE_API_TOKEN') || '';

  // Retrieve Shoonya details
  const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}');
  SHOONYA_API_KEY.value = shoonyaDetails.apiKey || '';
  SHOONYA_CLIENT_ID.value = shoonyaDetails.clientId || '';
  SHOONYA_API_TOKEN.value = localStorage.getItem('SHOONYA_API_TOKEN') || '';

  // Retrieve PaperTrading details
  const paperTradingDetails = JSON.parse(localStorage.getItem('broker_PaperTrading') || '{}');
  PAPERTRADING_API_KEY.value = paperTradingDetails.apiKey || 'logicGate';
  PAPERTRADING_CLIENT_ID.value = paperTradingDetails.clientId || 'Sp0ck';

  // fetchBrokers(); disabled, as we are using localStorage to store the broker details

  const storedCode = localStorage.getItem('flattradeReqCode');
  if (storedCode) {
    flattradeReqCode.value = storedCode;
  }
  statusMessage.value = localStorage.getItem('statusMessage') || '';
  // Clear any lingering status message after component mount
  if (statusMessage.value === 'Waiting for broker auth to complete...') {
    setTimeout(() => {
      statusMessage.value = '';
      localStorage.removeItem('statusMessage');
    }, 5000);
  }
  // Add event listener for postMessage
  window.addEventListener('message', (event) => {
    if (event.data.type === 'flattradeReqCode' && event.data.code) {
      flattradeReqCode.value = event.data.code;
      localStorage.setItem('flattradeReqCode', event.data.code); // Update local storage with new flattradeReqCode
    }
  });
  checkAllTokens();
});

// Watch for changes in FLATTRADE_API_TOKEN and update localStorage
watch(FLATTRADE_API_TOKEN, (newToken) => {
  if (newToken) {
    localStorage.setItem('FLATTRADE_API_TOKEN', newToken);
    validateToken('Flattrade');
  } else {
    localStorage.removeItem('FLATTRADE_API_TOKEN');
  }
});
// Watch for changes in SHOONYA_API_TOKEN and update localStorage
watch(SHOONYA_API_TOKEN, (newToken) => {
  if (newToken) {
    localStorage.setItem('SHOONYA_API_TOKEN', newToken);
    validateToken('Shoonya');
  } else {
    localStorage.removeItem('SHOONYA_API_TOKEN');
  }
});

const openFlattradeAuthUrl = () => {
  statusMessage.value = 'Waiting for broker auth to complete...';

  localStorage.setItem('statusMessage', statusMessage.value);

  const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
  const storedFlattradeApiKey = flattradeDetails.apiKey;

  if (!storedFlattradeApiKey) {
    errorMessage.value = 'API key is missing';
    clearErrorMessage();
    return;
  }

  const authUrl = `https://auth.flattrade.in/?app_key=${storedFlattradeApiKey}`;
  window.open(authUrl, '_blank');

  // Clear status message after 2 minutes if token generation doesn't complete
  setTimeout(() => {
    if (statusMessage.value === 'Waiting for broker auth to complete...') {
      statusMessage.value = '';
      localStorage.removeItem('statusMessage');
    }
  }, 120000); // 2 minutes
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
    statusMessage.value = 'Waiting for flattradeReqCode...';
    return;
  }

  if (!flattradeReqCode.value) {
    errorMessage.value = 'Request code is missing';
    clearErrorMessage();
    return;
  }
};

watch(flattradeReqCode, async (newCode) => {
  if (newCode && userTriggeredTokenGeneration.value) {
    statusMessage.value = `Received flattradeReqCode: ${newCode}`;

    const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
    const storedApiKey = flattradeDetails.apiKey;
    const storedApiSecret = flattradeDetails.apiSecret;

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
      const token = res.data.token;
      if (!token) {
        errorMessage.value = "Token generation failed";
        clearErrorMessage();
      } else {
        FLATTRADE_API_TOKEN.value = token;
        errorMessage.value = '';
        statusMessage.value = `Token generated successfully: ${token}`;
        localStorage.removeItem('statusMessage'); // Clear the stored status message
        console.log('Token generated successfully:', token);

        // Clear success message after 5 seconds
        setTimeout(() => {
          statusMessage.value = '';
        }, 5000);
      }
    } catch (error) {
      errorMessage.value = 'Error generating token: ' + error.message;
      clearErrorMessage();
      console.error('Error generating token:', error);
    }
  }
});

function maskBrokerClientId(brokerClientId) {

  if (!brokerClientId) return brokerClientId; // Ensure brokerClientId is defined and not a placeholder

  const length = brokerClientId.length;
  if (length <= 2) return brokerClientId; // If the length is 2 or less, return as is

  const maskLength = Math.max(1, Math.floor(length / 2)); // Mask at least 1 character, up to half the length
  const startUnmaskedLength = Math.ceil((length - maskLength) / 2);
  const endUnmaskedLength = length - startUnmaskedLength - maskLength;

  const firstPart = brokerClientId.slice(0, startUnmaskedLength);
  const lastPart = brokerClientId.slice(-endUnmaskedLength);
  const middleMask = '*'.repeat(maskLength); // Mask middle portion dynamically

  return `${firstPart}${middleMask}${lastPart}`;
}

const getStatus = (broker) => {
  const status = getBrokerStatus(broker.brokerName);
  let statusText = 'Activated';
  let statusClass = 'bg-success';

  if (status === 'Token missing') {
    statusText = `Token missing, Click ${broker.brokerName === 'Shoonya' ? 'Login' : 'generate'}`;
    statusClass = 'bg-warning text-dark';
  } else if (status === 'expired') {
    statusText = `Token Expired, Click ${broker.brokerName === 'Shoonya' ? 'Login' : 'generate'}`;
    statusClass = 'bg-warning text-dark';
  }

  return { status: statusText, statusClass };
};

function maskTokenSecret(apiSecret) {

  if (!apiSecret || apiSecret.length < 10) return apiSecret; // Ensure there are enough characters to mask and not a placeholder

  const start = apiSecret.slice(0, 3);
  const end = apiSecret.slice(-3);
  return `${start}******${end}`;
}

const handleShoonyaLogin = async () => {
  try {
    const encoder = new TextEncoder();

    // Retrieve Shoonya details from localStorage
    const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}');
    const clientId = shoonyaDetails.clientId;
    const apiKey = shoonyaDetails.apiKey;

    if (!clientId || !apiKey) {
      throw new Error('Shoonya client ID or API key is missing');
    }

    // Hash the password
    const pwdBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(shoonyaBrokerPassword.value));
    const pwd = Array.from(new Uint8Array(pwdBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Create and hash the appkey
    const appkeyRaw = `${SHOONYA_CLIENT_ID.value}|${apiKey}`;
    const appkeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(appkeyRaw));
    const appkey = Array.from(new Uint8Array(appkeyBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const jData = {
      apkversion: "1.0.0",
      uid: SHOONYA_CLIENT_ID.value,
      pwd: pwd,
      factor2: shoonyaOneTimePassword.value,
      vc: `${clientId}_U`,
      appkey: appkey,
      imei: "mac",
      source: "API"
    };

    const jDataString = JSON.stringify(jData);
    const payload = `jData=${jDataString}&jKey=${apiKey}`;

    const response = await axios.post('/shoonyaApi/NorenWClientTP/QuickAuth', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.stat === 'Ok') {
      SHOONYA_API_TOKEN.value = response.data.susertoken;
      localStorage.setItem('SHOONYA_API_TOKEN', SHOONYA_API_TOKEN.value);
      statusMessage.value = 'Shoonya login successful';

      // Clear the form fields
      shoonyaBrokerUserId.value = '';
      shoonyaBrokerPassword.value = '';
      shoonyaOneTimePassword.value = '';
      // Clear the status message after 5 seconds
      setTimeout(() => {
        statusMessage.value = '';
      }, 5000);

    } else {
      throw new Error(response.data.emsg || 'Login failed');
    }
  } catch (error) {
    errorMessage.value = `Shoonya login error: ${error.message}`;
    clearErrorMessage();
  }
};

const deleteBroker = (broker) => {
  // Remove broker details from localStorage
  localStorage.removeItem(`broker_${broker.brokerName}`);

  // Remove API token from localStorage if it exists
  if (broker.brokerName === 'Flattrade') {
    localStorage.removeItem('FLATTRADE_API_TOKEN');
    FLATTRADE_API_TOKEN.value = '';
    FLATTRADE_API_KEY.value = '';
    FLATTRADE_API_SECRET.value = '';
    FLATTRADE_CLIENT_ID.value = '';
  } else if (broker.brokerName === 'Shoonya') {
    localStorage.removeItem('SHOONYA_API_TOKEN');
    SHOONYA_API_TOKEN.value = '';
    SHOONYA_API_KEY.value = '';
    SHOONYA_CLIENT_ID.value = '';
  } else if (broker.brokerName === 'PaperTrading') {
    localStorage.removeItem('PAPERTRADING_API_TOKEN');
    PAPERTRADING_API_KEY.value = '';
    PAPERTRADING_CLIENT_ID.value = '';
  }

  // Update the brokers computed property
  // This will automatically update the table
};
</script>

<template>
  <section class="row py-5">
    <div class="col-8 text-start">
      <RouterLink to="/add-broker">
        <button class="btn btn-primary">Add New Broker</button>
      </RouterLink>
    </div>
    <div class="col-4 text-end">
      <RouterLink to="/steadfast">
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
            <th scope="col">API Token</th>
            <th scope="col">Validity</th>
            <th scope="col" class="text-center">Activation</th>
            <th scope="col">Status</th>
            <th scope="col">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="brokers.length === 0">
            <td colspan="7" class="text-center">No brokers added yet. Please add a broker to get started.</td>
          </tr>
          <tr v-else v-for="broker in brokers" :key="broker.id">
            <td>{{ broker.brokerName }}</td>
            <td>
              <span class="badge bg-primary">{{ maskBrokerClientId(broker.brokerClientId) }}</span>
            </td>
            <td>
              <span v-if="broker.brokerName === 'Flattrade'">{{ maskTokenSecret(broker.apiToken) }}</span>
              <span v-if="broker.brokerName === 'Shoonya'">{{ maskTokenSecret(broker.apiToken) }}</span>
            </td>
            <td>
              <span v-if="broker.brokerName === 'Flattrade'">24 Hours</span>
              <span v-if="broker.brokerName === 'Shoonya'">24 Hours</span>
            </td>
            <td class="text-center">
              <template v-if="broker.brokerName === 'Shoonya'">
                <button class="btn btn-outline-primary btn-sm w-75" data-bs-toggle="modal"
                  data-bs-target="#ShoonyaLogin">
                  Login
                </button>
              </template>
              <template v-else-if="broker.brokerName == 'Flattrade'">
                <a class="link" @click.prevent="generateToken(broker)">Generate Token</a>
              </template>
            </td>
            <td>
              <span :class="`badge ${getStatus(broker).statusClass}`">{{ getStatus(broker).status }}</span>
            </td>
            <td>
              <button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal"
                data-bs-target="#DeleteBrokerConfirmationModal" @click="selectedBrokerToDelete = broker">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="row">
    <div class="col-12">
      <div>
        <span v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</span>
        <span v-if="statusMessage" class="alert alert-info">{{ statusMessage }}</span>
      </div>
    </div>
  </section>

  <!-- Shoonya Login -->
  <div class="modal fade" id="ShoonyaLogin" tabindex="-1" aria-labelledby="ShoonyaLoginLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="ShoonyaLoginLabel">
            Shoonya Login
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="col-12">
            <label for="ShoonyaBrokerUserId" class="form-label mb-0">Broker User ID</label>
            <input type="text" id="ShoonyaBrokerUserId" class="form-control"
              :value="maskBrokerClientId(SHOONYA_CLIENT_ID)" placeholder="Enter Broker User ID" disabled>

            <label for="ShoonyaBrokerPassword" class="form-label mb-0">Broker Password</label>
            <input type="password" id="ShoonyaBrokerPassword" class="form-control" v-model="shoonyaBrokerPassword"
              placeholder="Enter Broker Password">

            <label for="ShoonyaOneTimePassword" class="form-label mb-0">One time password</label>
            <input type="password" id="ShoonyaOneTimePassword" class="form-control" v-model="shoonyaOneTimePassword"
              placeholder="Enter One time password">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="handleShoonyaLogin">
            Login
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Update Token -->
  <div class="modal fade" id="UpdateToken" tabindex="-1" aria-labelledby="UpdateTokenLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="UpdateTokenLabel">
            Update Token
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="col-12">
            <label for="ApiToken" class="form-label mb-0">API Token</label>
            <input type="text" id="ApiToken" class="form-control" v-model="API_TOKEN" placeholder="Enter API Token">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="updateToken" data-bs-dismiss="modal">
            Update
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Broker Confirmation Modal -->
  <div class="modal fade" id="DeleteBrokerConfirmationModal" tabindex="-1"
    aria-labelledby="DeleteBrokerConfirmationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="DeleteBrokerConfirmationModalLabel">Confirm Broker Deletion</h5>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the broker "{{ selectedBrokerToDelete?.brokerName }}"? This action cannot
            be
            undone.</p>
        </div>
        <div class="modal-footer">
          <div class="d-flex flex-row justify-content-between w-100">
            <button type="button" class="btn btn-outline-secondary w-50 me-1" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger w-50 ms-1" data-bs-dismiss="modal"
              @click="deleteBroker(selectedBrokerToDelete)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>