<script setup>
import { onMounted, ref } from 'vue';
import AppNavigationComponent from '@/components/AppNavigationComponent.vue';
import { checkAllTokens } from '@/utils/brokerTokenValidator';
import { useTradeView } from '@/composables/useTradingSystem';

const {
  // Methods
  selectedBrokerToDelete,
  copyToClipboard,
  generateToken,
  getStatus,
  maskTokenSecret,
  handleShoonyaLogin,
  deleteBroker,
  ManageBrokerMaskClientId,


  // Computed properties


  // Reactive variables
  API_TOKEN, // Not used right now
  FLATTRADE_API_KEY,
  FLATTRADE_API_SECRET,
  FLATTRADE_CLIENT_ID,
  FLATTRADE_API_TOKEN,
  SHOONYA_API_KEY,
  SHOONYA_CLIENT_ID,
  SHOONYA_API_TOKEN,
  PAPERTRADING_API_KEY, // Default value for PaperTrading
  PAPERTRADING_CLIENT_ID, // Default value for PaperTrading
  flattradeReqCode,
  shoonyaBrokerPassword,
  shoonyaOneTimePassword,
  errorMessage,
  statusMessage,
  brokers,
  selectedBrokerForPaper,

} = useTradeView();

// Add this new ref to track visibility for each broker
const visibleClientIds = ref({});

// Modify the toggle function to work per broker
const toggleBrokerClientIdVisibility = (brokerId) => {
  visibleClientIds.value[brokerId] = !visibleClientIds.value[brokerId];
};

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
  PAPERTRADING_API_KEY.value = paperTradingDetails.apiKey || '';
  PAPERTRADING_CLIENT_ID.value = paperTradingDetails.clientId || '';
  const storedSelectedBrokerForPaper = localStorage.getItem('selectedBrokerForPaper');
  if (storedSelectedBrokerForPaper) {
    selectedBrokerForPaper.value = JSON.parse(storedSelectedBrokerForPaper);
  }

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




</script>

<template>
  <AppNavigationComponent />

  <section class="row pt-5 pb-3">
    <div class="col-8 text-start">
      <RouterLink to="/add-broker">
        <button class="btn btn-outline btn-sm">Add New Broker</button>
      </RouterLink>
    </div>
    <div class="col-4 text-end">

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
              <span class="badge bg-primary">
                {{ visibleClientIds[broker.id] ? broker.brokerClientId : ManageBrokerMaskClientId(broker.brokerClientId)
                }}
              </span>
              <button class="btn btn-sm btn-outline-secondary ms-2" @click="toggleBrokerClientIdVisibility(broker.id)">
                {{ visibleClientIds[broker.id] ? '👁️' : '👀' }}
              </button>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <span v-if="broker.brokerName === 'Flattrade' || broker.brokerName === 'Shoonya'">
                  {{ maskTokenSecret(broker.apiToken) }}
                </span>
                <button v-if="broker.apiToken" class="btn btn-sm btn-outline-secondary ms-2"
                  @click="copyToClipboard(broker.apiToken)" title="Copy token">
                  📋
                </button>
              </div>
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
              <template v-else-if="broker.brokerName === 'Flattrade'">
                <a class="link" @click.prevent="generateToken(broker)">Generate Token</a>
              </template>
              <template v-else-if="broker.brokerName === 'PaperTrading'">
                <select class="form-select form-select-sm w-100" v-model="selectedBrokerForPaper">
                  <option selected>Select Broker</option>
                  <option v-for="broker in brokers.filter(b => b.brokerName !== 'PaperTrading')" :key="broker.id"
                    :value="broker">{{ broker.brokerName }}</option>
                </select>
              </template>
            </td>
            <td>
              <span v-if="broker.brokerName !== 'PaperTrading'" :class="`badge ${getStatus(broker).statusClass}`">{{
                getStatus(broker).status }}</span>
              <span v-else-if="selectedBrokerForPaper"
                :class="`badge ${getStatus(selectedBrokerForPaper).statusClass}`">{{
                  getStatus(selectedBrokerForPaper).status }}</span>
              <span v-else class="badge bg-warning text-color">No broker selected</span>
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
      <p v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</p>
      <p v-if="statusMessage" class="alert alert-info">{{ statusMessage }}</p>
    </div>
  </section>

  <!-- Shoonya Login -->
  <div class="modal fade" id="ShoonyaLogin" tabindex="-1" aria-labelledby="ShoonyaLoginLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <form @submit.prevent="handleShoonyaLogin" class="">
          <div class="modal-header">
            <h1 class="modal-title fs-6" id="ShoonyaLoginLabel">
              Shoonya Login
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="col-12">
              <div class="mb-2">
                <label for="ShoonyaBrokerUserId" class="form-label mb-0">Broker User ID</label>
                <input type="text" id="ShoonyaBrokerUserId" class="form-control"
                  :value="ManageBrokerMaskClientId(SHOONYA_CLIENT_ID)" placeholder="Enter Broker User ID" disabled>
              </div>

              <div class="mb-2">
                <label for="ShoonyaBrokerPassword" class="form-label mb-0">Broker Password</label>
                <input type="password" id="ShoonyaBrokerPassword" class="form-control" v-model="shoonyaBrokerPassword"
                  placeholder="Enter Broker Password">
              </div>

              <div class="mb-2">
                <label for="ShoonyaOneTimePassword" class="form-label mb-0">TOTP</label>
                <input type="password" id="ShoonyaOneTimePassword" class="form-control" v-model="shoonyaOneTimePassword"
                  placeholder="Enter Time Based OTP">
              </div>
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
        </form>
      </div>
    </div>
  </div>

  <!-- Update Token -->
  <div class="modal fade" id="UpdateToken" tabindex="-1" aria-labelledby="UpdateTokenLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-6" id="UpdateTokenLabel">
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