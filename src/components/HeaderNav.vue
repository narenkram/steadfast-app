<script setup>
import { onMounted, ref } from 'vue';
import FlattradeServiceAxios from '@/api/FlattradeServiceAxios';

const marketData = ref(null);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await FlattradeServiceAxios.getMarketData();
    marketData.value = response.data;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    error.value = 'Failed to load data. Please try again later.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <nav class="row">
    <div class="col-6">
      <h1>Steadfast Stoic</h1>
      <p class="lead">Designed to survive options buying.</p>
    </div>
    <div class="col-6">
      <ul class="navbar-nav flex-row float-end">
        <li class="nav-item">
          <RouterLink class="nav-link" to="/">Home</RouterLink>
        </li>
        <li class="nav-item ms-2">
          <RouterLink class="nav-link" to="/login">Login</RouterLink>
        </li>
        <li class="nav-item ms-2">
          <RouterLink class="nav-link" to="/account">Account</RouterLink>
        </li>
      </ul>
    </div>

    <div class="col-12">
      <div>
        <h1>Market Data</h1>
        <div v-if="loading">
          Loading data...
        </div>
        <div v-else-if="error">
          Error: {{ error }}
        </div>
        <div v-else>
          <pre>{{ marketData }}</pre>
        </div>
      </div>
    </div>
  </nav>
</template>