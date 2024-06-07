<template>
  <section class="row py-2">
    <form @submit.prevent>
      <div class="row">
        <!-- Exchange Selection -->
        <div class="col-2">
          <label for="Exchange" class="form-label mb-0">Exchange</label>
          <select id="Exchange" class="form-select" aria-label="Exchange" v-model="selectedExchange"
            @change="fetchTradingData">
            <option v-for="(symbols, exchange) in exchangeSymbols" :key="exchange" :value="exchange">{{ exchange }}
            </option>
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

        <!-- Quantity Selection -->
        <div class="col-2">
          <label for="Quantity" class="form-label mb-0">Quantity</label>
          <select id="Quantity" class="form-select" v-model="selectedQuantity" aria-label="Quantity">
            <option v-for="quantity in availableQuantities" :key="quantity" :value="quantity">{{ quantity }}</option>
          </select>
        </div>
      </div>

      <div class="row mt-2 align-items-center justify-content-between">
        <!-- Call Strike Selection -->
        <div class="col-3">
          <label for="CallStrike" class="form-label mb-0">Call Strike</label>
          <select id="CallStrike" class="form-select" aria-label="Call Strike" v-model="selectedCallStrike">
            <option v-for="strike in callStrikes" :key="strike.securityId" :value="strike">
              {{ strike.tradingSymbol }}
            </option>
          </select>
          <div>
            Selected Security ID: {{ defaultCallSecurityId }}
          </div>
          <button class="btn btn-lg btn-outline-success fs-5 w-100 my-2">Buy CE</button>
          <button class="btn btn-lg btn-outline-danger fs-5 w-100">Sell CE</button>
        </div>

        <!-- Put Strike Selection -->
        <div class="col-3">
          <label for="PutStrike" class="form-label mb-0">Put Strike</label>
          <select id="PutStrike" class="form-select" aria-label="Put Strike" v-model="selectedPutStrike">
            <option v-for="strike in putStrikes" :key="strike.securityId" :value="strike">
              {{ strike.tradingSymbol }}
            </option>
          </select>
          <div>
            Selected Security ID: {{ defaultPutSecurityId }}
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
        BSE: ['SENSEX', 'BANKEX', 'SENSEX50']
      },
      callStrikes: [],
      putStrikes: [],
      expiryDates: [],
      synchronizeOnLoad: true, // Flag to control synchronization behavior
      quantities: {
        NIFTY: [25],
        BANKNIFTY: [15],
        FINNIFTY: [40],
        MIDCPNIFTY: [75],
        NIFTYNXT50: [10],
        SENSEX: [10],
        BANKEX: [15],
        SENSEX50: [25]
      },
      availableQuantities: []
    };
  },
  methods: {
    async fetchTradingData() {
      const response = await fetch(`/symbols?exchangeSymbol=${this.selectedExchange}&masterSymbol=${this.selectedMasterSymbol}`);
      const data = await response.json();

      // Sort expiry dates
      this.expiryDates = data.expiryDates.sort((a, b) => new Date(a) - new Date(b));

      // Sort call and put strikes by expiry date and then by trading symbol
      this.callStrikes = data.callStrikes.sort((a, b) => {
        return new Date(a.expiryDate) - new Date(b.expiryDate) || a.tradingSymbol.localeCompare(b.tradingSymbol);
      });
      this.putStrikes = data.putStrikes.sort((a, b) => {
        return new Date(a.expiryDate) - new Date(b.expiryDate) || a.tradingSymbol.localeCompare(b.tradingSymbol);
      });

      // Set default values if available
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
      this.defaultCallSecurityId = this.selectedCallStrike.securityId || 'N/A';
      this.defaultPutSecurityId = this.selectedPutStrike.securityId || 'N/A';

      this.synchronizeOnLoad = true; // Enable synchronization after data is loaded
      this.updateStrikesForExpiry(this.selectedExpiry); // Initial update with synchronization
    },
    getSecurityId(strikes, strike) {
      return strike ? strike.securityId : 'N/A';
    },
    updateStrikesForExpiry(expiryDate) {
      const filteredCallStrikes = this.callStrikes.filter(strike => strike.expiryDate === expiryDate);
      const filteredPutStrikes = this.putStrikes.filter(strike => strike.expiryDate === expiryDate);

      const foundCallStrike = filteredCallStrikes.find(strike => strike.tradingSymbol === this.selectedCallStrike.tradingSymbol);
      const foundPutStrike = filteredPutStrikes.find(strike => strike.tradingSymbol === this.selectedPutStrike.tradingSymbol);

      if (foundCallStrike) {
        this.selectedCallStrike = foundCallStrike;
      } else {
        this.selectedCallStrike = filteredCallStrikes.length > 0 ? filteredCallStrikes[0] : {};
      }

      if (foundPutStrike) {
        this.selectedPutStrike = foundPutStrike;
      } else {
        this.selectedPutStrike = filteredPutStrikes.length > 0 ? filteredPutStrikes[0] : {};
      }

      if (this.synchronizeOnLoad) {
        this.synchronizeStrikes(); // Synchronize only if the flag is true
        this.synchronizeOnLoad = false; // Turn off synchronization after the initial load
      }
    },
    synchronizeStrikes() {
      // Synchronize call and put strikes based on the current selection
      this.synchronizeCallStrikes();
      this.synchronizePutStrikes();
    },
    synchronizeCallStrikes() {
      if (this.selectedPutStrike) {
        const baseSymbol = this.selectedPutStrike.tradingSymbol.replace(/-PE$/, '');
        const matchingCallStrike = this.callStrikes.find(strike =>
          strike.tradingSymbol.startsWith(baseSymbol) && strike.tradingSymbol.endsWith('-CE')
        );
        if (matchingCallStrike) {
          this.selectedCallStrike = matchingCallStrike;
        } else {
          this.selectedCallStrike = {};
        }
      }
      this.updateSecurityIds();
    },
    synchronizePutStrikes() {
      if (this.selectedCallStrike) {
        const baseSymbol = this.selectedCallStrike.tradingSymbol.replace(/-CE$/, '');
        const matchingPutStrike = this.putStrikes.find(strike =>
          strike.tradingSymbol.startsWith(baseSymbol) && strike.tradingSymbol.endsWith('-PE')
        );
        if (matchingPutStrike) {
          this.selectedPutStrike = matchingPutStrike;
        } else {
          this.selectedPutStrike = {};
        }
      }
      this.updateSecurityIds();
    },
    updateSecurityIds() {
      this.defaultCallSecurityId = this.selectedCallStrike.securityId || 'N/A';
      this.defaultPutSecurityId = this.selectedPutStrike.securityId || 'N/A';
    },
    updateAvailableQuantities() {
      this.availableQuantities = this.quantities[this.selectedMasterSymbol];
      if (!this.availableQuantities.includes(this.selectedQuantity)) {
        this.selectedQuantity = this.availableQuantities[0];
      }
    }
  },
  watch: {
    selectedExpiry(newExpiry) {
      this.updateStrikesForExpiry(newExpiry);
    },
    selectedCallStrike(newStrike, oldStrike) {
      if (newStrike !== oldStrike && !this.synchronizeOnLoad) {
        this.updateSecurityIds();
      }
    },
    selectedPutStrike(newStrike, oldStrike) {
      if (newStrike !== oldStrike && !this.synchronizeOnLoad) {
        this.updateSecurityIds();
      }
    },
    selectedMasterSymbol(newSymbol) {
      this.updateAvailableQuantities();
    },
    selectedExchange(newExchange) {
      if (this.exchangeSymbols[newExchange].length > 0) {
        this.selectedMasterSymbol = this.exchangeSymbols[newExchange][0];
      } else {
        this.selectedMasterSymbol = null; // Handle case where no symbols are available
      }
      this.updateAvailableQuantities(); // Update quantities based on the new master symbol
    }
  },
  mounted() {
    this.fetchTradingData();
    this.updateAvailableQuantities(); // Set initial quantities based on the default selectedMasterSymbol
  }
};
</script>
