<template>
  <section class="row py-3">
    <div class="col-12">
      <!-- Broker Name and Status with Broker ID -->
      <div class="row">
        <div class="col-4">
          <p class="mb-0"><b>Broker</b></p>
          <p>
            Dhan ID
            <span v-if="showDhanId" @click="toggleDhanIdVisibility">{{ dhanClientId || 'N/A' }}</span>
            <span v-else @click="toggleDhanIdVisibility">{{ maskDhanId(dhanClientId) }}</span>
            <span class="badge bg-success">Connected</span>
          </p>
        </div>
        <div class="col-3">
          <p class="mb-0"><b>Total Funds</b></p>
          <p>₹ {{ fundLimits.availabelBalance || 0 }}</p>
        </div>
        <div class="col-2">
          <p class="mb-0"><b>Utilized Margin</b></p>
          <p>₹ {{ fundLimits.utilizedAmount || 0 }}</p>
        </div>
        <div class="col-3">
          <div class="d-flex align-items-center float-end">
            <label class="ToggleSwitch">
              <input class="ToggleInput" type="checkbox" id="enableArrowKeys" v-model="enableArrowKeys">
              <span class="ToggleSlider SliderRound"></span>
            </label>
            <label class="ToggleLabel" for="enableArrowKeys"><b> 1 Click <br /> Arrow Keys</b></label>
          </div>
        </div>
      </div>

    </div>
  </section>
  <section class="row py-3">
    <div class="col-lg-5">
      <div class="Card">
        <blockquote class="fs-3">₹ {{ totalProfit.toFixed(2) }}</blockquote>
        <small>
          ₹ ** Net PNL Estimated (after all charges)
        </small>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="Card">
        <blockquote class="fs-3">{{ totalCapitalPercentage.toFixed(2) }}% <small> on Total Capital</small></blockquote>
        <small>{{ deployedCapitalPercentage.toFixed(2) }}% on Deployed Capital</small>
      </div>
    </div>
    <div class="col-lg-2 d-flex justify-content-center align-items-center">
      <div class="Card">
        <button class="btn btn-primary shadow fs-3" @click="toggleKillSwitch">
          Kill Switch
        </button>
      </div>
    </div>
  </section>

  <hr />

  <section class="row py-2">
    <form @submit.prevent>
      <div class="row">
        <!-- Exchange Selection -->
        <div class="col-2">
          <label for="Exchange" class="form-label mb-0">Exchange</label>
          <select id="Exchange" class="form-select" aria-label="Exchange" v-model="selectedExchange"
            @change="fetchTradingData">
            <option v-for="(symbols, exchange) in exchangeSymbols" :key="exchange" :value="exchange">{{
              exchange }}
            </option>
          </select>
        </div>

        <!-- Master Symbol Selection -->
        <div class="col-2">
          <label for="MasterSymbol" class="form-label mb-0">Master Symbol</label>
          <select id="MasterSymbol" class="form-select" aria-label="Master Symbol" v-model="selectedMasterSymbol"
            @change="fetchTradingData">
            <option v-for="symbol in exchangeSymbols[selectedExchange]" :key="symbol" :value="symbol">{{
              symbol }}
            </option>
          </select>
        </div>

        <!-- Expiry Date Selection -->
        <div class="col-2">
          <label for="Expiry" class="form-label mb-0">Expiry Date</label>
          <select id="Expiry" class="form-select" aria-label="Expiry" v-model="selectedExpiry">
            <option v-for="date in expiryDates" :key="date" :value="date">
              {{ formatDate(date) }}
            </option>
          </select>
        </div>

        <!-- Product Type Selection -->
        <div class="col-2">
          <label for="ProductType" class="form-label mb-0">Product Type</label>
          <select id="ProductType" class="form-select" v-model="selectedProductType" aria-label="ProductType">
            <option v-for="productType in productTypes" :key="productType" :value="productType">{{
              productType }}
            </option>
          </select>
        </div>

        <!-- Quantity Selection -->
        <div class="col-2">
          <label for="Quantity" class="form-label mb-0">Quantity</label>
          <select id="Quantity" class="form-select" v-model="selectedQuantity" aria-label="Quantity">
            <option v-for="quantity in availableQuantities" :key="quantity" :value="quantity">{{ quantity }}
            </option>
          </select>
        </div>

        <!-- Order Type -->
        <div class="col-2">
          <label for="OrderType" class="form-label mb-0">Order Type</label>
          <select id="OrderType" class="form-select" aria-label="OrderType" v-model="selectedOrderType">
            <option v-for="orderType in orderTypes" :key="orderType" :value="orderType">{{ orderType }}
            </option>
          </select>
        </div>
      </div>

      <div class="row mt-2 align-items-center justify-content-between">
        <!-- Call Strike Selection -->
        <div class="col-3">
          <label for="CallStrike" class="form-label mb-0">Call Strike</label>
          <select id="CallStrike" class="form-select" aria-label="Call Strike" v-model="selectedCallStrike">
            <option v-for="strike in callStrikes" :key="strike.securityId" :value="strike">
              {{ formatTradingSymbol(strike.tradingSymbol) }}
            </option>
          </select>
          <div>
            Selected Security ID: {{ defaultCallSecurityId }}
          </div>
          <div class="btn-group w-100">
            <button type="button" class="btn btn-lg btn-success fs-5 my-2 w-75" @click="placeOrder('BUY', 'CALL')">
              <span>⬆️</span>
              Buy CE
            </button>
            <button type="button" class="btn btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
              data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
              <span class="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#PlaceLimitOrderWindow">Place Limit
                  Order</a></li>
            </ul>
          </div>
          <div class="btn-group w-100">
            <button type="button" class="btn btn-lg btn-danger fs-5 w-75" @click="placeOrder('SELL', 'CALL')">
              <span>⬅️</span>
              Sell CE
            </button>
            <button type="button" class="btn btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
              data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
              <span class="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#PlaceLimitOrderWindow">Place Limit
                  Order</a></li>
            </ul>
          </div>
        </div>

        <div class="col-3 text-center">
          <br />
          <br />
          <p class="mb-0">Nifty Bank</p>
          <p class="mb-0"><b>51700 <span class="text-success">(152/0.8%)</span></b></p>
          <button class="btn btn-lg btn-outline-secondary fs-5 w-100 my-2">Close Position</button>
          <button class="btn btn-lg btn-outline-secondary fs-5 w-100">Cancel Order</button>
        </div>

        <!-- Put Strike Selection -->
        <div class="col-3">
          <label for="PutStrike" class="form-label mb-0">Put Strike</label>
          <select id="PutStrike" class="form-select" aria-label="Put Strike" v-model="selectedPutStrike">
            <option v-for="strike in putStrikes" :key="strike.securityId" :value="strike">
              {{ formatTradingSymbol(strike.tradingSymbol) }}
            </option>
          </select>
          <div>
            Selected Security ID: {{ defaultPutSecurityId }}
          </div>
          <div class="btn-group w-100">
            <button type="button" class="btn btn-lg btn-success fs-5 my-2 w-75" @click="placeOrder('BUY', 'PUT')">
              <span>⬇️</span>
              Buy PE
            </button>
            <button type="button" class="btn btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
              data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
              <span class="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#PlaceLimitOrderWindow">Place Limit
                  Order</a></li>
            </ul>
          </div>
          <div class="btn-group w-100">
            <button type="button" class="btn btn-lg btn-danger fs-5 w-75" @click="placeOrder('SELL', 'PUT')">
              <span>➡️</span>
              Sell PE
            </button>
            <button type="button" class="btn btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
              data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
              <span class="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#PlaceLimitOrderWindow">Place Limit
                  Order</a></li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  </section>

  <section class="row py-3">
    <div class="col-12">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="positions-tab" data-bs-toggle="tab" data-bs-target="#positions-tab-pane"
            type="button" role="tab" aria-controls="positions-tab-pane" aria-selected="true"
            @click="fetchPositions">Positions</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="trades-tab" data-bs-toggle="tab" data-bs-target="#trades-tab-pane" type="button"
            role="tab" aria-controls="trades-tab-pane" aria-selected="false" @click="fetchOrders">Trades</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="notifications-tab" data-bs-toggle="tab" data-bs-target="#notifications-tab-pane"
            type="button" role="tab" aria-controls="notifications-tab-pane" aria-selected="false">Notifications</button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="positions-tab-pane" role="tabpanel" aria-labelledby="positions-tab"
          tabindex="0">
          <div class="row align-items-center">
            <div class="col-6 text-center py-2">
              <p class="mb-0"><b>Net Qty: </b>{{ totalNetQty }}</p>
            </div>
            <div class="col-6 text-center py-2">
              <p class="mb-0"><b>Total Buy Value: </b>x</p>
              <p class="mb-0"><b>Total Sell Value: </b>x</p>
            </div>
          </div>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Symbol Name</th>
                <th scope="col">Position Type</th>
                <th scope="col">Product Type</th>
                <th scope="col">Net Qty</th>
                <th scope="col">Buy Avg</th>
                <th scope="col">Sell Avg</th>
                <th scope="col">Realized Profit</th>
                <th scope="col">Unrealized Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="position in positions" :key="position.securityId">
                <td>{{ position.tradingSymbol }}</td>
                <td>{{ position.positionType }}</td>
                <td>{{ position.productType }}</td>
                <td>{{ position.netQty }}</td>
                <td>{{ position.buyAvg }}</td>
                <td>{{ position.sellAvg }}</td>
                <td>{{ position.realizedProfit }}</td>
                <td>{{ position.unrealizedProfit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tab-pane fade" id="trades-tab-pane" role="tabpanel" aria-labelledby="trades-tab" tabindex="0">
          <table class="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.exchangeOrderId">
                <td>{{ order.exchangeOrderId }}</td>
                <td>{{ order.tradingSymbol }}</td>
                <td>{{ order.quantity }}</td>
                <td>{{ order.price }}</td>
                <td>{{ order.orderStatus }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tab-pane fade" id="notifications-tab-pane" role="tabpanel" aria-labelledby="notifications-tab"
          tabindex="0">
          notifications-tab
          <div class="card-body text-danger">
            <p class="fs-5">
              Total Buy/Sell Value 10,500
              <small>exceeds 2 times more than total capital, OVER TRADE Warning</small>
            </p>
          </div>
        </div>
      </div>

    </div>

  </section>

  <ToastAlert :show="showToast" :message="toastMessage" @update:show="updateToastVisibility" />

  <!-- Modal -->
  <div class="modal fade" id="PlaceLimitOrderWindow" tabindex="-1" aria-labelledby="PlaceLimitOrderWindowLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="PlaceLimitOrderWindowLabel">Limit order</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          This is a demo modal
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>

</template>


<script>
import { GET_USER_TOKEN_GETTER } from '@/stores/storeconstants';
import { mapGetters } from 'vuex';
import axios from 'axios';
import ToastAlert from '../components/ToastAlert.vue';

export default {
  components: {
    ToastAlert,
  },
  data() {
    return {
      fundLimits: {}, // Initialize as an empty object
      dhanClientId: null, // Initialize as null
      showToast: false, // Controls the visibility of the toast
      toastMessage: '', // Message displayed in the toast
      killSwitchActive: false, // Initial state of the kill switch
      orders: [], // Define orders as an empty array initially
      currentTransactionType: '', // This will store either 'BUY' or 'SELL'
      // New properties
      showDhanId: false, // Controls the visibility of the Dhan ID
      positions: [], // Stores the positions fetched from the API

      selectedExchange: 'NSE',
      selectedMasterSymbol: 'NIFTY',
      selectedQuantity: null,
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
      availableQuantities: [],
      selectedOrderType: 'MARKET',
      orderTypes: ['MARKET', 'LIMIT'],
      selectedProductType: 'MARGIN',
      productTypes: ['INTRADAY', 'MARGIN'],


      enableArrowKeys: false, // Controls whether arrow keys are enabled

    };

  },
  computed: {
    ...mapGetters('auth', {
      token: GET_USER_TOKEN_GETTER,
    }),
    totalNetQty() {
      return this.positions.reduce((total, position) => total + position.netQty, 0);
    },
    totalProfit() {
      return this.positions.reduce((acc, position) => acc + position.unrealizedProfit + position.realizedProfit, 0);
    },
    totalCapitalPercentage() {
      // Total Capital Percentage based on totalProfit and totalMoney
      const totalMoney = (this.fundLimits.availabelBalance || 0) + (this.fundLimits.utilizedAmount || 0);
      return (this.totalProfit / totalMoney) * 100;
    },
    deployedCapitalPercentage() {
      // Deployed Capital Percentage based on totalProfit as a percentage of utilizedAmount
      const utilizedAmount = this.fundLimits.utilizedAmount || 0;
      return utilizedAmount ? (this.totalProfit / utilizedAmount) * 100 : 0;
    }
  },
  mounted() {
    this.fetchFundLimit();
    this.fetchDhanClientId();
    this.fetchPositions();

    // related to scrip master
    this.fetchTradingData();
    this.updateAvailableQuantities();
    // related to scrip master

    window.addEventListener('keydown', this.handleArrowKeys);

    // Listen for market_feed event
    this.$socket.on('market_feed', (data) => {
      console.log('Received market feed data:', data);
      // Handle the data as needed
    });
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleArrowKeys);
    this.$socket.off('market_feed'); // Clean up the socket listener
  },
  watch: {
    // related to scrip master
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
    // related to scrip master
  },
  methods: {
    // releated to scrip master
    async fetchTradingData() {
      const response = await fetch(`/symbols?exchangeSymbol=${this.selectedExchange}&masterSymbol=${this.selectedMasterSymbol}`);
      const data = await response.json();

      const today = new Date();
      this.expiryDates = data.expiryDates
        .filter(date => new Date(date.split(' ')[0]) >= today) // Filter out dates before today
        .sort((a, b) => new Date(a) - new Date(b)); // Sort dates in ascending order

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
    },
    formatTradingSymbol(symbol) {
      // Split the symbol by '-' and remove the date part and the last part after the strike price
      let parts = symbol.split('-');
      if (parts.length > 3) {
        // Rejoin the parts excluding the date and the last segment
        return `${parts[0]} ${parts[2]} ${parts[3]}`;
      }
      return symbol; // Return the original symbol if it doesn't match the expected format
    },
    formatDate(dateString) {
      // Extract only the date part from the date string
      return dateString.split(' ')[0]; // Splits the string by space and returns the first part (date)
    },
    // releated to scrip master



    async fetchFundLimit() {
      try {
        const { data } = await axios.get('http://localhost:3000/fundlimit');
        this.fundLimits = data;
        console.log('Fund Limits:', data);
      } catch (error) {
        console.error('Error fetching fund limit:', error);
      }
    },
    async fetchDhanClientId() {
      try {
        const { data } = await axios.get('http://localhost:3000/dhanClientId');
        this.dhanClientId = data.dhanClientId;
        console.log('Dhan Client ID:', data.dhanClientId);
      } catch (error) {
        console.error('Error fetching Dhan Client ID:', error);
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get('http://localhost:3000/positions');
        console.log('Fetched positions:', response.data); // Log the fetched data
        this.positions = response.data; // Store the fetched data in the positions data property
        console.log('Updated positions:', this.positions); // Log the updated positions data property
      } catch (error) {
        console.error('Error fetching positions:', error);
        this.toastMessage = 'Failed to fetch positions';
        this.showToast = true;
      }
    },
    async fetchOrders() {
      try {
        const response = await axios.get('http://localhost:3000/getOrders');
        this.orders = response.data; // Set the orders array
        console.log('Orders:', response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.toastMessage = 'Error fetching orders';
        this.showToast = true;
      }
    },
    async toggleKillSwitch() {
      const newStatus = this.killSwitchActive ? 'DEACTIVATE' : 'ACTIVATE';
      try {
        const response = await axios.post('http://localhost:3000/killSwitch', null, {
          params: { killSwitchStatus: newStatus }
        });
        console.log(`Kill Switch ${newStatus.toLowerCase()}d:`, response.data);

        // Handle different response messages
        if (response.data.killSwitchStatus === 'Kill Switch Activated') {
          this.toastMessage = 'Kill Switch activated successfully';
          this.killSwitchActive = true;
        } else if (response.data.killSwitchStatus === 'Kill Switch Deactivated') {
          this.toastMessage = 'Kill Switch deactivated successfully';
          this.killSwitchActive = false;
        } else if (response.data.killSwitchStatus === 'Kill Switch is already activated') {
          this.toastMessage = 'Kill Switch is already activated';
        } else if (response.data.killSwitchStatus === 'Kill switch deactivate allowed only once a day.') {
          this.toastMessage = 'Kill switch deactivate allowed only once a day.';
        } else {
          this.toastMessage = 'Unknown response from server';
        }

        this.showToast = true;
      } catch (error) {
        console.error(`Error ${newStatus.toLowerCase()}ing Kill Switch:`, error);
        this.toastMessage = `Failed to ${newStatus.toLowerCase()} Kill Switch`;
        this.showToast = true;
      }
    },
    updateToastVisibility(value) {
      this.showToast = value;
    },
    toggleDhanIdVisibility() {
      this.showDhanId = !this.showDhanId;
    },
    maskDhanId(dhanClientId) {
      if (!dhanClientId || dhanClientId.length < 10) return 'N/A'; // Ensure there are enough characters to mask
      const startUnmaskedLength = Math.ceil((dhanClientId.length - 6) / 2);
      const endUnmaskedLength = Math.floor((dhanClientId.length - 6) / 2);
      const firstPart = dhanClientId.slice(0, startUnmaskedLength);
      const lastPart = dhanClientId.slice(-endUnmaskedLength);
      const middleMask = '******'; // Mask middle 6 characters
      return `${firstPart}${middleMask}${lastPart}`;
    },
    handleArrowKeys(event) {
      if (!this.enableArrowKeys) return; // Exit if arrow keys are disabled

      switch (event.key) {
        case 'ArrowUp':
          this.placeOrder('BUY', 'CALL');
          break;
        case 'ArrowDown':
          this.placeOrder('BUY', 'PUT');
          break;
        case 'ArrowRight':
          this.placeOrder('SELL', 'PUT');
          break;
        case 'ArrowLeft':
          this.placeOrder('SELL', 'CALL');
          break;
      }
    },


    async placeOrder(transactionType, drvOptionType) {
      try {
        let selectedStrike;
        if (drvOptionType === 'CALL') {
          selectedStrike = this.selectedCallStrike;
        } else if (drvOptionType === 'PUT') {
          selectedStrike = this.selectedPutStrike;
        }

        if (!selectedStrike) {
          throw new Error(`Selected ${drvOptionType.toLowerCase()} strike is not defined`);
        }

        if (!selectedStrike.tradingSymbol || !selectedStrike.securityId) {
          throw new Error(`Selected ${drvOptionType.toLowerCase()} strike properties are not properly defined`);
        }

        let exchangeSegment;
        if (this.selectedExchange === 'NSE') {
          exchangeSegment = 'NSE_FNO';
        } else if (this.selectedExchange === 'BSE') {
          exchangeSegment = 'BSE_FNO';
        } else {
          throw new Error("Selected exchange is not valid");
        }

        const orderData = {
          dhanClientId: this.dhanClientId,
          transactionType: transactionType,
          exchangeSegment: exchangeSegment,
          productType: this.selectedProductType,
          orderType: this.selectedOrderType,
          validity: 'DAY',
          tradingSymbol: selectedStrike.tradingSymbol,
          securityId: selectedStrike.securityId,
          quantity: this.selectedQuantity,
          price: 10, // Example price
          drvExpiryDate: this.selectedExpiry,
          drvOptionType: drvOptionType
        };

        console.log("Placing order with data:", orderData);
        const response = await axios.post('http://localhost:3000/placeOrder', orderData);
        console.log("Order placed successfully:", response.data);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          const firstThreeWords = error.response.data.message.split(' ').slice(0, 3).join(' ');
          this.toastMessage = firstThreeWords;
        } else {
          this.toastMessage = 'Failed to place order';
        }
        this.showToast = true;
      }
    },
  },

};
</script>
