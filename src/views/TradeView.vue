<template>
  <!-- Brokers, Broker Status, Total Funds, Utilized Margin & Today's Date -->
  <section class="row pb-3">
    <!-- Change Broker -->
    <div class="col-6 col-md-4 col-lg-2">
      <label for="ChangeBroker" class="form-label mb-1"><b>Change Broker</b></label>
      <div class="d-flex align-items-center">
        <select class="form-select" id="ChangeBroker" aria-label="Change Broker" v-model="selectedBrokerName"
          @change="updateSelectedBroker">
          <option value="" disabled selected>Select a broker</option>
          <option v-for="brokerName in availableBrokers" :key="brokerName" :value="brokerName">
            {{ brokerName }}
          </option>
        </select>
      </div>
    </div>

    <!-- Broker Name and Status with Broker ID -->
    <div class="col-6 col-md-4 col-lg-3 text-center">
      <p class="mb-1">
        <b>Status: </b>
        <span :class="{
          'badge bg-success': brokerStatus === 'Connected',
          'badge bg-danger': brokerStatus === 'Not Connected',
          'badge bg-warning text-dark': brokerStatus === 'Token Expired'
        }">
          {{ brokerStatus }}
        </span>
      </p>
      <p class="mb-0 d-flex align-items-center justify-content-center">
        <RouterLink class="fs-4 text-decoration-none me-2" to="/manage-brokers">
          <span>⚙️</span>
        </RouterLink>
        <span v-if="showBrokerClientId" @click="toggleBrokerClientIdVisibility">
          {{ selectedBroker?.clientId || 'N/A' }}
          <span>👀</span>
        </span>
        <span v-else @click="toggleBrokerClientIdVisibility">
          {{ maskBrokerClientId(selectedBroker?.clientId) }}
          <span>👁️</span>
        </span>
      </p>
    </div>

    <!-- Available Funds -->
    <div class="col-6 col-md-4 col-lg-3 text-center">
      <p class="mb-1"><b>Available Funds</b></p>
      <p class="mt-2 mb-0">
        ₹ {{ availableBalance !== null ? availableBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 }) :
          'N/A' }}
      </p>
    </div>

    <!-- Utilized Margin -->
    <div class="col-6 col-md-6 col-lg-2 text-center">
      <p class="mb-1"><b>Utilized Margin</b></p>
      <p class="mt-2 mb-0">₹ {{ usedAmount || null }}</p>
    </div>

    <!-- Today's Expiry -->
    <div class="col-6 col-md-6 col-lg-2 text-end">
      <p class="mb-1"><b>Today's Expiry</b></p>
      <p v-if="isExpiryToday" class="text-danger">
        <b>{{ selectedMasterSymbol }}</b>
      </p>
      <p v-else class="text-danger">
        <b>-</b>
      </p>
    </div>

  </section>

  <!-- <section class="row py-3">
    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="toggleLineChart" v-model="showLineChart">
        <label class="form-check-label" for="toggleLineChart">
          Show MTM Chart
        </label>
      </div>
      <LineChart v-if="showLineChart" :profitData="profitData" />
    </div>
  </section> -->

  <!-- Total Profit & Net PNL -->
  <section class="row py-3">
    <div class="col-6 col-md-4 col-lg-5">
      <div class="Card">
        <blockquote class="fs-3" :class="totalProfit > 0 ? 'text-success' : totalProfit < 0 ? 'text-danger' : null">
          ₹ {{ totalProfit.toFixed(2) }}
        </blockquote>
        <small>
          <span :class="netPnl > 0 ? 'text-success' : netPnl < 0 ? 'text-danger' : null">
            ₹ {{ netPnl.toFixed(2) }}
          </span>
          Estimated (after all charges)
        </small>
      </div>
    </div>
    <div class="col-6 col-md-4 col-lg-4">
      <div class="Card">
        <blockquote class="fs-3 text-center m-0">
          <span
            :class="totalCapitalPercentage > 0 ? 'text-success' : totalCapitalPercentage < 0 ? 'text-danger' : null">
            {{ totalCapitalPercentage.toFixed(2) }}%
          </span>
          <br />
          <small> on Total Capital</small>
        </blockquote>
        <small v-if="totalNetQty !== 0">{{ deployedCapitalPercentage.toFixed(2) }}% on Deployed Capital</small>
      </div>
    </div>
    <div class="col-12 col-md-4 col-lg-3 d-flex justify-content-center align-items-center">
      <div class="Card">
        <div class="card-title">
          <h5>Kill Switch</h5>
        </div>
        <button :class="killSwitchButtonClass" @click="handleKillSwitchClick"
          :data-bs-target="killSwitchActive ? '' : '#KillSwitchActivationConfirmationModal'"
          :data-bs-toggle="killSwitchActive ? '' : 'modal'">
          {{ killSwitchButtonText }} <span v-if="killSwitchActive">{{ currentClockEmoji }}</span>
        </button>
      </div>
    </div>
  </section>

  <section v-if="killSwitchActive" class="row py-1">
    <div class="col-12">
      <div class="bg-danger text-white p-3 rounded-3 shadow">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h5 class="mb-2">Kill Switch Activated</h5>
            <p class="mb-0">
              Trading has been blocked for the next 6 hours. Take a break to put your mind at ease.
            </p>
          </div>
          <div class="text-center">
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-4 fw-bold">
              {{ killSwitchRemainingTime }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <hr />

  <!-- Place Order Form -->
  <section class="row py-2">
    <form @submit.prevent>
      <fieldset :disabled="isFormDisabled" :class="{ 'disabled-form': isFormDisabled }">
        <div class="row">
          <!-- Exchange Selection -->
          <div class="col-6 col-md-4 col-lg-2">
            <label for="Exchange" class="form-label mb-0">Exchange</label>
            <select id="Exchange" class="form-select" aria-label="Exchange" v-model="selectedExchange"
              @change="fetchTradingData" :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="exchange in exchangeOptions" :key="exchange" :value="exchange">
                {{ exchange }}
              </option>
            </select>
          </div>

          <!-- Segment Selection -->
          <div class="col-6 col-md-4 col-lg-2">
            <label for="Segment" class="form-label mb-0">Segment</label>
            <select id="Segment" class="form-select" aria-label="Segment" :class="{ 'disabled-form': isFormDisabled }"
              disabled>
              <option value="Options" selected>Options</option>
              <!-- <option value="Futures">Futures</option> -->
            </select>
          </div>

          <!-- Master Symbol Selection -->
          <div class="col-6 col-md-4 col-lg-2">
            <label for="MasterSymbol" class="form-label mb-0">Master Symbol</label>
            <select id="MasterSymbol" class="form-select" aria-label="Master Symbol" v-model="selectedMasterSymbol"
              @change="fetchTradingData" :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="symbol in exchangeSymbols[selectedExchange]" :key="symbol" :value="symbol">{{
                symbol }}
              </option>
            </select>
          </div>

          <!-- Expiry Date Selection -->
          <div class="col-6 col-md-4 col-lg-2">
            <label for="Expiry" class="form-label mb-0">Expiry Date</label>
            <select id="Expiry" class="form-select" aria-label="Expiry" v-model="selectedExpiry"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="date in expiryDates" :key="date" :value="date">
                {{ formatDate(date) }}
              </option>
            </select>
          </div>

          <!-- Product Type Selection -->
          <div class="col-6 col-md-4 col-lg-2">
            <label for="ProductType" class="form-label mb-0">Product Type</label>
            <select id="ProductType" class="form-select" v-model="selectedProductType" aria-label="ProductType"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="productType in productTypes" :key="productType" :value="getProductTypeValue(productType)">
                {{ productType }}
              </option>
            </select>
          </div>

          <!-- Quantity Selection -->
          <div class="col-6 col-md-4 col-lg-2">
            <label for="Quantity" class="form-label mb-0">
              {{ selectedLots }} Lot{{ selectedLots !== 1 ? 's' : '' }} / Quantity
            </label>
            <div class="input-group">
              <input type="number" id="Quantity" class="form-control" v-model.number="selectedLots" :min="1"
                :max="maxLots" @input="updateSelectedQuantity" :class="{ 'disabled-form': isFormDisabled }">
              <span class="input-group-text">{{ selectedQuantity }}</span>
            </div>
          </div>
        </div>

        <div class="row mt-3">
          <!-- Order Type -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="OrderType" class="form-label mb-0">Order Type</label>
            <div class="input-group">
              <select id="OrderType" class="form-select w-50" aria-label="OrderType" v-model="selectedOrderType"
                :class="{ 'disabled-form': isFormDisabled }">
                <option v-for="orderType in orderTypes" :key="orderType" :value="orderType">{{ orderType }}
                </option>
              </select>
              <span class="input-group-text p-0 w-50" v-if="selectedOrderType === 'LMT'">
                <input type="number" id="DirectLimitPrice" class="form-control" v-model="limitPrice"
                  placeholder="Price">
              </span>
            </div>
          </div>
          <!-- Market Protection Order %-->
          <!-- <div class="col-3">
            <label for="MarketProtection" class="form-label mb-0">Market Protection Order %</label>
            <select id="MarketProtection" class="form-select" aria-label="Market Protection Order %"
              :class="{ 'disabled-form': isFormDisabled }">
              <option value="1">1%</option>
              <option value="2">2%</option>
              <option value="3">3%</option>
              <option value="4">4%</option>
              <option value="5">5%</option>
            </select>
          </div> -->
          <!-- Stoploss -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="enableStoploss" class="form-label mb-0">Stoploss</label>
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" id="enableStoploss"
                  v-model="tradeSettings.enableStoploss" aria-label="Enable Stoploss"
                  :class="{ 'disabled-form': isFormDisabled }">
              </div>
              <input type="number" class="form-control" id="stoplossValue" v-model.number="tradeSettings.stoplossValue"
                aria-label="Stoploss (points)" :class="{ 'disabled-form': isFormDisabled }">
              <span class="input-group-text">₹ Points</span>
            </div>
          </div>
          <!-- Target -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="enableTarget" class="form-label mb-0">Target</label>
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" id="enableTarget"
                  v-model="tradeSettings.enableTarget" aria-label="Enable Target"
                  :class="{ 'disabled-form': isFormDisabled }">
              </div>
              <input type="number" class="form-control" id="targetValue" v-model.number="tradeSettings.targetValue"
                aria-label="Target (points)" :class="{ 'disabled-form': isFormDisabled }">
              <span class="input-group-text">₹ Points</span>
            </div>
          </div>
          <!-- 1 Click Keys -->
          <div class="col-6 col-md-3 col-lg-3">
            <div class="d-flex align-items-center float-end h-100">
              <label class="ToggleSwitch">
                <input class="ToggleInput" type="checkbox" id="enableHotKeys" v-model="enableHotKeys"
                  :class="{ 'disabled-form': isFormDisabled }">
                <span class="ToggleSlider SliderRound" :class="{ 'disabled-form': isFormDisabled }"></span>
              </label>
              <label class="ToggleLabel" for="enableHotKeys" :class="{ 'disabled-form': isFormDisabled }"><b> 1 Click
                  <br /> Keys ⌨️</b></label>
            </div>
          </div>
        </div>

        <!-- Trading Symbols & Strikes -->
        <div class="row align-items-center justify-content-between">
          <!-- Call Strike Selection -->
          <div class="col-12 col-md-4 col-lg-3">
            <label for="CallStrike" class="form-label mb-0 d-flex flex-row justify-content-between">
              <span>Call Strike</span>
              <span class="me-4">LTP</span>
            </label>
            <div class="input-group">
              <select id="CallStrike" class="form-select" aria-label="Call Strike" v-model="selectedCallStrike"
                :class="{ 'disabled-form': isFormDisabled }">
                <option v-for="strike in callStrikes" :key="strike.securityId" :value="strike">
                  {{ strike.strikePrice }}
                </option>
              </select>
              <span class="input-group-text">{{ latestCallLTP }}</span>
            </div>
            <!-- DO NOT REMOVE, USEFUL FOR DEBUGGING -->
            <!-- <div>
              Security ID: {{ defaultCallSecurityId }}
            </div> -->
            <div class="mt-2">
              {{ selectedCallStrike.tradingSymbol }}
            </div>
          </div>

          <!-- Live Underlying Price -->
          <div class="col-12 col-md-4 col-lg-6 text-center">
            <p class="mb-0" v-if="selectedMasterSymbol === 'NIFTY'">Nifty 50: <b>{{ niftyPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'BANKNIFTY'">Bank Nifty: <b>{{ bankNiftyPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'FINNIFTY'">Fin Nifty: <b>{{ finniftyPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'MIDCPNIFTY'">Nifty Mid Select: <b>{{ midcpniftyPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'SENSEX'">Sensex: <b>{{ sensexPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'BANKEX'">Bankex: <b>{{ bankexPrice }}</b></p>
          </div>

          <!-- Put Strike Selection -->
          <div class="col-12 col-md-4 col-lg-3">
            <label for="PutStrike" class="form-label mb-0 d-flex flex-row justify-content-between">
              <span class="ms-4">LTP</span>
              <span>Put Strike</span>
            </label>
            <div class="input-group">
              <span class="input-group-text">{{ latestPutLTP }}</span>
              <select id="PutStrike" class="form-select" aria-label="Put Strike" v-model="selectedPutStrike"
                :class="{ 'disabled-form': isFormDisabled }">
                <option v-for="strike in putStrikes" :key="strike.securityId" :value="strike">
                  {{ strike.strikePrice }}
                </option>
              </select>
            </div>
            <!-- DO NOT REMOVE, USEFUL FOR DEBUGGING -->
            <!-- <div>
              Security ID: {{ defaultPutSecurityId }}
            </div> -->
            <div class="mt-2">
              {{ selectedPutStrike.tradingSymbol }}
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Call Strike Buy/Sell Buttons -->
          <div class="col-12 col-md-4 col-lg-3">
            <div class="btn-group w-100">
              <button type="button" class="btn btn-md btn-success fs-5 my-2 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('BUY'), 'CALL')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">⬆️</span>
                Buy CE
              </button>
              <button type="button"
                class="btn btn-md btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent" data-bs-offset="0,-7">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('BUY', 'CALL')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
                <li>
                  <a class="dropdown-item" href="#">Add to Basket</a>
                </li>
              </ul>
            </div>
            <div class="btn-group w-100">
              <button type="button" class="btn btn-md btn-danger fs-5 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('SELL'), 'CALL')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">⬅️</span>
                Sell CE
              </button>
              <button type="button"
                class="btn btn-md btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('SELL', 'CALL')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
                <li>
                  <a class="dropdown-item" href="#">Add to Basket</a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Close & Cancel Buttons -->
          <div class="col-12 col-md-4 col-lg-6 text-center">
            <button v-if="selectedShoonyaPositionsSet.size === 0 && selectedFlattradePositionsSet.size === 0"
              class="btn btn-md btn-outline fs-5 w-75 my-2" @click="closeAllPositions">
              <span v-if="enableHotKeys">F6 / </span>
              Close All
            </button>
            <button v-if="selectedShoonyaPositionsSet.size > 0 || selectedFlattradePositionsSet.size > 0"
              class="btn btn-md btn-outline fs-5 w-75 my-2" @click="closeSelectedPositions">
              <span v-if="enableHotKeys">F6 / </span>
              Close Selected
            </button>
            <button class="btn btn-md btn-outline fs-5 w-75" @click="cancelPendingOrders">
              <span v-if="enableHotKeys">F7 / </span>
              Cancel Orders
            </button>
          </div>

          <!-- Put Strike Buy/Sell Buttons -->
          <div class="col-12 col-md-4 col-lg-3">
            <div class="btn-group w-100">
              <button type="button" class="btn btn-md btn-success fs-5 my-2 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('BUY'), 'PUT')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">⬇️</span>
                Buy PE
              </button>
              <button type="button"
                class="btn btn-md btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent" data-bs-offset="0,-7">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('BUY', 'PUT')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
                <li>
                  <a class="dropdown-item" href="#">Add to Basket</a>
                </li>
              </ul>
            </div>
            <div class="btn-group w-100">
              <button type="button" class="btn btn-md btn-danger fs-5 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('SELL'), 'PUT')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">➡️</span>
                Sell PE
              </button>
              <button type="button"
                class="btn btn-md btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('SELL', 'PUT')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
                <li>
                  <a class="dropdown-item" href="#">Add to Basket</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  </section>

  <!-- Positions & Trades -->
  <section class="row py-3">
    <div class="col-12">
      <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="positions-tab" data-bs-toggle="tab" data-bs-target="#positions-tab-pane"
            type="button" role="tab" aria-controls="positions-tab-pane" aria-selected="true"
            @click="setActiveTab('positions')">
            💸 Positions
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="trades-tab" data-bs-toggle="tab" data-bs-target="#trades-tab-pane" type="button"
            role="tab" aria-controls="trades-tab-pane" aria-selected="false" @click="setActiveTab('trades')">
            📄 Trades
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="automation-tab" data-bs-toggle="tab" data-bs-target="#automation-tab-pane"
            type="button" role="tab" aria-controls="automation-tab-pane" aria-selected="false">
            🤖 Discipline Automations
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="basket-tab" data-bs-toggle="tab" data-bs-target="#basket-tab-pane" type="button"
            role="tab" aria-controls="basket-tab-pane" aria-selected="false">
            🧺 Basket Orders
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings-tab-pane"
            type="button" role="tab" aria-controls="settings-tab-pane" aria-selected="false">
            ⚙️ Settings
          </button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="positions-tab-pane" role="tabpanel" aria-labelledby="positions-tab"
          tabindex="0">
          <div class="row align-items-center">
            <div class="col-4 text-center py-2">
              <p class="mb-0">
                <b>Net Qty:
                  <span :class="totalNetQty > 0 ? 'text-success' : totalNetQty < 0 ? 'text-danger' : null">
                    {{ totalNetQty }}
                  </span>
                </b>
              </p>
            </div>
            <div class="col-8 text-center py-2">
              <p class="mb-0">
                <span>Total Buy Value: <b>₹ {{ totalBuyValue.toFixed(2) }}</b></span>
                <span class="ms-3">Total Sell Value: <b>₹ {{ totalSellValue.toFixed(2) }}</b></span>
              </p>
              <p class="mb-0">
              </p>
            </div>
          </div>
          <!-- Flattrade Positions -->
          <div class="table-responsive" v-if="activeFetchFunction === 'fetchFlattradePositions'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Symbol Details</th>
                  <th scope="col">Net Avg</th>
                  <th scope="col">LTP</th>
                  <th scope="col" class="text-center">Stoploss</th>
                  <th scope="col" class="text-center">Target</th>
                  <th scope="col">Buy Value</th>
                  <th scope="col">Sell Value</th>
                  <th scope="col">Realized</th>
                  <th scope="col">Unrealized</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="flatTradePositionBook.length">
                  <tr v-for="flattradePosition in sortedPositions" :key="flattradePosition.tsym">
                    <td>
                      <label class="d-flex flex-column align-items-start">
                        <input type="checkbox" :id="'flattradePosition-' + flattradePosition.tsym"
                          v-model="selectedFlattradePositionsSet" :value="flattradePosition.tsym"
                          :disabled="flattradePosition.netqty == 0" />

                        <div class="d-flex ">
                          {{ flattradePosition.tsym }}
                        </div>

                        <div class="d-flex flex-row">
                          <span
                            :class="flattradePosition.netqty > 0 ? 'text-success' : flattradePosition.netqty < 0 ? 'text-danger' : null">
                            Qty: {{ flattradePosition.netqty }}
                          </span>
                          <span class="ms-2">
                            Side:
                            <b>{{ flattradePosition.netqty > 0 ? 'B' : flattradePosition.netqty < 0 ? 'S' : '-' }}</b>
                          </span>
                          <span class="ms-2">
                            Type: {{ flattradePosition.prd }}
                          </span>
                        </div>
                      </label>
                    </td>
                    <td>{{ flattradePosition.netavgprc }}</td>
                    <td>{{ positionLTPs[flattradePosition.tsym] || '-' }}</td>
                    <td>
                      <template v-if="Number(flattradePosition.netqty) !== 0 && tradeSettings.enableStoploss === true">
                        <div class="d-flex align-items-center">
                          <div class="ms-2 d-flex flex-row justify-content-center align-items-center">
                            <span class="btn-step btn-step-danger me-2"
                              @click="adjustStoplossPrice(flattradePosition.tsym, tradeSettings.stoplossStep)">-</span>
                            <b>{{ formatPrice(positionStoplossesPrice[getSymbol(flattradePosition)]) }}</b>
                            <span class="btn-step btn-step-success ms-2"
                              @click="adjustStoplossPrice(flattradePosition.tsym, -tradeSettings.stoplossStep)">+</span>
                          </div>
                        </div>
                        <div class="text-center mt-2">
                          <span class="text-secondary">
                            ( {{ formatPrice(positionStoplosses[getSymbol(flattradePosition)]) }} pts)
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        -
                      </template>
                    </td>
                    <td>
                      <template v-if="Number(flattradePosition.netqty) !== 0 && tradeSettings.enableTarget === true">
                        <div class="d-flex align-items-center">
                          <div class="ms-2 d-flex flex-row justify-content-center align-items-center">
                            <span class="btn-step btn-step-danger me-2"
                              @click="adjustTargetPrice(flattradePosition.tsym, -tradeSettings.targetStep)">-</span>
                            <b>{{ formatPrice(positionTargetsPrice[getSymbol(flattradePosition)]) }}</b>
                            <span class="btn-step btn-step-success ms-2"
                              @click="adjustTargetPrice(flattradePosition.tsym, tradeSettings.targetStep)">+</span>
                          </div>
                        </div>
                        <div class="text-center mt-2">
                          <span class="text-secondary">
                            ( {{ formatPrice(positionTargets[getSymbol(flattradePosition)]) }} pts)
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        -
                      </template>
                    </td>
                    <td>{{ flattradePosition.daybuyamt }}</td>
                    <td>{{ flattradePosition.daysellamt }}</td>
                    <td
                      :class="flattradePosition.rpnl > 0 ? 'text-success' : flattradePosition.rpnl < 0 ? 'text-danger' : null">
                      {{ flattradePosition.rpnl }}
                    </td>
                    <td
                      :class="flattradePosition.calculatedUrmtom > 0 ? 'text-success' : flattradePosition.calculatedUrmtom < 0 ? 'text-danger' : null">
                      {{ flattradePosition.calculatedUrmtom.toFixed(2) }}
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="10" class="text-center">No positions on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Shoonya Positions -->
          <div class="table-responsive" v-if="activeFetchFunction === 'fetchShoonyaPositions'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Symbol Details</th>
                  <th scope="col">Net Avg</th>
                  <th scope="col">LTP</th>
                  <th scope="col" class="text-center">Stoploss</th>
                  <th scope="col" class="text-center">Target</th>
                  <th scope="col">Buy Value</th>
                  <th scope="col">Sell Value</th>
                  <th scope="col">Realized</th>
                  <th scope="col">Unrealized</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="shoonyaPositionBook.length">
                  <tr v-for="shoonyaPosition in sortedPositions" :key="shoonyaPosition.tsym">
                    <td>
                      <label class="d-flex flex-column align-items-start">
                        <input type="checkbox" :id="'shoonyaPosition-' + shoonyaPosition.tsym"
                          v-model="selectedShoonyaPositionsSet" :value="shoonyaPosition.tsym"
                          :disabled="shoonyaPosition.netqty == 0" />
                        <div class="d-flex ">
                          {{ shoonyaPosition.tsym }}
                        </div>
                        <div class="d-flex flex-row">
                          <span
                            :class="shoonyaPosition.netqty > 0 ? 'text-success' : shoonyaPosition.netqty < 0 ? 'text-danger' : null">
                            Qty: {{ shoonyaPosition.netqty }}
                          </span>
                          <span class="ms-2">
                            Side:
                            <b>{{ shoonyaPosition.netqty > 0 ? 'B' : shoonyaPosition.netqty < 0 ? 'S' : '-' }}</b>
                          </span>
                          <span class="ms-2">
                            Type: {{ shoonyaPosition.prd }}
                          </span>
                        </div>
                      </label>
                    </td>
                    <td>{{ shoonyaPosition.netavgprc }}</td>
                    <td>{{ positionLTPs[shoonyaPosition.tsym] || '-' }}</td>
                    <td>
                      <template v-if="Number(shoonyaPosition.netqty) !== 0 && tradeSettings.enableStoploss === true">
                        <div class="d-flex align-items-center">
                          <div class="ms-2 d-flex flex-row justify-content-center align-items-center">
                            <span class="btn-step btn-step-danger me-2"
                              @click="adjustStoplossPrice(shoonyaPosition.tsym, tradeSettings.stoplossStep)">-</span>
                            <b>{{ formatPrice(positionStoplossesPrice[getSymbol(shoonyaPosition)]) }}</b>
                            <span class="btn-step btn-step-success ms-2"
                              @click="adjustStoplossPrice(shoonyaPosition.tsym, -tradeSettings.stoplossStep)">+</span>
                          </div>
                        </div>
                        <div class="text-center mt-2">
                          <span class="text-secondary">
                            ( {{ formatPrice(positionStoplosses[getSymbol(shoonyaPosition)]) }} pts)
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        -
                      </template>
                    </td>
                    <td>
                      <template v-if="Number(shoonyaPosition.netqty) !== 0 && tradeSettings.enableTarget === true">
                        <div class="d-flex align-items-center">
                          <div class="ms-2 d-flex flex-row justify-content-center align-items-center">
                            <span class="btn-step btn-step-danger me-2"
                              @click="adjustTargetPrice(shoonyaPosition.tsym, -tradeSettings.targetStep)">-</span>
                            <b>{{ formatPrice(positionTargetsPrice[getSymbol(shoonyaPosition)]) }}</b>
                            <span class="btn-step btn-step-success ms-2"
                              @click="adjustTargetPrice(shoonyaPosition.tsym, tradeSettings.targetStep)">+</span>
                          </div>
                        </div>
                        <div class="text-center mt-2">
                          <span class="text-secondary">
                            ( {{ formatPrice(positionTargets[getSymbol(shoonyaPosition)]) }} pts)
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        -
                      </template>
                    </td>
                    <td>{{ shoonyaPosition.daybuyamt }}</td>
                    <td>{{ shoonyaPosition.daysellamt }}</td>
                    <td
                      :class="shoonyaPosition.rpnl > 0 ? 'text-success' : shoonyaPosition.rpnl < 0 ? 'text-danger' : null">
                      {{ shoonyaPosition.rpnl }}
                    </td>
                    <td
                      :class="shoonyaPosition.calculatedUrmtom > 0 ? 'text-success' : shoonyaPosition.calculatedUrmtom < 0 ? 'text-danger' : null">
                      {{ shoonyaPosition.calculatedUrmtom.toFixed(2) }}
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="10" class="text-center">No positions on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-secondary">
            Stoploss and Target set in this app won't reflect on your broker's own Stoploss and Target. However, they
            will close
            positions when triggered, as long as this app is open and connected to the internet.
          </p>
        </div>
        <div class="tab-pane fade" id="trades-tab-pane" role="tabpanel" aria-labelledby="trades-tab" tabindex="0">
          <!-- Flattrade Trades -->
          <div class="table-responsive" v-if="activeFetchFunction === 'fetchFlattradeOrdersTradesBook'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Side</th>
                  <th scope="col">Details</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Price</th>
                  <th scope="col">Time</th>
                  <th scope="col">Status & Reason</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="combinedOrdersAndTrades.length">
                  <template v-for="item in combinedOrdersAndTrades" :key="item.norenordno">
                    <tr v-if="item.order.status !== 'COMPLETE'">
                      <td>Order</td>
                      <td>{{ item.order.trantype }}</td>
                      <td>
                        {{ item.order.norenordno }}
                        <br />
                        {{ item.order.tsym }}
                      </td>
                      <td>{{ item.order.qty }}</td>
                      <td>{{ item.order.prc }}</td>
                      <td>{{ formatTime(item.order.norentm) }}</td>
                      <td :class="{
                        'text-danger': item.order.status === 'REJECTED',
                        'text-warning': item.order.status === 'PENDING' || item.order.status === 'OPEN'
                      }">
                        {{ item.order.status }}
                        {{ item.order.rejreason }}
                      </td>
                    </tr>
                    <tr v-if="item.trade" class="nested-trade-row">
                      <td>Trade</td>
                      <td>{{ item.trade.trantype }}</td>
                      <td>
                        {{ item.trade.norenordno }}
                        <br />
                        {{ item.trade.tsym }}
                      </td>
                      <td>{{ item.trade.qty }}</td>
                      <td>{{ item.trade.flprc }}</td>
                      <td>{{ formatTime(item.trade.norentm) }}</td>
                      <td class="text-success">{{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}</td>
                    </tr>
                  </template>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">No orders or trades on selected broker {{
                    selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Shoonya Trades -->
          <div class="table-responsive" v-if="activeFetchFunction === 'fetchShoonyaOrdersTradesBook'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Side</th>
                  <th scope="col">Details</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Price</th>
                  <th scope="col">Time</th>
                  <th scope="col">Status & Reason</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="combinedOrdersAndTrades.length">
                  <template v-for="item in combinedOrdersAndTrades" :key="item.norenordno">
                    <tr v-if="item.order.status !== 'COMPLETE'">
                      <td>Order</td>
                      <td>{{ item.order.trantype }}</td>
                      <td>
                        {{ item.order.norenordno }}
                        <br />
                        {{ item.order.tsym }}
                      </td>
                      <td>{{ item.order.qty }}</td>
                      <td>{{ item.order.prc }}</td>
                      <td>{{ formatTime(item.order.norentm) }}</td>
                      <td :class="{
                        'text-danger': item.order.status === 'REJECTED',
                        'text-warning': item.order.status === 'PENDING' || item.order.status === 'OPEN'
                      }">
                        {{ item.order.status }}
                        {{ item.order.rejreason }}
                      </td>
                    </tr>
                    <tr v-if="item.trade" class="nested-trade-row">
                      <td>Trade</td>
                      <td>{{ item.order.trantype }}</td>
                      <td>
                        {{ item.trade.norenordno }}
                        <br />
                        {{ item.trade.tsym }}
                      </td>
                      <td>{{ item.trade.qty }}</td>
                      <td>{{ item.trade.flprc }}</td>
                      <td>{{ formatTime(item.trade.norentm) }}</td>
                      <td class="text-success">{{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}</td>
                    </tr>
                  </template>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">No orders or trades on selected broker {{
                    selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-secondary">
            This trades tab fetches orders and trades from selected broker and combines them. Only failed orders are
            shown. If the order is successfully placed, you'll only see the respective trade.
          </p>
        </div>
        <div class="tab-pane fade" id="automation-tab-pane" role="tabpanel" aria-labelledby="automation-tab"
          tabindex="0">

          <div class="row py-3">
            <div class="col-12">
              <p class="text-danger">
                <b>This section is under development,</b> Following features will not work as expected.
              </p>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- Total Risk by Capital Or Amount -->
              <label for="totalRiskType" class="form-label">Total Risk by</label>
              <div class="input-group">
                <div class="input-group-text">
                  <input class="form-check-input mt-0" type="checkbox" id="totalRiskTypeToggle"
                    v-model="totalRiskTypeToggle">
                </div>
                <select class="form-select" v-model="totalRiskType">
                  <option value="percentage">Percentage</option>
                  <option value="amount">Amount</option>
                </select>
                <template v-if="totalRiskType === 'amount'">
                  <input type="number" min="100" class="form-control" v-model="totalRiskAmount"
                    placeholder="Enter an amount">
                  <span class="input-group-text">₹</span>
                </template>
                <template v-if="totalRiskType === 'percentage'">
                  <input type="number" min="0.1" max="5" step="0.1" class="form-control" v-model="totalRiskPercentage"
                    placeholder="Enter a value between 0.1 and 5">
                  <span class="input-group-text">%</span>
                </template>
              </div>
              <small class="form-text text-secondary">{{ totalRiskTypeToggle ? 'Enabled' : 'Disabled' }}</small>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- MTM Profit Trailing ON/OFF and Trail by percentage or amount -->
              <label for="mtmProfitTrailingToggle" class="form-label">MTM Profit Trailing by</label>
              <div class="input-group">
                <div class="input-group-text">
                  <input class="form-check-input mt-0" type="checkbox" id="mtmProfitTrailingToggle"
                    v-model="mtmProfitTrailingToggle">
                </div>
                <select class="form-select" v-model="mtmProfitTrailingType">
                  <option value="percentage">Percentage</option>
                  <option value="amount">Amount</option>
                </select>
                <template v-if="mtmProfitTrailingType === 'amount'">
                  <input type="number" min="100" class="form-control" v-model="mtmProfitTrailingAmount"
                    placeholder="Enter an amount">
                  <span class="input-group-text">₹</span>
                </template>
                <template v-if="mtmProfitTrailingType === 'percentage'">
                  <input type="number" min="0.1" max="5" step="0.1" class="form-control"
                    v-model="mtmProfitTrailingPercentage" placeholder="Enter a value between 0.1 and 5">
                  <span class="input-group-text">%</span>
                </template>
              </div>
              <small class="form-text text-secondary">{{ mtmProfitTrailingToggle ? 'Enabled' : 'Disabled' }}</small>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- Close Positions if Risk is reached -->
              <label for="closePositionsRisk" class="form-label">Close Positions if Risk is reached</label>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="closePositionsRisk" v-model="closePositionsRisk">
                <label class="form-check-label" for="closePositionsRisk">{{ closePositionsRisk ? 'Enabled' : 'Disabled'
                  }}</label>
              </div>
            </div>
            <div class="col-12 py-2 text-center">
              <p class="text-secondary">
                These settings are automatically saved.
              </p>
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="basket-tab-pane" role="tabpanel" aria-labelledby="basket-tab" tabindex="0">
          <div class="row py-3">
            <div class="col-12 text-center">
              <p class="text-secondary">Coming Soon</p>
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
          <div class="row py-3">
            <div class="col-12">
              <p class="text-danger"><b>This section is under development,</b> features will not work as expected.</p>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- Select Call Strike Offset -->
              <label for="callStrikeOffset" class="form-label">Call Strike Offset</label>
              <select name="" id="" class="form-select">
                <option value="+3">ITM +3</option>
                <option value="+2">ITM +2</option>
                <option value="+1">ITM +1</option>
                <option value="0" selected>ATM 0</option>
                <option value="-1">OTM -1</option>
                <option value="-2">OTM -2</option>
                <option value="-3">OTM -3</option>
              </select>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- Select Put Strike Offset -->
              <label for="putStrikeOffset" class="form-label">Put Strike Offset</label>
              <select name="" id="" class="form-select">
                <option value="+3">ITM +3</option>
                <option value="+2">ITM +2</option>
                <option value="+1">ITM +1</option>
                <option value="0" selected>ATM 0</option>
                <option value="-1">OTM -1</option>
                <option value="-2">OTM -2</option>
                <option value="-3">OTM -3</option>
              </select>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- Show all positions Including Equity and Futures and Options -->
              <label for="showAllPositions" class="form-label">Show Positions</label>
              <select name="" id="" class="form-select">
                <option value="all">All Positions</option>
                <option value="futures">Futures Only</option>
                <option value="options" selected>Options Only</option>
                <option value="equity">Equity Only</option>
              </select>
            </div>
            <div class="col-12 col-md-6 col-lg-4">
              <!-- Show LTP Range Bar -->
              <label for="showLTPRangeBar" class="form-label">Show LTP Range Bar</label>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="showLTPRangeBar" v-model="showLTPRangeBar">
                <label class="form-check-label" for="showLTPRangeBar">{{ showLTPRangeBar ? 'Enabled' : 'Disabled'
                  }}</label>
              </div>
            </div>
            <div class="col-12 py-2 text-center">
              <p class="text-secondary">
                These settings are automatically saved.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Toast Alert -->
  <ToastAlert :show="showToast" :message="toastMessage" @update:show="updateToastVisibility" />

  <!-- Limit Price Input Modal (conditionally rendered) -->
  <div class="modal fade" id="PlaceLimitOrderWindow" tabindex="-1" aria-labelledby="PlaceLimitOrderWindowLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="PlaceLimitOrderWindowLabel">
            {{ modalTransactionType }} {{ modalOptionType }}: {{ selectedMasterSymbol }} {{ selectedStrike.strikePrice
            }}
            {{
              selectedStrike.expiryDate }}
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
            @click="resetOrderType"></button>
        </div>
        <div class="modal-body">
          <div class="col-2">
            <label for="LimitPrice" class="form-label mb-0">Limit Price</label>
            <input type="number" id="LimitPrice" class="form-control" v-model="limitPrice"
              placeholder="Enter limit price">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
            @click="resetOrderTypeIfNeeded">Cancel</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal"
            @click="placeOrder(modalTransactionType, modalOptionType)">Place
            Order</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Kill Swtich Activation Confirmation Modal -->
  <div class="modal fade" id="KillSwitchActivationConfirmationModal" tabindex="-1"
    aria-labelledby="KillSwitchActivationConfirmationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="KillSwitchActivationConfirmationModalLabel">Confirm Kill Switch Activation</h5>
        </div>
        <div class="modal-body">
          <blockquote class="blockquote">
            This action will <b class="text-danger">close all positions</b> and block trading for the next 6 hours.
          </blockquote>
          <p>Are you sure you want to continue?</p>
        </div>
        <div class="modal-footer">
          <div class="d-flex flex-row justify-content-between w-100">
            <button type="button" class="btn btn-outline-secondary w-50 me-1" data-bs-dismiss="modal">No</button>
            <button type="button" class="btn btn-danger w-50 ms-1" data-bs-dismiss="modal" @click="toggleKillSwitch">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, reactive } from 'vue';
import { checkAllTokens, getBrokerStatus, tokenStatus } from '@/utils/brokerTokenValidator';
import axios from 'axios';
import ToastAlert from '../components/ToastAlert.vue';
import qs from 'qs';
import { debounce } from 'lodash';
// import LineChart from '../components/LineChart.vue';
// const showLineChart = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const updateToastVisibility = (value) => {
  showToast.value = value;
};
const brokerStatus = computed(() => {
  const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
  const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}');

  const flattradeClientId = flattradeDetails.clientId;
  const flattradeApiToken = localStorage.getItem('FLATTRADE_API_TOKEN');
  const shoonyaApiToken = localStorage.getItem('SHOONYA_API_TOKEN');
  const shoonyaClientId = shoonyaDetails.clientId;

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    if (flattradeClientId && flattradeApiToken) {
      return tokenStatus.Flattrade === 'valid' ? 'Connected' : 'Token Expired';
    }
    return 'Not Connected';
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    if (shoonyaClientId && shoonyaApiToken) {
      return tokenStatus.Shoonya === 'valid' ? 'Connected' : 'Token Expired';
    }
    return 'Not Connected';
  }
  return 'Not Connected';
});

const activeTab = ref('positions');
const setActiveTab = (tab) => {
  activeTab.value = tab;
};

// Kill Switch - Client Side
const killSwitchActive = ref(localStorage.getItem('KillSwitchStatus') === 'true');
const activationTime = ref(parseInt(localStorage.getItem('KillSwitchActivationTime') || '0'));
const currentTime = ref(Date.now());

// Initialize kill switch state
const initKillSwitch = () => {
  const storedStatus = localStorage.getItem('KillSwitchStatus');
  const storedActivationTime = localStorage.getItem('KillSwitchActivationTime');

  if (storedStatus === 'true' && storedActivationTime) {
    killSwitchActive.value = true;
    activationTime.value = parseInt(storedActivationTime);
  } else {
    // Deactivate kill switch if KillSwitchActivationTime is missing
    killSwitchActive.value = false;
    activationTime.value = 0;
    localStorage.removeItem('KillSwitchStatus');
    localStorage.removeItem('KillSwitchActivationTime');
  }
};

const isFormDisabled = computed(() => killSwitchActive.value);
const enableHotKeys = ref(localStorage.getItem('EnableHotKeys') !== 'false'); // Default to true if not set

const handleKillSwitchClick = () => {
  if (killSwitchActive.value) {
    // If the kill switch is already active, deactivate it directly
    toggleKillSwitch();
  }
  // If it's not active, the modal will be shown due to data-bs-target and data-bs-toggle
};
// Modify the toggleKillSwitch function
const toggleKillSwitch = async () => {
  const newStatus = killSwitchActive.value ? 'DEACTIVATED' : 'ACTIVATED';
  if (newStatus === 'ACTIVATED') {
    await closeAllPositions(); // Wait for closeAllPositions to complete
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (newStatus === 'DEACTIVATED' && remainingTimeInMs.value > 0) {
    cycleClockEmoji();
    toastMessage.value = 'Kill Switch cannot be deactivated within 6 hours of activation';
    showToast.value = true;
    return;
  }

  // Handle different response messages
  if (newStatus === 'ACTIVATED') {
    toastMessage.value = 'Kill Switch activated successfully';
    killSwitchActive.value = true;
    localStorage.setItem('KillSwitchStatus', 'true');
    activationTime.value = Date.now();
    localStorage.setItem('KillSwitchActivationTime', activationTime.value.toString());
    enableHotKeys.value = false;
  } else {
    toastMessage.value = 'Kill Switch deactivated successfully';
    killSwitchActive.value = false;
    localStorage.removeItem('KillSwitchStatus');
    activationTime.value = 0;
    localStorage.removeItem('KillSwitchActivationTime');
  }

  showToast.value = true;
};
const remainingTimeInMs = computed(() => {
  if (!activationTime.value || !killSwitchActive.value) return 0;
  const sixHoursInMillis = 6 * 60 * 60 * 1000;
  return Math.max(0, sixHoursInMillis - (currentTime.value - activationTime.value));
});
const killSwitchRemainingTime = computed(() => {
  if (remainingTimeInMs.value === 0) return '';

  const hours = Math.floor(remainingTimeInMs.value / (60 * 60 * 1000));
  const minutes = Math.floor((remainingTimeInMs.value % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((remainingTimeInMs.value % (60 * 1000)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
});
// Watch for changes in killSwitchRemainingTime
watch(killSwitchRemainingTime, (newValue) => {
  if (newValue === '' && killSwitchActive.value) {
    toggleKillSwitch();
  }
});
// Watch for changes in remainingTimeInMs
watch(remainingTimeInMs, (newValue) => {
  if (newValue === 0 && killSwitchActive.value) {
    toggleKillSwitch();
  }
});
const killSwitchButtonText = computed(() => killSwitchActive.value ? 'Deactivate' : 'Activate');
const killSwitchButtonClass = computed(() => killSwitchActive.value ? 'btn btn-sm btn-danger shadow fs-5' : 'btn btn-sm btn-success shadow fs-5');

// Fetch brokers and set selectedBroker
const selectedBroker = ref(null);
const selectedBrokerName = ref('');
const availableBrokers = computed(() => {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('broker_'))
    .map(key => key.replace('broker_', ''));
});
// Function to set selected broker and save to localStorage
const updateSelectedBroker = () => {
  const availableBrokerNames = availableBrokers.value;

  if (availableBrokerNames.length === 0) {
    // No brokers available, remove selectedBroker from localStorage
    selectedBroker.value = null;
    localStorage.removeItem('selectedBroker');
    selectedBrokerName.value = '';
  } else if (selectedBrokerName.value && availableBrokerNames.includes(selectedBrokerName.value)) {
    const brokerDetails = JSON.parse(localStorage.getItem(`broker_${selectedBrokerName.value}`) || '{}');
    selectedBroker.value = brokerDetails;
    localStorage.setItem('selectedBroker', JSON.stringify(brokerDetails));
  } else {
    // If the selected broker is not available, clear the selection
    selectedBroker.value = null;
    localStorage.removeItem('selectedBroker');
    selectedBrokerName.value = '';
  }
};


// Fetch trading symbols and strikes
const selectedExchange = ref({});
const selectedMasterSymbol = ref('');
const selectedQuantity = ref(0);
const selectedExpiry = ref(null);
const selectedCallStrike = ref({});
const selectedPutStrike = ref({});
const exchangeSymbols = ref({});

const updateExchangeSymbols = () => {
  const symbolData = {
    NIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26000' },
    BANKNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26009' },
    FINNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26037' },
    MIDCPNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26074' },
    SENSEX: { exchangeCode: 'BSE', exchangeSecurityId: '1' },
    BANKEX: { exchangeCode: 'BSE', exchangeSecurityId: '12' },
  };

  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
    exchangeSymbols.value = {
      NFO: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'],
      BFO: ['SENSEX', 'BANKEX'],
    };
  }

  // Store symbolData separately
  exchangeSymbols.value.symbolData = symbolData;
};
// Add this computed property
const exchangeOptions = computed(() => {
  return Object.keys(exchangeSymbols.value).filter(key => key !== 'symbolData');
});
const setDefaultExchangeAndMasterSymbol = () => {
  const exchanges = exchangeOptions.value;
  if (exchanges.length > 0) {
    // Set the exchange
    const savedExchange = localStorage.getItem('selectedExchange');
    selectedExchange.value = savedExchange && exchanges.includes(savedExchange)
      ? savedExchange
      : exchanges[0];

    // Set the master symbol
    if (exchangeSymbols.value[selectedExchange.value].length > 0) {
      const savedMasterSymbol = localStorage.getItem('selectedMasterSymbol');
      selectedMasterSymbol.value = savedMasterSymbol && exchangeSymbols.value[selectedExchange.value].includes(savedMasterSymbol)
        ? savedMasterSymbol
        : exchangeSymbols.value[selectedExchange.value][0];
    }
  }
};
// New function to save user's choice
const saveUserChoice = () => {
  localStorage.setItem('selectedExchange', selectedExchange.value);
  localStorage.setItem('selectedMasterSymbol', selectedMasterSymbol.value);
};
const callStrikes = ref([]);
const putStrikes = ref([]);
const expiryDates = ref([]);
const synchronizeOnLoad = ref(true);
const niftyPrice = ref('N/A');
const bankNiftyPrice = ref('N/A');
const finniftyPrice = ref('N/A');
const midcpniftyPrice = ref('N/A');
const sensexPrice = ref('N/A');
const bankexPrice = ref('N/A');
// Add a new function to get the initial price
const getInitialPrice = (symbol) => {
  const strike = callStrikes.value.find(s =>
    s.tradingSymbol.includes(symbol) &&
    /C\d+$/.test(s.tradingSymbol)
  );
  return strike ? parseFloat(strike.strikePrice) : null;
};
const dataFetched = ref(false);
const fetchTradingData = async () => {
  let response;
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    // response = await fetch(`http://localhost:3000/flattradeSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    response = await fetch(`http://localhost:3000/shoonyaSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    // console.log('Flattrade Symbols:', response);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    response = await fetch(`http://localhost:3000/shoonyaSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    // console.log('Shoonya Symbols:', response);
  } else {
    throw new Error('Unsupported broker');
  }

  const data = await response.json();
  // console.log('Data:', data);
  expiryDates.value = data.expiryDates;

  // Filter by selected expiry date before sorting and mapping
  callStrikes.value = data.callStrikes
    .filter(strike => strike.expiryDate === selectedExpiry.value)
    .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
    .map(strike => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }));

  putStrikes.value = data.putStrikes
    .filter(strike => strike.expiryDate === selectedExpiry.value)
    .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
    .map(strike => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }));

  // After fetching and setting callStrikes and putStrikes
  if (niftyPrice.value === 'N/A') niftyPrice.value = getInitialPrice('NIFTY');
  if (bankNiftyPrice.value === 'N/A') bankNiftyPrice.value = getInitialPrice('BANKNIFTY');
  if (finniftyPrice.value === 'N/A') finniftyPrice.value = getInitialPrice('FINNIFTY');
  if (midcpniftyPrice.value === 'N/A') midcpniftyPrice.value = getInitialPrice('MIDCPNIFTY');
  if (sensexPrice.value === 'N/A') sensexPrice.value = getInitialPrice('SENSEX');
  if (bankexPrice.value === 'N/A') bankexPrice.value = getInitialPrice('BANKEX');

  updateStrikesForExpiry(selectedExpiry.value);
  dataFetched.value = true;
};
// Add watchers for the price values
watch([niftyPrice, bankNiftyPrice, finniftyPrice, midcpniftyPrice, sensexPrice, bankexPrice], () => {
  if (selectedExpiry.value) {
    updateStrikesForExpiry(selectedExpiry.value);
  }
});
const formatDate = (dateString) => {
  if (!dataFetched.value || !dateString) {
    return ''; // Return empty string if data hasn't been fetched or dateString is null
  }

  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
    return dateString;
  }
  return dateString;
};
const convertToComparableDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options).replace(/,/g, '');
};
const isExpiryToday = computed(() => {
  const comparableSelectedExpiry = convertToComparableDate(formatDate(selectedExpiry.value));
  const comparableFormattedDate = convertToComparableDate(formattedDate.value);
  // console.log('Comparable Selected Expiry:', comparableSelectedExpiry);
  // console.log('Comparable Formatted Date:', comparableFormattedDate);
  return comparableSelectedExpiry === comparableFormattedDate;
});

const updateStrikesForExpiry = (expiryDate) => {
  // console.log('Updating strikes for expiry:', expiryDate);

  let filteredCallStrikes, filteredPutStrikes;

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    filteredCallStrikes = callStrikes.value.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = putStrikes.value.filter(strike => strike.expiryDate === expiryDate);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    filteredCallStrikes = callStrikes.value.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = putStrikes.value.filter(strike => strike.expiryDate === expiryDate);
  }

  // console.log('Filtered Call Strikes:', filteredCallStrikes);
  // console.log('Filtered Put Strikes:', filteredPutStrikes);

  // Only set initial strikes if they haven't been set yet or if the expiry date has changed
  if (!selectedCallStrike.value.securityId || !selectedPutStrike.value.securityId || selectedCallStrike.value.expiryDate !== expiryDate) {
    // Get the current underlying price based on the selected master symbol
    let currentPrice;
    if (selectedMasterSymbol.value === 'NIFTY') {
      currentPrice = parseFloat(niftyPrice.value);
    } else if (selectedMasterSymbol.value === 'BANKNIFTY') {
      currentPrice = parseFloat(bankNiftyPrice.value);
    } else if (selectedMasterSymbol.value === 'FINNIFTY') {
      currentPrice = parseFloat(finniftyPrice.value);
    } else if (selectedMasterSymbol.value === 'MIDCPNIFTY') {
      currentPrice = parseFloat(midcpniftyPrice.value);
    } else if (selectedMasterSymbol.value === 'SENSEX') {
      currentPrice = parseFloat(sensexPrice.value);
    } else if (selectedMasterSymbol.value === 'BANKEX') {
      currentPrice = parseFloat(bankexPrice.value);
    }

    if (currentPrice && !isNaN(currentPrice) && filteredCallStrikes.length > 0) {
      const nearestStrike = filteredCallStrikes.reduce((prev, curr) =>
        Math.abs(curr.strikePrice - currentPrice) < Math.abs(prev.strikePrice - currentPrice) ? curr : prev
      );

      selectedCallStrike.value = nearestStrike;
      selectedPutStrike.value = filteredPutStrikes.find(strike => strike.strikePrice === nearestStrike.strikePrice) || {};
    }

    // console.log('Selected Call Strike:', selectedCallStrike.value);
    // console.log('Selected Put Strike:', selectedPutStrike.value);

    if (synchronizeOnLoad.value) {
      synchronizeStrikes();
      synchronizeOnLoad.value = false;
    }

    defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A';
    defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A';
  }
};
const synchronizeStrikes = () => {
  synchronizeCallStrikes();
  synchronizePutStrikes();
};

const synchronizeCallStrikes = () => {
  if (selectedPutStrike.value && selectedPutStrike.value.tradingSymbol) {
    let baseSymbol;
    if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
      baseSymbol = selectedPutStrike.value.tradingSymbol.replace(/P\d+$/, '');
    }
    const matchingCallStrike = callStrikes.value.find(strike =>
      strike.tradingSymbol.startsWith(baseSymbol) &&
      /C\d+$/.test(strike.tradingSymbol)
    );
    if (matchingCallStrike) {
      selectedCallStrike.value = matchingCallStrike;
    } else {
      selectedCallStrike.value = {};
    }
  }
  updateSecurityIds();
};

const synchronizePutStrikes = () => {
  if (selectedCallStrike.value && selectedCallStrike.value.tradingSymbol) {
    let baseSymbol;
    if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
      baseSymbol = selectedCallStrike.value.tradingSymbol.replace(/C\d+$/, '');
    }
    const matchingPutStrike = putStrikes.value.find(strike =>
      strike.tradingSymbol.startsWith(baseSymbol) &&
      /P\d+$/.test(strike.tradingSymbol)
    );
    if (matchingPutStrike) {
      selectedPutStrike.value = matchingPutStrike;
    } else {
      selectedPutStrike.value = {};
    }
  }
  updateSecurityIds();
};

const updateSecurityIds = () => {
  // console.log('Updating Security IDs');
  defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A';
  defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A';
};
const lotsPerSymbol = ref({});
const selectedLots = computed({
  get: () => lotsPerSymbol.value[selectedMasterSymbol.value] || 1,
  set: (value) => {
    lotsPerSymbol.value[selectedMasterSymbol.value] = value;
    saveLots();
  }
});
// Function to save lots to localStorage
const saveLots = () => {
  localStorage.setItem('lotsPerSymbol', JSON.stringify(lotsPerSymbol.value));
};

// Function to load lots from localStorage
const loadLots = () => {
  const savedLots = localStorage.getItem('lotsPerSymbol');
  if (savedLots) {
    lotsPerSymbol.value = JSON.parse(savedLots);
  }
};
// maxlots computation....
const maxLots = computed(() => {
  const instrument = quantities.value[selectedMasterSymbol.value];
  return instrument ? instrument.maxLots : 56; // maxlots 56 is conditional...
});
// Modify the updateAvailableQuantities function
const updateAvailableQuantities = () => {
  const instrument = quantities.value[selectedMasterSymbol.value];
  if (instrument) {
    availableQuantities.value = Array.from({ length: instrument.maxLots }, (_, i) => ({
      lots: i + 1,
      quantity: (i + 1) * instrument.lotSize
    }));
  } else {
    availableQuantities.value = [];
  }
  // Ensure selectedQuantity is in the available quantities list
  if (!availableQuantities.value.some(q => q.quantity === selectedQuantity.value)) {
    selectedQuantity.value = availableQuantities.value[0]?.quantity || 0;
  }
};
// Update the updateSelectedQuantity function
const updateSelectedQuantity = () => {
  const instrument = quantities.value[selectedMasterSymbol.value];
  if (instrument) {
    const maxLots = instrument.maxLots; // Use maxLots from the instrument
    const lots = Math.min(Math.max(1, selectedLots.value), maxLots);
    lotsPerSymbol.value[selectedMasterSymbol.value] = lots;
    selectedQuantity.value = lots * instrument.lotSize;
    saveLots();
  }
};

watch(selectedLots, () => {
  updateSelectedQuantity();
});

const handleHotKeys = (event) => {
  if (!enableHotKeys.value) return;

  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'F6':
    case 'F7':
      event.preventDefault(); // Prevent default browser action
      break;
  }

  switch (event.key) {
    case 'ArrowUp':
      placeOrder(getTransactionType('BUY'), 'CALL');
      break;
    case 'ArrowDown':
      placeOrder(getTransactionType('BUY'), 'PUT');
      break;
    case 'ArrowRight':
      placeOrder(getTransactionType('SELL'), 'PUT');
      break;
    case 'ArrowLeft':
      placeOrder(getTransactionType('SELL'), 'CALL');
      break;
    case 'F6':
      closeAllPositions();
      break;
    case 'F7':
      cancelPendingOrders();
      break;
  }
};

const flatOrderBook = ref([]);
const flatTradeBook = ref([]);
const token = ref('');

const fetchFlattradeOrdersTradesBook = async () => {
  let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value;

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
    toastMessage.value = 'Flattrade broker is not selected.';
    showToast.value = true;
    return;
  }

  const clientId = selectedBroker.value.clientId;

  if (!jKey || !clientId) {
    toastMessage.value = 'Token or Client ID is missing. Please generate a token first.';
    showToast.value = true;
    return;
  }

  try {
    const response = await axios.get('http://localhost:3000/flattradeGetOrdersAndTrades', {
      params: {
        FLATTRADE_API_TOKEN: jKey,
        FLATTRADE_CLIENT_ID: clientId
      }
    });

    flatOrderBook.value = response.data.orderBook;
    flatTradeBook.value = response.data.tradeBook;
    // console.log('Flattrade Order Book:', response.data.orderBook);
    // console.log('Flattrade Trade Book:', response.data.tradeBook);
  } catch (error) {
    toastMessage.value = 'Error fetching trades: ' + error.message;
    showToast.value = true;
    console.error('Error fetching trades:', error);
  }
};

const shoonyaOrderBook = ref([]);
const shoonyaTradeBook = ref([]);
const fetchShoonyaOrdersTradesBook = async () => {
  let jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value;

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
    toastMessage.value = 'Shoonya broker is not selected.';
    showToast.value = true;
    return;
  }

  const clientId = selectedBroker.value.clientId;

  if (!jKey || !clientId) {
    toastMessage.value = 'Token or Client ID is missing. Please generate a token first.';
    showToast.value = true;
    return;
  }

  try {
    const response = await axios.get('http://localhost:3000/shoonyaGetOrdersAndTrades', {
      params: {
        SHOONYA_API_TOKEN: jKey,
        SHOONYA_CLIENT_ID: clientId
      }
    });

    shoonyaOrderBook.value = response.data.orderBook;
    shoonyaTradeBook.value = response.data.tradeBook;
    // console.log('Shoonya Order Book:', response.data.orderBook);
    // console.log('Shoonya Trade Book:', response.data.tradeBook);
  } catch (error) {
    toastMessage.value = 'Error fetching trades: ' + error.message;
    showToast.value = true;
    console.error('Error fetching trades:', error);
  }
};

const combinedOrdersAndTrades = computed(() => {
  const combined = {};

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    // Process Flattrade orders and trades
    if (Array.isArray(flatOrderBook.value)) {
      flatOrderBook.value.forEach(order => {
        combined[order.norenordno] = { order, trade: null };
      });
    }

    if (Array.isArray(flatTradeBook.value)) {
      flatTradeBook.value.forEach(trade => {
        if (combined[trade.norenordno]) {
          combined[trade.norenordno].trade = trade;
        } else {
          combined[trade.norenordno] = { order: null, trade };
        }
      });
    }
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    // Process Shoonya orders and trades
    if (Array.isArray(shoonyaOrderBook.value)) {
      shoonyaOrderBook.value.forEach(order => {
        combined[order.norenordno] = { order, trade: null };
      });
    }

    if (Array.isArray(shoonyaTradeBook.value)) {
      shoonyaTradeBook.value.forEach(trade => {
        if (combined[trade.norenordno]) {
          combined[trade.norenordno].trade = trade;
        } else {
          combined[trade.norenordno] = { order: null, trade };
        }
      });
    }
  }

  return Object.values(combined).sort((a, b) => {
    const aTime = a.order?.norentm || a.trade?.norentm;
    const bTime = b.order?.norentm || b.trade?.norentm;
    return new Date(bTime) - new Date(aTime); // Sort in descending order (most recent first)
  });
});

const formatTime = (timeString) => {
  if (!timeString) return '';

  const [time] = timeString.split(' ');
  const [hours, minutes, seconds] = time.split(':');

  let formattedHours = parseInt(hours, 10);
  const ampm = formattedHours >= 12 ? 'PM' : 'AM';
  formattedHours = formattedHours % 12 || 12;

  const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  return `${formattedTime}`;
};

const flatTradePositionBook = ref([]);
const fetchFlattradePositions = async () => {
  let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value;

  if (!jKey) {
    toastMessage.value = 'Token is missing. Please generate a token first.';
    showToast.value = true;
    return;
  }

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
    toastMessage.value = 'Flattrade broker is not selected.';
    showToast.value = true;
    return;
  }

  const clientId = selectedBroker.value.clientId;

  const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: clientId, actid: clientId })}`;

  try {
    const positionBookRes = await axios.post('https://piconnect.flattrade.in/PiConnectTP/PositionBook', positionBookPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (Array.isArray(positionBookRes.data) && positionBookRes.data.every(item => item.stat === 'Ok')) {
      flatTradePositionBook.value = positionBookRes.data;
      // console.log('Flattrade Position Book:', positionBookRes.data);
      updatePositionSecurityIds();
      subscribeToPositionLTPs();
      subscribeToOptions();
    } else if (positionBookRes.data.emsg === 'no data' || positionBookRes.data.emsg.includes('no data')) {
      flatTradePositionBook.value = [];
      // console.log('No positions in Flattrade Position Book');
    } else {
      const errorMsg = positionBookRes.data.emsg || 'Unknown error';
      console.error('Error fetching position book:', errorMsg);
      flatTradePositionBook.value = [];
    }
  } catch (error) {
    console.error('Error fetching position book:', error);
    flatTradePositionBook.value = [];
  }
};

const shoonyaPositionBook = ref([]);
const fetchShoonyaPositions = async () => {
  let jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value;

  if (!jKey) {
    toastMessage.value = 'Token is missing. Please generate a token first.';
    showToast.value = true;
    return;
  }

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
    toastMessage.value = 'Shoonya broker is not selected.';
    showToast.value = true;
    return;
  }

  const clientId = selectedBroker.value.clientId;

  const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: clientId, actid: clientId })}`;

  try {
    const positionBookRes = await axios.post('https://api.shoonya.com/NorenWClientTP/PositionBook', positionBookPayload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (Array.isArray(positionBookRes.data) && positionBookRes.data.every(item => item.stat === 'Ok')) {
      shoonyaPositionBook.value = positionBookRes.data;
      console.log('Shoonya Position Book:', positionBookRes.data);
      updatePositionSecurityIds();
      subscribeToPositionLTPs();
      subscribeToOptions();
    } else if (positionBookRes.data.emsg === 'no data' || positionBookRes.data.emsg.includes('no data')) {
      shoonyaPositionBook.value = [];
      // console.log('No positions in Shoonya Position Book');
    } else {
      const errorMsg = positionBookRes.data.emsg || 'Unknown error';
      console.error('Error fetching position book:', errorMsg);
      shoonyaPositionBook.value = [];
    }
  } catch (error) {
    console.error('Error fetching position book:', error);
    shoonyaPositionBook.value = [];
  }
};

const sortedPositions = computed(() => {
  return [...positionsWithCalculatedProfit.value].sort((a, b) => {
    // First, sort by open/closed status
    if (Number(a.netqty) !== 0 && Number(b.netqty) === 0) return -1;
    if (Number(a.netqty) === 0 && Number(b.netqty) !== 0) return 1;

    // Then, for open positions, sort by absolute quantity in descending order
    if (Number(a.netqty) !== 0 && Number(b.netqty) !== 0) {
      return Math.abs(Number(b.netqty)) - Math.abs(Number(a.netqty));
    }

    // For closed positions, maintain their original order
    return 0;
  });
});

const fundLimits = ref({});
// Update the fetchFundLimit function
const fetchFundLimit = async () => {
  try {
    if (!selectedBroker.value) {
      throw new Error('No broker selected');
    }

    let response;
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN');
      if (!FLATTRADE_API_TOKEN) {
        throw new Error('Flattrade API Token is missing');
      }
      response = await axios.post('http://localhost:3000/flattradeFundLimit', null, {
        params: {
          FLATTRADE_API_TOKEN,
          FLATTRADE_CLIENT_ID: selectedBroker.value.clientId
        }
      });
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
      if (!SHOONYA_API_TOKEN) {
        throw new Error('Shoonya API Token is missing');
      }
      response = await axios.post('http://localhost:3000/shoonyaFundLimit', null, {
        params: {
          SHOONYA_API_TOKEN,
          SHOONYA_CLIENT_ID: selectedBroker.value.clientId
        }
      });
      // Make sure the response data has the correct structure
      fundLimits.value = {
        cash: response.data.cash,
        marginused: response.data.marginused,
        spanMargin: response.data.span,
        expoMargin: response.data.expo,
        premiumMargin: response.data.premium,
        equityMargin: response.data.varelm
        // Add any other relevant fields from the Shoonya response
      };
    }
    else {
      throw new Error('Unsupported broker');
    }
    fundLimits.value = response.data;
  } catch (error) {
    console.error('Failed to fetch fund limits:', error);
  }
};
const updateFundLimits = async () => {
  await fetchFundLimit();
  // console.log('Updated Fund Limits:', fundLimits.value);
};
const showBrokerClientId = ref(false);
const toggleBrokerClientIdVisibility = () => {
  showBrokerClientId.value = !showBrokerClientId.value;
};

const maskBrokerClientId = (clientId) => {
  if (!clientId) return 'N/A';
  const length = clientId.length;
  if (length <= 2) return clientId;
  const maskLength = Math.max(1, Math.floor(length / 2));
  const startUnmaskedLength = Math.ceil((length - maskLength) / 2);
  const endUnmaskedLength = length - startUnmaskedLength - maskLength;
  const firstPart = clientId.slice(0, startUnmaskedLength);
  const lastPart = clientId.slice(-endUnmaskedLength);
  const middleMask = '*'.repeat(maskLength);
  return `${firstPart}${middleMask}${lastPart}`;
};


// Update the quantities object
const quantities = ref({
  NIFTY: { lotSize: 25, maxLots: 72 },
  BANKNIFTY: { lotSize: 15, maxLots: 60 },
  FINNIFTY: { lotSize: 25, maxLots: 72 },
  MIDCPNIFTY: { lotSize: 50, maxLots: 56 },
  SENSEX: { lotSize: 10, maxLots: 100 },
  BANKEX: { lotSize: 15, maxLots: 60 },
});
const availableQuantities = ref([]);

const orderTypes = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return ['MKT', 'LMT'];
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return ['MKT', 'LMT'];
  }
  return [];
});
const selectedOrderType = ref(orderTypes.value[0]);
const previousOrderType = ref(orderTypes.value[0]);

const selectedStrike = ref({});
const setOrderDetails = (transactionType, optionType) => {
  modalTransactionType.value = getTransactionType(transactionType); // Use getTransactionType to set modalTransactionType
  modalOptionType.value = optionType;
  selectedOrderType.value = orderTypes.value[1]; // Set selectedOrderType to LIMIT or LMT based on broker
  selectedStrike.value = optionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value;
};
const resetOrderTypeIfNeeded = () => {
  if (previousOrderType.value === orderTypes.value[0]) { // Check if previousOrderType is MARKET or MKT
    resetOrderType();
  }
};

const resetOrderType = () => {
  selectedOrderType.value = orderTypes.value[0]; // Set selectedOrderType to MARKET or MKT based on broker
};

const productTypes = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return ['Intraday', 'Margin'];
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return ['Intraday', 'Margin'];
  }
  return [];
});
const getProductTypeValue = (productType) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  return productType;
};

const selectedProductType = ref(''); // Initialize with an empty string

const getTransactionType = (type) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return type === 'BUY' ? 'B' : 'S';
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return type === 'BUY' ? 'B' : 'S';
  }
  return type;
};

const limitPrice = ref(null);
const modalTransactionType = ref('');
const modalOptionType = ref('');
// Get Exchange Segment for Flattrade & Shoonya
const getExchangeSegment = () => {
  if (!selectedBroker.value || !selectedExchange.value) {
    throw new Error("Broker or exchange not selected");
  }

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    if (selectedExchange.value === 'NFO') {
      return 'NFO';
    } else if (selectedExchange.value === 'BFO') {
      return 'BFO';
    } else {
      throw new Error("Selected exchange is not valid for Flattrade");
    }
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    if (selectedExchange.value === 'NFO') {
      return 'NFO';
    } else if (selectedExchange.value === 'BFO') {
      return 'BFO';
    } else {
      throw new Error("Selected exchange is not valid for Shoonya");
    }
  }
  else {
    throw new Error("Unsupported broker");
  }
};

// Prepare Order Payload for Flattrade & Shoonya
const prepareOrderPayload = (transactionType, drvOptionType, selectedStrike, exchangeSegment) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return {
      uid: selectedBroker.value.brokerClientId,
      actid: selectedBroker.value.brokerClientId,
      exch: exchangeSegment,
      tsym: selectedStrike.tradingSymbol,
      qty: selectedQuantity.value,
      prc: selectedOrderType.value === 'LMT' ? limitPrice.value : 0,
      prd: selectedProductType.value,
      trantype: transactionType,
      prctyp: selectedOrderType.value,
      ret: "DAY"
      // Add any additional fields specific to Flattrade here
    };
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return {
      uid: selectedBroker.value.brokerClientId,
      actid: selectedBroker.value.brokerClientId,
      exch: exchangeSegment,
      tsym: selectedStrike.tradingSymbol,
      qty: selectedQuantity.value,
      prc: selectedOrderType.value === 'LMT' ? limitPrice.value : 0,
      prd: selectedProductType.value,
      trantype: transactionType,
      prctyp: selectedOrderType.value,
      ret: "DAY"
    };
  } else {
    throw new Error("Unsupported broker");
  }
};
// With a reactive object
// Modify the tradeSettings reactive object
const tradeSettings = reactive({
  enableStoploss: JSON.parse(localStorage.getItem('enableStoploss') || 'true'),
  stoplossValue: Number(localStorage.getItem('stoplossValue') || '20'),
  enableTarget: JSON.parse(localStorage.getItem('enableTarget') || 'true'),
  targetValue: Number(localStorage.getItem('targetValue') || '30'),
  stoplossStep: 1, // The step size for increasing/decreasing stoploss price
  targetStep: 1, // The step size for increasing/decreasing target price
});
// Add this function to save trade settings to localStorage
const saveTradeSettings = () => {
  localStorage.setItem('enableStoploss', JSON.stringify(tradeSettings.enableStoploss));
  localStorage.setItem('stoplossValue', tradeSettings.stoplossValue.toString());
  localStorage.setItem('enableTarget', JSON.stringify(tradeSettings.enableTarget));
  localStorage.setItem('targetValue', tradeSettings.targetValue.toString());
};
// Add these to your existing reactive variables
const positionStoplosses = ref({});
const positionTargets = ref({});
// Add these to your reactive variables
const positionStoplossesPrice = ref({});
const positionTargetsPrice = ref({});
// Add these helper functions
const adjustStoplossPrice = (tsym, adjustment) => {
  if (!tsym || !positionStoplossesPrice.value[tsym]) return;

  const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
    .find(p => getSymbol(p) === tsym);

  if (!position) return;

  const netQty = Number(position.netQty || position.netqty);
  const isLong = netQty > 0;

  // For long positions, decrease stoploss price. For short positions, increase it.
  positionStoplossesPrice.value[tsym] += isLong ? -adjustment : adjustment;

  // Recalculate the points-based stoploss
  const currentLTP = Number(positionLTPs.value[tsym] || 0);
  positionStoplosses.value[tsym] = Math.abs(currentLTP - positionStoplossesPrice.value[tsym]);

  console.log(`Adjusted stoploss for ${tsym}: Price=${positionStoplossesPrice.value[tsym]}, Points=${positionStoplosses.value[tsym]}`);

  localStorage.setItem('positionStoplossesPrice', JSON.stringify(positionStoplossesPrice.value));
  localStorage.setItem('positionStoplosses', JSON.stringify(positionStoplosses.value));
};

const adjustTargetPrice = (tsym, adjustment) => {
  if (!tsym || !positionTargetsPrice.value[tsym]) return;

  const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
    .find(p => getSymbol(p) === tsym);

  if (!position) return;

  const netQty = Number(position.netQty || position.netqty);
  const isLong = netQty > 0;

  // For long positions, increase target price. For short positions, decrease it.
  positionTargetsPrice.value[tsym] += isLong ? adjustment : -adjustment;

  // Recalculate the points-based target
  const currentLTP = Number(positionLTPs.value[tsym] || 0);
  positionTargets.value[tsym] = Math.abs(currentLTP - positionTargetsPrice.value[tsym]);

  console.log(`Adjusted target for ${tsym}: Price=${positionTargetsPrice.value[tsym]}, Points=${positionTargets.value[tsym]}`);

  localStorage.setItem('positionTargetsPrice', JSON.stringify(positionTargetsPrice.value));
  localStorage.setItem('positionTargets', JSON.stringify(positionTargets.value));
};

// Place Order for Flattrade & Shoonya
const placeOrder = async (transactionType, drvOptionType) => {
  try {
    let selectedStrike;
    if (drvOptionType === 'CALL') {
      selectedStrike = selectedCallStrike.value;
    } else if (drvOptionType === 'PUT') {
      selectedStrike = selectedPutStrike.value;
    }

    if (!selectedStrike) {
      throw new Error(`Selected ${drvOptionType.toLowerCase()} strike is not defined`);
    }

    if (!selectedStrike.tradingSymbol || !selectedStrike.securityId) {
      throw new Error(`Selected ${drvOptionType.toLowerCase()} strike properties are not properly defined`);
    }

    const exchangeSegment = getExchangeSegment();
    const orderData = prepareOrderPayload(transactionType, drvOptionType, selectedStrike, exchangeSegment);

    let response;
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN');
      const payload = qs.stringify({
        ...orderData,
        uid: selectedBroker.value.clientId,
        actid: selectedBroker.value.clientId
      });
      response = await axios.post('http://localhost:3000/flattradePlaceOrder', payload, {
        headers: {
          'Authorization': `Bearer ${FLATTRADE_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
      const payload = qs.stringify({
        ...orderData,
        uid: selectedBroker.value.clientId,
        actid: selectedBroker.value.clientId
      });
      response = await axios.post('http://localhost:3000/shoonyaPlaceOrder', payload, {
        headers: {
          'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }

    console.log("Placing order with data:", orderData); // placed here to prevent delay and debugging if required
    console.log("Order placed successfully:", response.data);
    toastMessage.value = 'Order placed successfully';
    showToast.value = true;
    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits()

    // Set stoploss and target for the new position
    const newPosition = findNewPosition(selectedStrike.tradingSymbol);
    if (newPosition) {
      setStoplossAndTarget(newPosition);
    }

  } catch (error) {
    console.error("Error placing order:", error); // Log the full error
    if (error.response && error.response.data && error.response.data.message) {
      const firstThreeWords = error.response.data.message.split(' ').slice(0, 3).join(' ');
      toastMessage.value = firstThreeWords;
    } else {
      toastMessage.value = 'Failed to place order unfortunately';
    }
    showToast.value = true;
  }
};

// New function to update both orders and positions
const updateOrdersAndPositions = async () => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    await Promise.all([
      fetchFlattradeOrdersTradesBook(),
      fetchFlattradePositions()
    ]);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    await Promise.all([
      fetchShoonyaOrdersTradesBook(),
      fetchShoonyaPositions()
    ]);
  }
};

// Add this helper function to find the new position
const findNewPosition = (tradingSymbol) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.find(p => p.tsym === tradingSymbol);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.find(p => p.tsym === tradingSymbol);
  }
  return null;
};

// Place Order for Flattrade & Shoonya for each position
const placeOrderForPosition = async (transactionType, optionType, position) => {
  try {
    const quantity = Math.abs(Number(position.netQty || position.netqty));

    if (quantity === 0) {
      console.log('Quantity is zero, no order will be placed.');
      return;
    }

    let orderData;
    if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
      orderData = {
        uid: selectedBroker.value.clientId,
        actid: selectedBroker.value.clientId,
        exch: selectedExchange.value === 'NFO' ? 'NFO' : 'BFO',
        tsym: position.tsym,
        qty: quantity.toString(),
        prc: "0",
        prd: position.prd,
        trantype: transactionType,
        prctyp: 'MKT',
        ret: "DAY"
      };
    }

    let response;
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN');
      const payload = qs.stringify(orderData);
      response = await axios.post('http://localhost:3000/flattradePlaceOrder', payload, {
        headers: {
          'Authorization': `Bearer ${FLATTRADE_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
      const payload = qs.stringify(orderData);
      response = await axios.post('http://localhost:3000/shoonyaPlaceOrder', payload, {
        headers: {
          'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }

    console.log("Placing order for position with data:", orderData);    // placed here to prevent delay and debugging if required
    console.log(`Order placed successfully for ${getSymbol(position)}`, response.data);
    toastMessage.value = `Order placed successfully for ${getSymbol(position)}`;
    showToast.value = true;

    // Remove stoploss and target for this position
    const tsym = getSymbol(position);
    delete positionStoplossesPrice.value[tsym];
    delete positionTargetsPrice.value[tsym];

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits()

  } catch (error) {
    console.error('Failed to place order for position:', error);
    toastMessage.value = 'Failed to place order for SL/Target';
    showToast.value = true;
  }
};

// Close all positions for Flattrade & Shoonya
const closeAllPositions = async () => {
  try {
    let positionsClosed = false;

    if (selectedBroker.value?.brokerName === 'Flattrade') {
      // Sort positions by netqty (descending) to prioritize 'S' positions
      const sortedPositions = [...flatTradePositionBook.value].sort((a, b) => Number(b.netqty) - Number(a.netqty));
      for (const position of sortedPositions) {
        const netqty = Number(position.netqty);
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B';
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;
        }
      }
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      // Sort positions by netqty (descending) to prioritize 'S' positions
      const sortedPositions = [...shoonyaPositionBook.value].sort((a, b) => Number(b.netqty) - Number(a.netqty));
      for (const position of sortedPositions) {
        const netqty = Number(position.netqty);
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B';
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;
        }
      }
    }

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits()

    if (positionsClosed) {
      toastMessage.value = `All ${selectedBroker.value?.brokerName} positions closed successfully`;
    } else {
      toastMessage.value = `No positions to close for ${selectedBroker.value?.brokerName}`;
    }
    showToast.value = true;
  } catch (error) {
    console.error('Error closing positions:', error);
    toastMessage.value = 'Failed to close all positions';
    showToast.value = true;
  }
};

// Add this to your reactive variables
const selectedShoonyaPositionsSet = ref(new Set());
const selectedFlattradePositionsSet = ref(new Set());

// Function to close selected positions based on the selected broker
const closeSelectedPositions = async () => {
  try {
    let positionsClosed = false;

    if (selectedBroker.value?.brokerName === 'Shoonya') {
      // Create a copy of the selected positions to iterate over
      const positionsToClose = [...selectedShoonyaPositionsSet.value];

      for (const tsym of positionsToClose) {
        const position = shoonyaPositionBook.value.find(p => p.tsym === tsym);
        const netqty = Number(position.netqty);
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B';
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;

          // Remove the closed position from the selected positions
          selectedShoonyaPositionsSet.value.delete(tsym);
        }
      }
    } else if (selectedBroker.value?.brokerName === 'Flattrade') {
      // Create a copy of the selected positions to iterate over
      const positionsToClose = [...selectedFlattradePositionsSet.value];

      for (const tsym of positionsToClose) {
        const position = flatTradePositionBook.value.find(p => p.tsym === tsym);
        const netqty = Number(position.netqty);
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B';
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;

          // Remove the closed position from the selected positions
          selectedFlattradePositionsSet.value.delete(tsym);
        }
      }
    }

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits();

    if (positionsClosed) {
      toastMessage.value = `Selected positions closed successfully`;
    } else {
      toastMessage.value = `No positions to close`;
    }
    showToast.value = true;
  } catch (error) {
    console.error('Error closing selected positions:', error);
    toastMessage.value = 'Failed to close selected positions';
    showToast.value = true;
  }
};
const cancelOrder = async (order) => {
  const orderId = order.norenordno;
  const orderStatus = order.status;

  console.log(`Attempting to cancel order ${orderId} with status ${orderStatus}`);
  // console.log(`Broker: ${selectedBroker.value?.brokerName}`);

  if (orderStatus !== 'OPEN') {
    console.log(`Order ${orderId} is not in a cancellable state and cannot be canceled.`);
    return;
  }

  try {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value;
      const clientId = selectedBroker.value.clientId;
      console.log(`Sending request to cancel Flattrade order ${orderId}`);
      await axios.post('http://localhost:3000/flattradeCancelOrder', {
        norenordno: orderId,
        uid: clientId
      }, {
        params: {
          FLATTRADE_API_TOKEN: jKey
        }
      });
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value;
      const clientId = selectedBroker.value.clientId;
      console.log(`Sending request to cancel Shoonya order ${orderId}`);
      await axios.post('http://localhost:3000/shoonyaCancelOrder', {
        norenordno: orderId,
        uid: clientId
      }, {
        params: {
          SHOONYA_API_TOKEN: jKey
        }
      });
    }
    console.log(`Order ${orderId} canceled successfully.`);
    // Update fund limits
    await updateFundLimits();
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    toastMessage.value = 'Failed to cancel order';
    showToast.value = true;
    throw error; // Rethrow to handle in cancelPendingOrders
  }
};

const cancelPendingOrders = async () => {

  // Fetch orders based on the selected broker
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    await fetchFlattradeOrdersTradesBook();
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    await fetchShoonyaOrdersTradesBook();
  }

  let pendingOrders;
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    pendingOrders = flatOrderBook.value.filter(order => order.status === 'OPEN');
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    pendingOrders = shoonyaOrderBook.value.filter(order => order.status === 'OPEN');
  } else {
    console.error('Unknown broker');
    return;
  }

  const cancelPromises = pendingOrders.map(order => cancelOrder(order));
  console.log(`Canceling pending orders for broker: ${selectedBroker.value?.brokerName}`);  // placed here to prevent delay and debugging if required
  console.log(`Pending orders:`, pendingOrders); // placed here to prevent delay and debugging if required

  try {
    await Promise.all(cancelPromises);
    toastMessage.value = 'Pending orders canceled successfully';
    showToast.value = true;

    // Refresh the orders list based on the selected broker
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      await fetchFlattradeOrdersTradesBook();
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      await fetchShoonyaOrdersTradesBook();
    }
  } catch (error) {
    console.error('Failed to cancel orders:', error);
    toastMessage.value = 'Failed to cancel some orders';
    showToast.value = true;
  }
};
const formatPrice = (price) => {
  if (price == null || isNaN(price)) {
    return '-';
  }
  const numPrice = Number(price);
  return numPrice.toFixed(2);
};
const getSymbol = (position) => {
  return position.tsym || position.tradingSymbol || '';
};
// Modify the setStoplossAndTarget function
const setStoplossAndTarget = (position) => {
  const tsym = getSymbol(position);
  if (!tsym) return;

  const netQty = Number(position.netQty || position.netqty);
  const isLong = netQty > 0;
  const currentLTP = Number(positionLTPs.value[tsym] || 0);

  if (tradeSettings.enableStoploss) {
    let stoplossPrice = isLong
      ? currentLTP - tradeSettings.stoplossValue
      : currentLTP + tradeSettings.stoplossValue;

    // Ensure stoploss price is not negative for long positions
    if (isLong && stoplossPrice <= 0) {
      console.log(`Stoploss for ${tsym} would be negative or zero. Disabling stoploss.`);
      delete positionStoplossesPrice.value[tsym];
      tradeSettings.enableStoploss = false;
    } else {
      positionStoplossesPrice.value[tsym] = stoplossPrice;
    }
  } else {
    delete positionStoplossesPrice.value[tsym];
  }

  if (tradeSettings.enableTarget) {
    positionTargetsPrice.value[tsym] = isLong
      ? currentLTP + tradeSettings.targetValue
      : currentLTP - tradeSettings.targetValue;
  } else {
    delete positionTargetsPrice.value[tsym];
  }

  console.log(`Set SL/Target for ${tsym}: LTP=${currentLTP}, SL Price=${positionStoplossesPrice.value[tsym]}, Target Price=${positionTargetsPrice.value[tsym]}`);

  localStorage.setItem('positionStoplossesPrice', JSON.stringify(positionStoplossesPrice.value));
  localStorage.setItem('positionTargetsPrice', JSON.stringify(positionTargetsPrice.value));
  saveTradeSettings();
};
// Add this to your reactive variables
const positionsInExecution = ref({});

// Modify the checkStoplossAndTarget function
const checkStoplossAndTarget = (position, currentLTP) => {
  const tsym = getSymbol(position);
  if (!tsym) {
    console.error('Invalid position object:', position);
    return;
  }
  const netQty = Number(position.netQty || position.netqty);

  if (netQty === 0 || positionsInExecution.value[tsym]) {
    return;
  }

  const stoplossPrice = positionStoplossesPrice.value[tsym];
  const targetPrice = positionTargetsPrice.value[tsym];

  const isLong = netQty > 0;

  console.log(`Checking ${tsym}: LTP=${currentLTP}, SL Price=${stoplossPrice}, Target Price=${targetPrice}, IsLong=${isLong}`);

  const executeOrder = (orderType, reason) => {
    console.log(`${reason} for ${isLong ? 'long' : 'short'} position ${tsym}`);
    positionsInExecution.value[tsym] = true;
    placeOrderForPosition(orderType, tsym.includes('CE') || tsym.includes('C') ? 'C' : 'P', position)
      .finally(() => {
        delete positionsInExecution.value[tsym];
      });
  };

  if (isLong) {
    if (tradeSettings.enableStoploss && stoplossPrice && currentLTP <= stoplossPrice) {
      executeOrder('S', 'Stoploss hit');
    } else if (tradeSettings.enableTarget && targetPrice && currentLTP >= targetPrice) {
      executeOrder('S', 'Target hit');
    }
  } else {
    if (tradeSettings.enableStoploss && stoplossPrice && currentLTP >= stoplossPrice) {
      executeOrder('B', 'Stoploss hit');
    } else if (tradeSettings.enableTarget && targetPrice && currentLTP <= targetPrice) {
      executeOrder('B', 'Target hit');
    }
  }
};
const continuouslyCheckPositions = () => {
  [...flatTradePositionBook.value, ...shoonyaPositionBook.value].forEach(position => {
    const tsym = getSymbol(position);
    const stoplossPrice = positionStoplossesPrice.value[tsym];
    const targetPrice = positionTargetsPrice.value[tsym];

    // Skip if both stoploss and target are undefined or disabled
    if ((!stoplossPrice && !targetPrice) || (!tradeSettings.enableStoploss && !tradeSettings.enableTarget)) {
      return;
    }

    const currentLTP = positionLTPs.value[tsym];
    if (currentLTP) {
      checkStoplossAndTarget(position, currentLTP);
    }
  });
};

const availableBalance = computed(() => {
  // console.log('Fund Limits:', fundLimits.value);
  // console.log('Selected Broker:', selectedBroker.value?.brokerName);

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    const cash = (Number(fundLimits.value.cash) || 0) + (Number(fundLimits.value.payin) || 0);
    const marginUsed = Number(fundLimits.value.marginused) || 0;
    const balance = cash - marginUsed;
    // console.log('Flattrade Available Balance:', balance);
    return balance;
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    const cash = (Number(fundLimits.value.cash) || 0) + (Number(fundLimits.value.payin) || 0);
    const marginUsed = Number(fundLimits.value.marginused) || 0;
    const balance = cash - marginUsed;
    // console.log('Shoonya Available Balance:', balance);
    return balance;
  }
  return null;
});
// Computed property to get the correct utilized amount based on the selected broker
const usedAmount = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    const spanMargin = Number(fundLimits.value.span) || 0;
    const expoMargin = Number(fundLimits.value.expo) || 0;
    const premiumMargin = Number(fundLimits.value.premium) || 0;
    const equityMargin = Number(fundLimits.value.varelm) || 0;
    const marginUsed = Number(fundLimits.value.marginUsed) || 0;
    const utilizedMargin = (spanMargin + expoMargin + premiumMargin + equityMargin + marginUsed);
    return utilizedMargin;
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    const spanMargin = Number(fundLimits.value.span) || 0;
    const expoMargin = Number(fundLimits.value.expo) || 0;
    const premiumMargin = Number(fundLimits.value.premium) || 0;
    const equityMargin = Number(fundLimits.value.varelm) || 0;
    const marginUsed = Number(fundLimits.value.marginUsed) || 0;
    const utilizedMargin = (spanMargin + expoMargin + premiumMargin + equityMargin + marginUsed);
    return utilizedMargin;
  }
  return 0;
});

const formattedDate = computed(() => {
  const today = new Date();
  const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  return today.toLocaleDateString('en-US', options).replace(/,/g, '');
});

const totalNetQty = computed(() => {
  const calculateTotalQty = (positions) => {
    return positions.reduce((total, position) => {
      const qty = Math.abs(parseInt(position.netQty || position.netqty, 10));
      return total + qty;
    }, 0);
  };

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return calculateTotalQty(flatTradePositionBook.value);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return calculateTotalQty(shoonyaPositionBook.value);
  }
  return 0;
});

const totalProfit = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
    return positionsWithCalculatedProfit.value.reduce((acc, position) => {
      const unrealizedProfit = position.calculatedUrmtom;
      const realizedProfit = parseFloat(position.rpnl) || 0;
      return acc + unrealizedProfit + realizedProfit;
    }, 0);
  }
  return 0;
});

const calculateUnrealizedProfit = (position) => {
  const ltp = positionLTPs.value[position.tsym || position.tradingSymbol] || position.lp || position.lastPrice;
  const netQty = parseFloat(position.netqty || position.netQty);
  const netAvgPrice = parseFloat(position.netavgprc || position.averagePrice);
  const priceFactor = parseFloat(position.prcftr || position.multiplier || 1);

  if (ltp && !isNaN(netQty) && !isNaN(netAvgPrice)) {
    return netQty * (ltp - netAvgPrice) * priceFactor;
  }
  return 0;
};

const positionsWithCalculatedProfit = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.map(position => ({
      ...position,
      calculatedUrmtom: calculateUnrealizedProfit(position)
    }));
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.map(position => ({
      ...position,
      calculatedUrmtom: calculateUnrealizedProfit(position)
    }));
  }
  return [];
});

const totalCapitalPercentage = computed(() => {
  const totalMoney = Number(availableBalance.value) + Number(usedAmount.value);
  return totalMoney ? (Number(totalProfit.value) / totalMoney) * 100 : 0;
});
const deployedCapitalPercentage = computed(() => {
  const totalUsedAmount = totalBuyValue.value + totalSellValue.value || 0;
  return totalUsedAmount ? (totalProfit.value / totalUsedAmount) * 100 : 0;
});

const totalBrokerage = computed(() => {
  let total = 0;

  // Calculate totalValue based on totalBuyValue and totalSellValue
  const totalEquityValue = totalEquityBuyValue.value + totalEquitySellValue.value;
  const totalDerivativeValue = totalDerivativeBuyValue.value + totalDerivativeSellValue.value;  

  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
    // Calculate charges for Flattrade and Shoonya (they have the same structure)
    const equityExchangeCharge = Math.round(totalEquityValue * 0.00003485 * 100) / 100; //avage price from both exchange
    const equityIpftCharge = Math.round(totalEquityValue * 0.000001 * 100) / 100;
    const equitySebiCharge = Math.round(totalEquityValue * 0.000001 * 100) / 100;
    const equityGstCharge = Math.round((equityExchangeCharge + equitySebiCharge + equityIpftCharge) * 18) / 100;
    const equityStampdutyCharge = Math.round(totalEquityBuyValue.value * 0.00003);
    const equitySttCharge = Math.round(totalEquitySellValue.value * 0.00025);

    const derivativesExchangeCharge = Math.round(totalDerivativeValue * 0.000495 * 100) / 100;
    const derivativesIpftCharge = Math.round(totalDerivativeValue * 0.000005 * 100) / 100;
    const derivativesSebiCharge = Math.round(totalDerivativeValue * 0.000001 * 100) / 100;
    const derivativesGstCharge = Math.round((derivativesExchangeCharge + derivativesIpftCharge + derivativesSebiCharge) * 18) / 100;
    const derivativesStampdutyCharge = Math.round(totalDerivativeBuyValue.value * 0.00003);
    const derivativesSttCharge = Math.round(totalDerivativeSellValue.value * 0.000625);

    // Add charges to total for Flattrade and Shoonya
    total += (equityExchangeCharge + equityIpftCharge + equitySebiCharge + equityGstCharge + equityStampdutyCharge + equitySttCharge + derivativesExchangeCharge + derivativesIpftCharge + derivativesSebiCharge + derivativesGstCharge + derivativesStampdutyCharge + derivativesSttCharge);

    // No additional brokerage for Flattrade and Shoonya
  }

  return total;
});


const netPnl = computed(() => totalProfit.value - totalBrokerage.value);

const setDefaultExpiry = () => {
  if (expiryDates.value.length > 0) {
    selectedExpiry.value = expiryDates.value[0];
  }
};

const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
const currentClockEmoji = ref(clockEmojis[new Date().getHours() % clockEmojis.length]);

const cycleClockEmoji = () => {
  const currentHour = new Date().getHours();
  let index = currentHour % clockEmojis.length;
  let cycles = 0;

  const interval = setInterval(() => {
    currentClockEmoji.value = clockEmojis[index];
    index = (index + 1) % clockEmojis.length;

    if (index === currentHour % clockEmojis.length) {
      cycles += 1;
    }

    if (cycles === 1 && index === currentHour % clockEmojis.length) { // Complete one full cycle
      clearInterval(interval);
      currentClockEmoji.value = clockEmojis[currentHour % clockEmojis.length]; // Ensure it ends at the current hour
    }
  }, 100); // Adjust the interval time for desired speed
};

const setFlattradeCredentials = async () => {
  try {
    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
      toastMessage.value = 'Realtime LTP data only available for Flattrade';
      showToast.value = true;
      return;
    }

    // Check if the broker status is 'Connected'
    if (brokerStatus.value !== 'Connected') {
      console.error('Flattrade broker is not connected');
      toastMessage.value = 'Flattrade broker is not connected';
      showToast.value = true;
      return;
    }

    const clientId = selectedBroker.value.clientId;
    const apiToken = localStorage.getItem('FLATTRADE_API_TOKEN');

    if (!clientId || !apiToken) {
      console.error('Flattrade client ID or API token is missing');
      toastMessage.value = 'Flattrade credentials are missing';
      showToast.value = true;
      return;
    }

    const response = await axios.post('http://localhost:3000/api/set-flattrade-credentials', {
      usersession: apiToken,
      userid: clientId
    });
    // console.log('Credentials set successfully:', response.data);
    toastMessage.value = 'Flattrade credentials set successfully';
    showToast.value = true;
  } catch (error) {
    console.error('Error setting credentials :', error);
    toastMessage.value = 'Failed to set Flattrade credentials';
    showToast.value = true;
  }
};
const setShoonyaCredentials = async () => {
  try {
    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
      toastMessage.value = 'Realtime LTP data only available for Shoonya';
      showToast.value = true;
      return;
    }

    // Check if the broker status is 'Connected'
    if (brokerStatus.value !== 'Connected') {
      console.error('Flattrade broker is not connected');
      toastMessage.value = 'Flattrade broker is not connected';
      showToast.value = true;
      return;
    }

    const clientId = selectedBroker.value.clientId;
    const apiToken = localStorage.getItem('SHOONYA_API_TOKEN');

    if (!clientId || !apiToken) {
      console.error('Shoonya client ID or API token is missing');
      toastMessage.value = 'Shoonya credentials are missing';
      showToast.value = true;
      return;
    }

    const response = await axios.post('http://localhost:3000/api/set-shoonya-credentials', {
      usersession: apiToken,
      userid: clientId
    });
    // console.log('Credentials set successfully:', response.data);
    toastMessage.value = 'Shoonya credentials set successfully';
    showToast.value = true;
  } catch (error) {
    console.error('Error setting credentials: ', error);
    toastMessage.value = 'Failed to set Shoonya credentials';
    showToast.value = true;
  }
};

const socket = ref(null);
const latestCallLTP = ref('N/A');
const latestPutLTP = ref('N/A');

const defaultCallSecurityId = ref(null);
const defaultPutSecurityId = ref(null);

const connectWebSocket = () => {
  let websocketUrl;

  if (selectedBroker.value?.brokerName === 'Flattrade' && brokerStatus.value === 'Connected') {
    websocketUrl = 'ws://localhost:8765';
  } else if (selectedBroker.value?.brokerName === 'Shoonya' && brokerStatus.value === 'Connected') {
    websocketUrl = 'ws://localhost:8766';
  }

  console.log(`Connecting to WebSocket at ${websocketUrl}`);
  socket.value = new WebSocket(websocketUrl);

  // Modify the existing socket.onmessage handler
  socket.value.onmessage = (event) => {
    const quoteData = JSON.parse(event.data);
    // console.log('WebSocket message received:', quoteData);
    if (quoteData.lp) {
      const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value];
      if (symbolInfo && quoteData.tk === symbolInfo.exchangeSecurityId) {
        // Update the price for the selected master symbol
        switch (selectedMasterSymbol.value) {
          case 'NIFTY': niftyPrice.value = quoteData.lp; break;
          case 'BANKNIFTY': bankNiftyPrice.value = quoteData.lp; break;
          case 'FINNIFTY': finniftyPrice.value = quoteData.lp; break;
          case 'MIDCPNIFTY': midcpniftyPrice.value = quoteData.lp; break;
          case 'SENSEX': sensexPrice.value = quoteData.lp; break;
          case 'BANKEX': bankexPrice.value = quoteData.lp; break;
        }
      }
      else if (quoteData.tk === defaultCallSecurityId.value) {
        latestCallLTP.value = quoteData.lp;
        // console.log('Updated Call LTP:', latestCallLTP.value);
      } else if (quoteData.tk === defaultPutSecurityId.value) {
        latestPutLTP.value = quoteData.lp;
        // console.log('Updated Put LTP:', latestPutLTP.value);
      }

      // Update position LTPs
      const positionTsym = Object.keys(positionSecurityIds.value).find(tsym => positionSecurityIds.value[tsym] === quoteData.tk);
      if (positionTsym) {
        positionLTPs.value[positionTsym] = quoteData.lp;
      }
    }
  };

  socket.value.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  socket.value.onopen = () => {
    console.log('WebSocket connected');
    initializeSubscriptions();
  };

  socket.value.onclose = () => {
    console.log('WebSocket disconnected. Attempting to reconnect...');
    setTimeout(connectWebSocket, 5000);
  };
};
const currentSubscriptions = ref({
  masterSymbol: null,
  callOption: null,
  putOption: null
});

// Add these new reactive variables
const positionLTPs = ref({});
const positionSecurityIds = ref({});

const subscribeToMasterSymbol = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value];
    if (symbolInfo) {
      const symbolToSubscribe = `${symbolInfo.exchangeCode}|${symbolInfo.exchangeSecurityId}`;
      if (symbolToSubscribe !== `${currentSubscriptions.value.masterSymbolExchangeCode}|${currentSubscriptions.value.masterSymbolSecurityId}`) {
        const data = {
          action: 'subscribe',
          symbols: [symbolToSubscribe]
        };
        // console.log('Sending master symbol subscribe data:', data);
        socket.value.send(JSON.stringify(data));
        currentSubscriptions.value.masterSymbol = selectedMasterSymbol.value;
        currentSubscriptions.value.masterSymbolExchangeCode = symbolInfo.exchangeCode;
        currentSubscriptions.value.masterSymbolSecurityId = symbolInfo.exchangeSecurityId;
      }
    }
  }
};

const subscribeToOptions = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const symbolsToSubscribe = [];
    const exchangeSegment = getExchangeSegment();

    // Add subscriptions for Call and Put options
    if (defaultCallSecurityId.value && defaultCallSecurityId.value !== 'N/A' && defaultCallSecurityId.value !== currentSubscriptions.value.callOption) {
      symbolsToSubscribe.push(`${exchangeSegment}|${defaultCallSecurityId.value}`);
    }
    if (defaultPutSecurityId.value && defaultPutSecurityId.value !== 'N/A' && defaultPutSecurityId.value !== currentSubscriptions.value.putOption) {
      symbolsToSubscribe.push(`${exchangeSegment}|${defaultPutSecurityId.value}`);
    }

    if (symbolsToSubscribe.length > 0) {
      const data = {
        action: 'subscribe',
        symbols: symbolsToSubscribe
      };
      // console.log('Sending options subscribe data:', data);
      socket.value.send(JSON.stringify(data));
      currentSubscriptions.value.callOption = defaultCallSecurityId.value;
      currentSubscriptions.value.putOption = defaultPutSecurityId.value;
    }
  }

  // Subscribe to position LTPs separately
  subscribeToPositionLTPs();
};
// Add a new function to update position security IDs
const updatePositionSecurityIds = () => {
  flatTradePositionBook.value.forEach(position => {
    if (position.tsym && !positionSecurityIds.value[position.tsym]) {
      positionSecurityIds.value[position.tsym] = position.token;
    }
  });
  // Add this block for Shoonya positions
  shoonyaPositionBook.value.forEach(position => {
    if (position.tsym && !positionSecurityIds.value[position.tsym]) {
      positionSecurityIds.value[position.tsym] = position.token;
    }
  });
};
const subscribeToPositionLTPs = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const symbolsToSubscribe = Object.entries(positionSecurityIds.value)
      .map(([tsym, token]) => {
        const position = [
          ...flatTradePositionBook.value,
          ...shoonyaPositionBook.value,
        ].find(p => (p.tsym) === tsym);

        if (!position) {
          // console.warn(`No position found for tsym: ${tsym}`);
          return null;
        }

        const exchange = position.exch || position.exchangeSegment;
        return `${exchange}|${token}`;
      })
      .filter(Boolean);

    if (symbolsToSubscribe.length > 0) {
      const data = {
        action: 'subscribe',
        symbols: symbolsToSubscribe
      };
      // console.log('Sending position LTPs subscribe data:', data);
      socket.value.send(JSON.stringify(data));
    }
  }
};
// Add a watcher for flatTradePositionBook
watch(flatTradePositionBook, () => {
  updatePositionSecurityIds();
  subscribeToOptions();
}, { deep: true });
// Add this watcher after the existing watcher for flatTradePositionBook
watch(shoonyaPositionBook, () => {
  updatePositionSecurityIds();
  subscribeToOptions();
}, { deep: true });

const unsubscribeFromSymbols = (symbols) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN && symbols.length > 0) {
    const data = {
      action: 'unsubscribe',
      symbols: symbols
    };
    // console.log('Sending unsubscribe data:', data);
    socket.value.send(JSON.stringify(data));
  }
};

const updateSubscriptions = () => {
  const symbolsToUnsubscribe = [];

  // Check if master symbol has changed
  if (currentSubscriptions.value.masterSymbol !== selectedMasterSymbol.value) {
    if (currentSubscriptions.value.masterSymbol) {
      const oldSymbolInfo = exchangeSymbols.value.symbolData[currentSubscriptions.value.masterSymbol];
      if (oldSymbolInfo) {
        symbolsToUnsubscribe.push(`${oldSymbolInfo.exchangeCode}|${oldSymbolInfo.exchangeSecurityId}`);
      }
    }
  }

  // Check if options have changed
  if (currentSubscriptions.value.callOption && currentSubscriptions.value.callOption !== defaultCallSecurityId.value) {
    symbolsToUnsubscribe.push(`NFO|${currentSubscriptions.value.callOption}`);
  }
  if (currentSubscriptions.value.putOption && currentSubscriptions.value.putOption !== defaultPutSecurityId.value) {
    symbolsToUnsubscribe.push(`NFO|${currentSubscriptions.value.putOption}`);
  }

  // Unsubscribe from old symbols
  if (symbolsToUnsubscribe.length > 0) {
    unsubscribeFromSymbols(symbolsToUnsubscribe);
  }

  // Subscribe to new symbols
  subscribeToMasterSymbol();
  subscribeToOptions();
  subscribeToPositionLTPs();
};
const initializeSubscriptions = () => {
  subscribeToMasterSymbol();
  subscribeToOptions();
};
const debouncedUpdateSubscriptions = debounce(updateSubscriptions, 300);

const totalBuyValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0);
  }
  if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0);
  }
  return 0;
});

const totalSellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  }
  if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  }
  return 0;
});

const totalEquityBuyValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter(position => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter(position => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0);
  }
  return 0;
});

const totalEquitySellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter(position => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter(position => position.exch === 'BSE' || position.exch === 'NSE') 
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  }
  return 0;
});

const totalDerivativeBuyValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter(position => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter(position => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0);
  }
  return 0;
});

const totalDerivativeSellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter(position => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter(position => position.exch === 'BFO' || position.exch === 'NFO') 
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  }
  return 0;
});

let timer;
let positionCheckInterval;

// Discipline Automations
const totalRiskType = ref(null);
const mtmProfitTrailingToggle = ref(false);
const totalRiskTypeToggle = ref(false);
const mtmProfitTrailingType = ref(null);
const totalRiskAmount = ref(null);
const totalRiskPercentage = ref(null);
const closePositionsRisk = ref(true);

// Lifecycle hooks
onMounted(async () => {
  await checkAllTokens();
  initKillSwitch();
  const storedBroker = localStorage.getItem('selectedBroker');
  if (storedBroker) {
    const brokerDetails = JSON.parse(storedBroker);
    selectedBroker.value = brokerDetails;
    selectedBrokerName.value = brokerDetails.brokerName;
  }
  updateExchangeSymbols()
  setDefaultExchangeAndMasterSymbol()
  fetchTradingData()
  updateAvailableQuantities()
  loadLots();
  updateSelectedQuantity();
  setDefaultExpiry()

  window.addEventListener('keydown', handleHotKeys);

  // Initialize with the default active tab
  if (activeTab.value === 'positions') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      fetchFlattradePositions();
      activeFetchFunction.value = 'fetchFlattradePositions';
    }
    if (selectedBroker.value?.brokerName === 'Shoonya') {
      fetchShoonyaPositions();
      activeFetchFunction.value = 'fetchShoonyaPositions';
    }
  }
  if (activeTab.value === 'trades') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      fetchFlattradeOrdersTradesBook();
      activeFetchFunction.value = 'fetchFlattradeOrdersTradesBook';
    }
    if (selectedBroker.value?.brokerName === 'Shoonya') {
      fetchShoonyaOrdersTradesBook();
      activeFetchFunction.value = 'fetchShoonyaOrdersTradesBook';
    }
  }
  enableHotKeys.value = localStorage.getItem('EnableHotKeys') !== 'false';

  timer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  connectWebSocket();

  // Load stoploss and target values from localStorage
  positionStoplosses.value = JSON.parse(localStorage.getItem('positionStoplosses') || '{}');
  positionTargets.value = JSON.parse(localStorage.getItem('positionTargets') || '{}');
  positionStoplossesPrice.value = JSON.parse(localStorage.getItem('positionStoplossesPrice') || '{}');
  positionTargetsPrice.value = JSON.parse(localStorage.getItem('positionTargetsPrice') || '{}');
  // Start continuous position checking
  positionCheckInterval = setInterval(continuouslyCheckPositions, 1000); // Check every second
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHotKeys);
  if (socket.value) {
    socket.value.close();
  }
  clearInterval(timer);
  if (positionCheckInterval) {
    clearInterval(positionCheckInterval);
  }
});

// Watchers
// Watch for changes in selectedBrokerName
watch(selectedBrokerName, () => {
  updateSelectedBroker();
});
watch(selectedBroker, async (newBroker) => {
  if (newBroker) {
    selectedOrderType.value = orderTypes.value[0];
    previousOrderType.value = orderTypes.value[0];
    selectedProductType.value = getProductTypeValue(productTypes.value[1]); // Default to 'Margin' or 'M'
    await fetchFundLimit();
    updateExchangeSymbols();
    setDefaultExchangeAndMasterSymbol();
    await fetchTradingData();
    setDefaultExpiry();

    // Update the table based on the active tab
    if (activeTab.value === 'positions') {
      if (newBroker.brokerName === 'Flattrade') {
        activeFetchFunction.value = 'fetchFlattradePositions';
        await fetchFlattradePositions();
      }
      else if (newBroker.brokerName === 'Shoonya') {
        activeFetchFunction.value = 'fetchShoonyaPositions';
        await fetchShoonyaPositions();
      }
    } else if (activeTab.value === 'trades') {
      if (newBroker.brokerName === 'Flattrade') {
        activeFetchFunction.value = 'fetchFlattradeOrdersTradesBook';
        await fetchFlattradeOrdersTradesBook();
      }
      else if (newBroker.brokerName === 'Shoonya') {
        activeFetchFunction.value = 'fetchShoonyaOrdersTradesBook';
        await fetchShoonyaOrdersTradesBook();
      }
    }
  }
});

// Watcher for selectedExpiry to repopulate strike prices
watch(selectedExpiry, async (newExpiry) => {
  await fetchTradingData();
  updateStrikesForExpiry(newExpiry);
});

watch(selectedCallStrike, (newStrike, oldStrike) => {
  // console.log('Selected Call Strike changed:', newStrike);
  if (newStrike !== oldStrike) {
    defaultCallSecurityId.value = newStrike.securityId || 'N/A';
  }
});

watch(selectedPutStrike, (newStrike, oldStrike) => {
  // console.log('Selected Put Strike changed:', newStrike);
  if (newStrike !== oldStrike) {
    defaultPutSecurityId.value = newStrike.securityId || 'N/A';
  }
});

// Watchers for defaultCallSecurityId and defaultPutSecurityId
// This watcher handles unsubscribing and subscribing to new security IDs,
// setting Flattrade credentials, and sending WebSocket data when either ID changes.
// Modify the watcher for defaultCallSecurityId and defaultPutSecurityId
watch(
  [
    () => defaultCallSecurityId.value,
    () => defaultPutSecurityId.value
  ],
  ([newCallId, newPutId], [oldCallId, oldPutId]) => {
    if (newCallId !== oldCallId || newPutId !== oldPutId) {
      debouncedUpdateSubscriptions();

      // Reset LTP values when subscribing to new symbols
      if (newCallId !== oldCallId) {
        latestCallLTP.value = 'N/A';
      }
      if (newPutId !== oldPutId) {
        latestPutLTP.value = 'N/A';
      }

      if (selectedBroker.value?.brokerName === 'Flattrade') {
        setFlattradeCredentials();
      }
      if (selectedBroker.value?.brokerName === 'Shoonya') {
        setShoonyaCredentials();
      }
    }
  },
  { deep: true }
);

// Modify the watcher for selectedMasterSymbol
watch(selectedMasterSymbol, async (newValue, oldValue) => {
  // console.log('selectedMasterSymbol changed:', newValue);
  saveUserChoice();
  updateAvailableQuantities();
  updateSelectedQuantity();

  // Fetch new trading data and update expiry
  await fetchTradingData();
  setDefaultExpiry();

  // Force re-synchronization of strikes
  synchronizeCallStrikes();
  synchronizePutStrikes();

  // Update subscriptions
  debouncedUpdateSubscriptions();
});


// Watch productTypes to set the default selectedProductType
watch(productTypes, (newProductTypes) => {
  if (newProductTypes.length > 0) {
    selectedProductType.value = getProductTypeValue(newProductTypes[1]); // Default to 'Margin' or 'M'
  }
}, { immediate: true });

// Add a watcher for selectedExchange
watch(selectedExchange, (newValue) => {
  saveUserChoice(); // Save the user's choice
  if (exchangeSymbols.value[newValue].length > 0) {
    const savedMasterSymbol = localStorage.getItem('selectedMasterSymbol');
    selectedMasterSymbol.value = savedMasterSymbol && exchangeSymbols.value[newValue].includes(savedMasterSymbol)
      ? savedMasterSymbol
      : exchangeSymbols.value[newValue][0];
  } else {
    selectedMasterSymbol.value = null;
  }
  updateAvailableQuantities();
});

watch(selectedOrderType, (newValue, oldValue) => {
  previousOrderType.value = oldValue;
});

const activeFetchFunction = ref(null);

watch(activeTab, async (newTab) => {
  // Update activeFetchFunction based on the new broker
  if (newTab === 'positions') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      activeFetchFunction.value = 'fetchFlattradePositions';
      await fetchFlattradePositions();
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      activeFetchFunction.value = 'fetchShoonyaPositions';
      await fetchShoonyaPositions();
    }
  } else if (newTab === 'trades') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      activeFetchFunction.value = 'fetchFlattradeOrdersTradesBook';
      await fetchFlattradeOrdersTradesBook();
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      activeFetchFunction.value = 'fetchShoonyaOrdersTradesBook';
      await fetchShoonyaOrdersTradesBook();
    }
  }
});

// Watcher to update localStorage when enableHotKeys changes
watch(enableHotKeys, (newValue) => {
  localStorage.setItem('EnableHotKeys', newValue.toString());
});

// Debounce the checkStoplossAndTarget function
const debouncedCheckStoplossAndTarget = debounce(checkStoplossAndTarget, 500); // Debounce with a 500ms delay

// Modify the existing watcher for positionLTPs
watch(positionLTPs, (newLTPs, oldLTPs) => {
  // console.log('positionLTPs updated:', newLTPs);
  Object.entries(newLTPs).forEach(([tsym, ltp]) => {
    if (ltp !== oldLTPs[tsym]) {
      console.log(`LTP changed for ${tsym}: ${oldLTPs[tsym]} -> ${ltp}`);
      const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
        .find(p => (p.tsym || p.tradingSymbol) === tsym);
      if (position) {
        console.log(`Found position for ${tsym}:`, position);
        debouncedCheckStoplossAndTarget(position, ltp);
      } else {
        console.log(`No position found for ${tsym}`);
      }
    }
  });
}, { deep: true });

// Add watchers for enableStoploss, stoplossValue, enableTarget, and targetValue
watch(() => [tradeSettings.enableStoploss, tradeSettings.stoplossValue, tradeSettings.enableTarget, tradeSettings.targetValue], () => {
  const allPositions = [...flatTradePositionBook.value, ...shoonyaPositionBook.value];
  allPositions.forEach(setStoplossAndTarget);
});
// // Modify the existing watchers for position books to set initial stoploss and target
// watch([flatTradePositionBook, shoonyaPositionBook, positionLTPs], () => {
//   const allPositions = [...flatTradePositionBook.value, ...shoonyaPositionBook.value];
//   allPositions.forEach(setStoplossAndTarget);
// }, { deep: true });
// Modify the existing watcher for tradeSettings
watch(tradeSettings, (newSettings, oldSettings) => {
  console.log('Trade settings changed:', newSettings, oldSettings);
  saveTradeSettings();
  const allPositions = [...flatTradePositionBook.value, ...shoonyaPositionBook.value];
  allPositions.forEach(setStoplossAndTarget);
}, { deep: true });
</script>
