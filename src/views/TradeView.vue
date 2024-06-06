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
        <div class="col-3">
          <p class="mb-0"><b>Utilized Margin</b></p>
          <p>₹ {{ fundLimits.utilizedAmount || 0 }}</p>
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
            <option v-for="symbol in masterSymbols" :key="symbol" :value="symbol">
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
            <option value="25">25</option>
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
            <option v-for="(strike, index) in callStrikes" :key="`${strike}-${index}`" :value="strike">
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
            <option v-for="(strike, index) in putStrikes" :key="`${strike}-${index}`" :value="strike">
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
                <th scope="col">Symbol Name</th>
                <th scope="col">Trade Side</th>
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
                <td>{{ currentTransactionType }}</td>
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
      masterSymbols: [], // Initialize masterSymbols as an empty array
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
      callStrikes: [],
      putStrikes: [],
      securityIds: {}, // Store security IDs associated with symbols
      positions: [] // Stores the positions fetched from the API

    };
  },
  computed: {
    ...mapGetters('auth', {
      token: GET_USER_TOKEN_GETTER,
    }),
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
    this.masterSymbols = this.exchangeSymbols[this.selectedExchange];
    this.masterSymbol = this.masterSymbols[0] || null;
    this.fetchFundLimit();
    this.fetchDhanClientId();
    this.updateInstruments(); // Set initial exchangeSegment based on default selectedExchange
    this.fetchSymbols();
    this.fetchPositions();
  },
  watch: {
    selectedExchange(newVal, oldVal) {
      this.masterSymbols = this.exchangeSymbols[newVal] || [];
      this.masterSymbol = this.masterSymbols[0] || null;
    },
    masterSymbol(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.fetchSymbols(); // Call fetchSymbols to update callStrikes and putStrikes based on the new masterSymbol
      }
    },
    selectedExpiry(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updateStrikes(); // Call updateStrikes to filter strikes based on the new selectedExpiry
      }
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
    async fetchSymbols() {
      try {
        const response = await axios.get(`http://localhost:3000/symbols`, {
          params: {
            selectedExchange: this.selectedExchange,
            masterSymbol: this.masterSymbol
          }
        });

        // Reset arrays
        this.callStrikes = [];
        this.putStrikes = [];
        this.expiryDates = [];

        // Month mapping
        const monthMapping = {
          '01': 'Jan',
          '02': 'Feb',
          '03': 'Mar',
          '04': 'Apr',
          '05': 'May',
          '06': 'Jun',
          '07': 'Jul',
          '08': 'Aug',
          '09': 'Sep',
          '10': 'Oct',
          '11': 'Nov',
          '12': 'Dec'
        };

        // Process each item in the response data
        response.data.forEach(item => {
          const { tradingSymbol, drvExpiryDate, securityId } = item;

          // Extract the month and year from the expiry date
          const expiryMonth = drvExpiryDate.slice(5, 7); // Extracts the month part
          const expiryYear = drvExpiryDate.slice(0, 4); // Extracts the year part
          const expiryMonthAbbr = monthMapping[expiryMonth]; // Get the month abbreviation

          // Check if the trading symbol starts with the selected masterSymbol followed by a dash
          if (tradingSymbol.startsWith(this.masterSymbol + '-')) {
            // Check if the trading symbol contains 'CE' or 'PE' and push to respective arrays
            if (tradingSymbol.includes('CE') && tradingSymbol.includes(`${expiryMonthAbbr}${expiryYear}`)) {
              this.callStrikes.push(tradingSymbol);
              this.securityIds[tradingSymbol] = securityId; // Store security ID
            } else if (tradingSymbol.includes('PE') && tradingSymbol.includes(`${expiryMonthAbbr}${expiryYear}`)) {
              this.putStrikes.push(tradingSymbol);
              this.securityIds[tradingSymbol] = securityId; // Store security ID
            }
            // Add expiry date if it's not already in the array to avoid duplicates
            if (!this.expiryDates.includes(drvExpiryDate)) {
              this.expiryDates.push(drvExpiryDate);
            }
          }
        });

        // Optionally sort expiryDates if needed
        this.expiryDates.sort(); // Sorts dates in ascending order if they are in a standard format
        // Set default selected values
        if (this.callStrikes.length > 0) {
          this.selectedCallStrike = this.callStrikes[0];
        }
        if (this.putStrikes.length > 0) {
          this.selectedPutStrike = this.putStrikes[0];
        }
        console.log('Filtered Call Strikes:', this.callStrikes);
        console.log('Filtered Put Strikes:', this.putStrikes);
        console.log('Expiry Dates:', this.expiryDates);
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
      this.masterSymbols = this.exchangeSymbols[this.selectedExchange];
      this.masterSymbol = this.masterSymbols[0] || null; // Automatically select the first symbol or null if none
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
        symbol: this.selectedCallStrike,
        quantity: this.selectedQuantity,
        orderType: this.selectedOrderType,
        productType: this.selectedProductType,
        price: 10,
        validity: 'DAY',
        transactionType: transactionType,
        drvOptionType: drvOptionType,
        exchangeSegment: this.exchangeSegment, // Ensure this is correctly referencing the data property
        drvExpiryDate: this.selectedExpiry,
        securityId: this.securityIds[this.selectedCallStrike] // Include securityId here
      };

      console.log('Order Data:', orderData); // Log the order data to the console

      try {
        const response = await axios.post('http://localhost:3000/placeOrder', orderData);
        console.log('Order placed:', response.data); // Log the successful placement of the order
      } catch (error) {
        console.error('Error placing order:', error); // Log any errors encountered
      }
    },
    updateStrikes() {
      const selectedExpiryMonth = this.selectedExpiry.slice(5, 7); // Extracts the month part
      const selectedExpiryYear = this.selectedExpiry.slice(0, 4); // Extracts the year part
      const monthMapping = {
        '01': 'Jan',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Apr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Aug',
        '09': 'Sep',
        '10': 'Oct',
        '11': 'Nov',
        '12': 'Dec'
      };
      const selectedExpiryMonthAbbr = monthMapping[selectedExpiryMonth]; // Get the month abbreviation

      this.callStrikes = this.callStrikes.filter(strike => strike.includes(`${selectedExpiryMonthAbbr}${selectedExpiryYear}`));
      this.putStrikes = this.putStrikes.filter(strike => strike.includes(`${selectedExpiryMonthAbbr}${selectedExpiryYear}`));
    }
  },

};
</script>
