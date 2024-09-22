<template>
  <section class="row py-5">
    <div class="row">
      <div class="col-6">
        <h3>Steps to add your broker 💰</h3>

        <div class="card w-100 h-75 border">
          <div class="card-body">
            <p class="card-text">YouTube Video</p>
          </div>
        </div>
      </div>

      <div class="col-6">
        <h3>Add broker API Details 🔐</h3>
        <p>Please watch the YouTube video on how to obtain the following details.</p>
        <!-- Select Broker -->
        <form @submit.prevent="addBroker">
          <label for="SelectBroker" class="mt-3 form-label mb-0"><b>Select Broker</b></label>
          <select v-model="selectedBroker" class="form-select" aria-label="Select Broker">
            <option value="">Select a broker</option>
            <option value="Flattrade">Flattrade</option>
            <option value="Shoonya">Shoonya</option>
            <option value="PaperTrading">Paper Trading</option>
          </select>

          <!-- Link to Open Selected Broker's API Dashboard -->
          <div class="text-center w-100" v-if="selectedBroker">
            <button class="btn btn-outline-primary my-3" @click="openBrokerDashboard" :disabled="!selectedBroker">
              Click here to access your {{ selectedBroker }} API Dashboard
            </button>
          </div>

          <label for="ClientID" class="form-label mb-0 mt-3"><b>Client ID</b></label>
          <input v-model="clientId" type="text" class="form-control" id="ClientID" required>

          <!-- API Key (for Flattrade, Shoonya, and Paper Trading) -->
          <label for="APIKey" class="form-label mb-0 mt-3"><b>API Key</b></label>
          <input v-model="apiKey" type="text" class="form-control" id="APIKey" required>

          <!-- API Secret Key (only for Flattrade) -->
          <label v-if="selectedBroker === 'Flattrade'" for="APISecretKey" class="form-label mb-0 mt-3"><b>API Secret
              Key</b></label>
          <input v-if="selectedBroker === 'Flattrade'" v-model="apiSecret" type="text" class="form-control"
            id="APISecretKey" required>

          <!-- Redirect URL -->
          <label v-show="selectedBroker !== ''" for="RedirectURL" class="form-label mb-0 mt-3"><b>Redirect URL</b></label>
          <input v-show="selectedBroker !== ''" type="text" class="form-control" id="RedirectURL" :value="redirectURL" disabled required>
          <p v-show="selectedBroker !== ''" class="form-text text-info">If your broker requires a redirect URL, register this URL in your broker's
            portal to get API details.
          </p>

          <!-- Add Broker -->
          <div class="d-flex justify-content-between mt-5">
            <button class="btn btn-primary w-100">Add Broker</button>
            <RouterLink to="/manage-brokers" class=" ms-2 w-100">
              <button class="btn btn-secondary w-100">Cancel</button>
            </RouterLink>
          </div>
        </form>
      </div>
    </div>


  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const redirectURL = computed(() => `http://127.0.0.1:5173/${selectedBroker.value.toLowerCase()}/redirect?`);

const selectedBroker = ref('');
const apiKey = ref('');
const apiSecret = ref('');
const clientId = ref('');

// Watch for changes in selectedBroker to prefill default values
watch(selectedBroker, (newBroker) => {
  if (newBroker === 'PaperTrading') {
    apiKey.value = 'simulate123';
    clientId.value = 'VIRTUAL001';
  } else {
    apiKey.value = '';
    clientId.value = '';
  }
});

const getBrokerDashboardLink = computed(() => {
  switch (selectedBroker.value) {
    case 'Flattrade':
      return 'https://wall.flattrade.in/';
    case 'Shoonya':
      return 'https://prism.shoonya.com/';
    case 'PaperTrading':
      return 'https://papertrading.example.com/';
    default:
      return '#';
  }
});
const openBrokerDashboard = () => {
  if (selectedBroker.value) {
    window.open(getBrokerDashboardLink.value, '_blank');
  }
};

const addBroker = () => {
  const brokerDetails = {
    brokerName: selectedBroker.value,
    clientId: clientId.value,
    apiKey: apiKey.value,
  };

  if (selectedBroker.value === 'Flattrade') {
    brokerDetails.apiSecret = apiSecret.value;
  }

  // Store in localStorage
  localStorage.setItem(`broker_${selectedBroker.value}`, JSON.stringify(brokerDetails));

  // Navigate to manage-brokers page
  router.push('/manage-brokers');
};
</script>