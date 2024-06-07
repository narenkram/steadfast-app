<template>
  <section class="row py-2">
    <form @submit.prevent>
      <div class="row">
        <!-- Exchange Selection -->
        <div class="col-2">
          <label for="Exchange" class="form-label mb-0">Exchange</label>
          <select id="Exchange" class="form-select" aria-label="Exchange" v-model="selectedExchange"
            @change="fetchTradingData">
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
        </div>

        <!-- Master Symbol Selection -->
        <div class="col-2">
          <label for="MasterSymbol" class="form-label mb-0">Master Symbol</label>
          <select id="MasterSymbol" class="form-select" aria-label="Master Symbol" v-model="selectedMasterSymbol"
            @change="fetchTradingData">
            <option v-for="symbol in exchangeSymbols[selectedExchange]" :key="symbol" :value="symbol">{{ symbol }}
            </option>
          </select>
        </div>

        <!-- Expiry Date Selection -->
        <div class="col-2">
          <label for="Expiry" class="form-label mb-0">Expiry Date</label>
          <select id="Expiry" class="form-select" aria-label="Expiry" v-model="selectedExpiry">
            <option v-for="date in expiryDates" :key="date" :value="date">{{ date }}</option>
          </select>
        </div>
      </div>

      <div class="row mt-2 align-items-center justify-content-between">
        <!-- Call Strike Selection -->
        <div class="col-3">
          <label for="CallStrike" class="form-label mb-0">Call Strike</label>
          <select id="CallStrike" class="form-select" aria-label="Call Strike" v-model="selectedCallStrike">
            <option v-for="strike in callStrikes" :key="strike.securityId" :value="strike">
              {{ strike.tradingSymbol }} - {{ strike.expiryDate }}
            </option>
          </select>
          <div>
            Selected Security ID: {{ selectedCallStrike.securityId || 'Select a strike' }}
          </div>
          <button class="btn btn-lg btn-outline-success fs-5 w-100 my-2">Buy CE</button>
          <button class="btn btn-lg btn-outline-danger fs-5 w-100">Sell CE</button>
        </div>

        <!-- Put Strike Selection -->
        <div class="col-3">
          <label for="PutStrike" class="form-label mb-0">Put Strike</label>
          <select id="PutStrike" class="form-select" aria-label="Put Strike" v-model="selectedPutStrike">
            <option v-for="strike in putStrikes" :key="strike.securityId" :value="strike">
              {{ strike.tradingSymbol }} - {{ strike.expiryDate }}
            </option>
          </select>
          <div>
            Selected Security ID: {{ selectedPutStrike.securityId || 'Select a strike' }}
          </div>
          <button class="btn btn-lg btn-outline-success fs-5 w-100 my-2">Buy PE</button>
          <button class="btn btn-lg btn-outline-danger fs-5 w-100">Sell PE</button>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
export default {
  data() {
    return {
      selectedExchange: 'NSE',
      selectedMasterSymbol: 'NIFTY',
      selectedExpiry: null,
      selectedCallStrike: {},
      selectedPutStrike: {},
      defaultCallSecurityId: null,
      defaultPutSecurityId: null,
      exchangeSymbols: {
        NSE: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'NIFTYNXT50'],
        BSE: ['SENSEX', 'BANKEX']
      },
      callStrikes: [],
      putStrikes: [],
      expiryDates: []
    };
  },
  methods: {
    async fetchTradingData() {
      const response = await fetch(`/symbols?exchangeSymbol=${this.selectedExchange}&masterSymbol=${this.selectedMasterSymbol}`);
      const data = await response.json();
      this.callStrikes = data.callStrikes;
      this.putStrikes = data.putStrikes;
      this.expiryDates = data.expiryDates;

      // Set default values for strikes and expiry if available
      if (this.callStrikes.length > 0) {
        this.selectedCallStrike = this.callStrikes[0];
      }
      if (this.putStrikes.length > 0) {
        this.selectedPutStrike = this.putStrikes[0];
      }
      if (this.expiryDates.length > 0) {
        this.selectedExpiry = this.expiryDates[0];
      }

      // Automatically set the security IDs for the default selected strikes
      this.defaultCallSecurityId = this.getSecurityId(this.callStrikes, this.selectedCallStrike);
      this.defaultPutSecurityId = this.getSecurityId(this.putStrikes, this.selectedPutStrike);
    },
    getSecurityId(strikes, strike) {
      return strike ? strike.securityId : 'N/A';
    },
    updateStrikesForExpiry(expiryDate) {
      // Filter call and put strikes based on the selected expiry date
      this.selectedCallStrike = this.callStrikes.filter(strike => strike.expiryDate === expiryDate)[0] || {};
      this.selectedPutStrike = this.putStrikes.filter(strike => strike.expiryDate === expiryDate)[0] || {};
    }
  },
  watch: {
    selectedExpiry(newExpiry) {
      // Filter strikes by the new expiry date
      this.updateStrikesForExpiry(newExpiry);
    },
    selectedCallStrike(newStrike) {
      // Update security ID for the selected call strike
      this.defaultCallSecurityId = this.getSecurityId(this.callStrikes, newStrike);
    },
    selectedPutStrike(newStrike) {
      // Update security ID for the selected put strike
      this.defaultPutSecurityId = this.getSecurityId(this.putStrikes, newStrike);
    }
  },
  mounted() {
    this.fetchTradingData();
  }
};
</script>
