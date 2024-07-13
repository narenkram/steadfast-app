<template>
  <section class="row py-5">
    <div class="row">
      <div class="col-6">
        <h3>Steps to generate API Key 🔑 and API Secret key</h3>

        <div class="card w-100 h-75 bg-light">
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
            <option value="Dhan">Dhan</option>
            <option value="Flattrade">Flattrade</option>
            <option value="Shoonya">Shoonya</option>
          </select>

          <!-- Link to Open Selected Broker's API Dashboard -->
          <div class="text-center w-100">
            <a class="nav-link my-3" href="" target="_blank">Click here to access your selected broker API Dashboard</a>
          </div>

          <!-- API Key (for Flattrade and Shoonya) -->
          <label v-if="selectedBroker !== 'Dhan'" for="APIKey" class="form-label mb-0 mt-3"><b>API Key</b></label>
          <input v-if="selectedBroker !== 'Dhan'" v-model="apiKey" type="text" class="form-control" id="APIKey" required>

          <!-- API Secret Key (only for Flattrade) -->
          <label v-if="selectedBroker === 'Flattrade'" for="APISecretKey" class="form-label mb-0 mt-3"><b>API Secret Key</b></label>
          <input v-if="selectedBroker === 'Flattrade'" v-model="apiSecret" type="text" class="form-control" id="APISecretKey" required>

          <!-- API Token (only for Dhan) -->
          <label v-if="selectedBroker === 'Dhan'" for="APIToken" class="form-label mb-0 mt-3"><b>API Token</b></label>
          <input v-if="selectedBroker === 'Dhan'" v-model="apiToken" type="text" class="form-control" id="APIToken" required>

          <label for="ClientID" class="form-label mb-0 mt-3"><b>Client ID</b></label>
          <input v-model="clientId" type="text" class="form-control" id="ClientID" required>

          <!-- Redirect URL -->
          <label for="RedirectURL" class="form-label mb-0 mt-3"><b>Redirect URL</b></label>
          <input type="text" class="form-control" id="RedirectURL" disabled
            value="https://localhost:5173/broker/login/{{ selectedBroker }}" required>

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const selectedBroker = ref('');
const apiKey = ref('');
const apiSecret = ref('');
const apiToken = ref('');
const clientId = ref('');

const addBroker = () => {
  const brokerDetails = {
    brokerName: selectedBroker.value,
    clientId: clientId.value,
  };

  if (selectedBroker.value === 'Dhan') {
    brokerDetails.apiToken = apiToken.value;
  } else if (selectedBroker.value === 'Flattrade') {
    brokerDetails.apiKey = apiKey.value;
    brokerDetails.apiSecret = apiSecret.value;
  } else if (selectedBroker.value === 'Shoonya') {
    brokerDetails.apiKey = apiKey.value;
  }

  // Store in localStorage
  localStorage.setItem(`broker_${selectedBroker.value}`, JSON.stringify(brokerDetails));

  // Navigate to manage-brokers page
  router.push('/manage-brokers');
};
</script>