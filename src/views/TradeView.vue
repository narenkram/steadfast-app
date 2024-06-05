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
            <span class="badge bg-success">Active</span>
          </p>
        </div>
        <div class="col-3">
          <p class="mb-0"><b>Total Funds</b></p>
          <p>₹ {{ fundLimits?.availabelBalance || 0 }}</p>
        </div>
        <div class="col-3">
          <p class="mb-0"><b>Utilized Margin</b></p>
          <p>₹ {{ fundLimits?.utilizedAmount || 0 }}</p>
        </div>
        <div class="col-2">
          <div class="d-flex align-items-center float-end">
            <label class="ToggleSwitch">
              <input class="ToggleInput" type="checkbox" id="AutoKill" name="AutoKill" checked>
              <span class="ToggleSlider SliderRound"></span>
            </label>
            <span class="ToggleLabel"><b>Auto Kill</b></span>
          </div>
        </div>
      </div>

    </div>
  </section>
  <section class="row py-3">
    <div class="col-lg-5">
      <div class="Card">
        <blockquote class="fs-3">₹ 653.25</blockquote>
        <small>
          ₹ 606.25 Net PNL Estimated (after all charges)
        </small>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="Card">
        <blockquote class="fs-3">1.25% <small> on Total Capital</small></blockquote>
        <small>10.5% on Deployed Capital</small>
      </div>
    </div>
    <div class="col-lg-2 d-flex justify-content-center align-items-center">
      <div class="Card">
        <button class="btn btn-primary shadow fs-3" @click="toggleKillSwitch">
          Toggle Kill Switch
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
          <select id="Exchange" class="form-select" v-model="selectedExchange" @change="updateInstruments"
            aria-label="Exchange">
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
        </div>

        <!-- Master Symbol Selection -->
        <div class="col-2">
          <label for="MasterSymbol" class="form-label mb-0">Master Symbol</label>
          <select class="form-select" v-model="masterSymbol" aria-label="Master Symbol" id="MasterSymbol">
            <option v-for="symbol in symbols" :key="symbol" :value="symbol">
              {{ symbol }}
            </option>
          </select>
        </div>

        <!-- Expiry Date Selection -->
        <div class="col-2">
          <label for="Expiry" class="form-label mb-0">Expiry</label>
          <select id="Expiry" class="form-select" v-model="selectedExpiry" aria-label="Expiry">
            <option v-for="date in expiryDates" :key="date" :value="date">
              {{ date }}
            </option>
          </select>
        </div>

        <!-- Product Type Selection -->
        <div class="col-2">
          <label for="ProductType" class="form-label mb-0">Product Type</label>
          <select id="ProductType" class="form-select" v-model="selectedProductType" aria-label="ProductType">
            <option value="INTRADAY">Intraday</option>
            <option value="MARGIN">Margin</option>
          </select>
        </div>

        <!-- Quantity Selection -->
        <div class="col-2">
          <label for="Quantity" class="form-label mb-0">Quantity</label>
          <select id="Quantity" class="form-select" v-model="selectedQuantity" aria-label="Quantity">
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
        </div>

        <!-- Order Type -->
        <div class="col-2">
          <label for="OrderType" class="form-label mb-0">Order Type</label>
          <select id="OrderType" class="form-select" aria-label="OrderType" v-model="selectedOrderType">
            <option value="Market">Market</option>
            <option value="Limit">Limit</option>
          </select>
        </div>
      </div>

      <div class="row mt-2 align-items-center justify-content-between">
        <!-- Call Strike Selection -->
        <div class="col-3">
          <label for="CallStrike" class="form-label mb-0">Call Strike</label>
          <select id="CallStrike" class="form-select" v-model="selectedCallStrike" aria-label="Call Strike">
            <option v-for="strike in strikes" :key="strike" :value="strike">
              {{ strike }}
            </option>
          </select>
          <button class="btn btn-lg btn-outline-success fs-5 w-100 my-2" @click="placeOrder('BUY', 'CALL')">Buy
            CE</button>
          <button class="btn btn-lg btn-outline-danger fs-5 w-100" @click="placeOrder('SELL', 'CALL')">Sell CE</button>
        </div>

        <div class="col-3 text-center">
          <br />
          <p class="mb-0">Nifty Bank</p>
          <p class="mb-0"><b>51700 <span class="text-success">(152/0.8%)</span></b></p>
          <button class="btn btn-lg btn-outline-secondary fs-5 w-100 my-2">Close Position</button>
          <button class="btn btn-lg btn-outline-secondary fs-5 w-100">Cancel Order</button>
        </div>

        <!-- Put Strike Selection -->
        <div class="col-3">
          <label for="PutStrike" class="form-label mb-0">Put Strike</label>
          <select id="PutStrike" class="form-select" v-model="selectedPutStrike" aria-label="Put Strike">
            <option v-for="strike in strikes" :key="strike" :value="strike">
              {{ strike }}
            </option>
          </select>
          <button class="btn btn-lg btn-outline-success fs-5 w-100 my-2" @click="placeOrder('BUY', 'PUT')">Buy
            PE</button>
          <button class="btn btn-lg btn-outline-danger fs-5 w-100" @click="placeOrder('SELL', 'PUT')">Sell PE</button>
        </div>
      </div>
    </form>
  </section>

  <section class="row py-3">
    <div class="col-12">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="positions-tab" data-bs-toggle="tab" data-bs-target="#positions-tab-pane"
            type="button" role="tab" aria-controls="positions-tab-pane" aria-selected="true">Positions</button>
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
              <p class="mb-0"><b>Net Qty: </b>0</p>
            </div>
            <div class="col-6 text-center py-2">
              <p class="mb-0"><b>Total Buy Value: </b>10,000</p>
              <p class="mb-0"><b>Total Sell Value: </b>10,653</p>
            </div>
          </div>
          <table class="table table-hover">
            <thead>
              <tr>
                <th scope="col">
                  <input type="checkbox" id="selectAllPositions" class="form-check-input" />
                </th>
                <th scope="col">Symbol Name</th>
                <th scope="col">Trade Side</th>
                <th scope="col">Product Type</th>
                <th scope="col">Qty</th>
                <th scope="col">Executed Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td scope="row">
                  <input type="checkbox" id="selectPosition" class="form-check-input" />
                </td>
                <td>BANKNIFTY 51700</td>
                <td>{{ currentTransactionType }}</td>
                <td>{{ selectedProductType }}</td>
                <td>15</td>
                <td>432</td>
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

</template>


<script>
import { GET_USER_TOKEN_GETTER } from '@/stores/storeconstants';
import { mapGetters } from 'vuex';
import axios from 'axios';
import ToastAlert from '../components/ToastAlert.vue';

export default {
  components: {
    ToastAlert
  },
  data() {
    return {
      fundLimits: {}, // Initialize as an empty object
      dhanClientId: null, // Initialize as null
      showToast: false, // Controls the visibility of the toast
      toastMessage: '', // Message displayed in the toast
      killSwitchActive: false, // Initial state of the kill switch
      orders: [], // Define orders as an empty array initially
      selectedExchange: 'NSE',
      symbols: [], // Initialize symbols as an empty array
      exchangeSegment: null, // Initialize exchangeSegment
      masterSymbol: null, // Initialize master instrument as null
      selectedExpiry: null, // Initialize selected expiry as null
      selectedCallStrike: null, // Initialize selected call strike as null
      selectedPutStrike: null, // Initialize selected put strike as null
      instruments: [], // Initialize instruments as an empty array
      expiryDates: [], // Initialize expiry dates as an empty array
      strikes: [], // Initialize strikes as an empty array
      selectedProductType: 'INTRADAY',
      selectedQuantity: 15, // Initialize selected quantity as null
      selectedOrderType: 'Market', // Initialize selected order type as null
      currentTransactionType: '', // This will store either 'BUY' or 'SELL'
      // New properties
      showDhanId: false, // Controls the visibility of the Dhan ID
      exchangeSymbols: {
        NSE: ['NIFTY', 'BANKNIFTY'],
        BSE: ['FINNIFTY', 'MIDCPNIFTY', 'SENSEX']
      }, // Predefined symbols for each exchange
    };
  },
  computed: {
    ...mapGetters('auth', {
      token: GET_USER_TOKEN_GETTER,
    }),
  },
  mounted() {
    this.symbols = this.exchangeSymbols[this.selectedExchange];
    this.masterSymbol = this.symbols[0] || null;
    this.fetchFundLimit();
    this.fetchDhanClientId();
    this.updateInstruments(); // Set initial exchangeSegment based on default selectedExchange
  },
  watch: {
    selectedExchange(newVal, oldVal) {
      this.symbols = this.exchangeSymbols[newVal] || [];
      this.masterSymbol = this.symbols[0] || null; // Automatically select the first symbol or null if none
    }
  },
  methods: {
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
    async fetchSymbols() {
      try {
        const response = await axios.get(`http://localhost:3000/symbols?selectedExchange=${this.selectedExchange}`);
        this.symbols = response.data; // Assuming the API returns an array of objects with tradingSymbol
        console.log('Sample of fetched symbols:', response.data.sort(() => 0.5 - Math.random()).slice(0, 2));
      } catch (error) {
        console.error('Failed to fetch symbols:', error);
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
    updateInstruments() {
      // Implement logic to update instruments based on selected exchange
      if (this.selectedExchange === 'NSE') {
        this.exchangeSegment = 'NSE_FNO';
      } else if (this.selectedExchange === 'BSE') {
        this.exchangeSegment = 'BSE_FNO';
      }
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


    async placeOrder(transactionType, drvOptionType) {
      console.log('Attempting to place order:', transactionType, drvOptionType); // Log the attempt to place an order
      this.currentTransactionType = transactionType; // Update the transaction type

      const orderData = {
        symbol: this.masterSymbol,
        quantity: this.selectedQuantity,
        orderType: this.selectedOrderType,
        productType: this.selectedProductType,
        price: 10,
        validity: 'DAY',
        transactionType: transactionType,
        drvOptionType: drvOptionType,
        exchangeSegment: this.exchangeSegment, // Ensure this is correctly referencing the data property
        drvExpiryDate: this.selectedExpiry,
      };

      console.log('Order Data:', orderData); // Log the order data to the console

      try {
        const response = await axios.post('http://localhost:3000/placeOrder', orderData);
        console.log('Order placed:', response.data); // Log the successful placement of the order
      } catch (error) {
        console.error('Error placing order:', error); // Log any errors encountered
      }
    },
  },

};
</script>
