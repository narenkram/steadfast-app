<template>
  <!-- Brokers, Broker Status, Total Funds, Utilized Margin & Today's Date -->
  <section class="row py-3">
    <div class="col-12">

      <div class="row">

        <!-- Change Broker -->
        <div class="col-2">
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
        <div class="col-3 text-center">
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

        <!-- Total Funds -->
        <div class="col-3 text-center">
          <p class="mb-1"><b>Total Funds</b></p>
          <p class="mt-2 mb-0">
            ₹ {{ availableBalance !== null ? availableBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 }) :
              'N/A' }}
          </p>
        </div>

        <!-- Utilized Margin -->
        <div class="col-2 text-center">
          <p class="mb-1"><b>Utilized Margin</b></p>
          <p class="mt-2 mb-0">₹ {{ usedAmount || null }}</p>
        </div>

        <!-- Today's date -->
        <div class="col-2 text-end">
          <p class="mb-1"><b>Today's date</b></p>
          <p class="mt-2 mb-0">{{ formattedDate }}</p>
        </div>

      </div>

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
    <div class="col-5">
      <div class="Card">
        <blockquote class="fs-3"
          :class="totalProfit > 0 ? 'text-success' : totalProfit < 0 ? 'text-danger' : 'text-dark'">
          ₹ {{ totalProfit.toFixed(2) }}
        </blockquote>
        <small>
          <span :class="netPnl > 0 ? 'text-success' : netPnl < 0 ? 'text-danger' : 'text-dark'">
            ₹ {{ netPnl.toFixed(2) }}
          </span>
          Estimated Net PNL (after brokerage)
        </small>
      </div>
    </div>
    <div class="col-4">
      <div class="Card">
        <blockquote class="fs-3 text-center m-0">
          <span
            :class="totalCapitalPercentage > 0 ? 'text-success' : totalCapitalPercentage < 0 ? 'text-danger' : 'text-dark'">
            {{ totalCapitalPercentage.toFixed(2) }}%
          </span>
          <br />
          <small> on Total Capital</small>
        </blockquote>
        <small v-if="totalNetQty !== 0">{{ deployedCapitalPercentage.toFixed(2) }}% on Deployed Capital</small>
      </div>
    </div>
    <div class="col-3 d-flex justify-content-center align-items-center">
      <div class="Card">
        <div class="card-title">
          <h5>Kill Switch</h5>
        </div>
        <button :class="killSwitchButtonClass" @click="toggleKillSwitch">
          {{ killSwitchButtonText }} <span v-if="killSwitchActive">{{ currentClockEmoji }}</span>
        </button>
      </div>
    </div>
  </section>

  <section class="row py-1">
    <div class="col-12" v-if="killSwitchActive">
      <div class="bg-danger text-white p-3 rounded-3 shadow">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h5 class="mb-2">Kill Switch Activated</h5>
            <p class="mb-0">
              Trading has been blocked for the next 6 hours. Take a break to put your mind at ease.
            </p>
          </div>
          <div class="text-center">
            <span class="bg-white text-dark py-2 px-3 rounded-2 fs-4 fw-bold">
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
          <div class="col-2">
            <label for="Exchange" class="form-label mb-0">Exchange</label>
            <select id="Exchange" class="form-select" aria-label="Exchange" v-model="selectedExchange"
              @change="fetchTradingData" :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="(symbols, exchange) in exchangeSymbols" :key="exchange" :value="exchange">{{
                exchange }}
              </option>
            </select>
          </div>

          <!-- Segment Selection -->
          <div class="col-2">
            <label for="Segment" class="form-label mb-0">Segment</label>
            <select id="Segment" class="form-select" aria-label="Segment" :class="{ 'disabled-form': isFormDisabled }">
              <option value="Options" selected>Options</option>
              <option value="Futures">Futures</option>
            </select>
          </div>

          <!-- Master Symbol Selection -->
          <div class="col-2">
            <label for="MasterSymbol" class="form-label mb-0">Master Symbol</label>
            <select id="MasterSymbol" class="form-select" aria-label="Master Symbol" v-model="selectedMasterSymbol"
              @change="fetchTradingData" :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="symbol in exchangeSymbols[selectedExchange]" :key="symbol" :value="symbol">{{
                symbol }}
              </option>
            </select>
          </div>

          <!-- Expiry Date Selection -->
          <div class="col-2">
            <label for="Expiry" class="form-label mb-0">Expiry Date</label>
            <select id="Expiry" class="form-select" aria-label="Expiry" v-model="selectedExpiry"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="date in expiryDates" :key="date" :value="date">
                {{ formatDate(date) }}
              </option>
            </select>
          </div>

          <!-- Product Type Selection -->
          <div class="col-2">
            <label for="ProductType" class="form-label mb-0">Product Type</label>
            <select id="ProductType" class="form-select" v-model="selectedProductType" aria-label="ProductType"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="productType in productTypes" :key="productType" :value="getProductTypeValue(productType)">
                {{ productType }}
              </option>
            </select>
          </div>

          <!-- Quantity Selection -->
          <div class="col-2">
            <label for="Quantity" class="form-label mb-0">Quantity</label>
            <select id="Quantity" class="form-select" v-model="selectedQuantity" aria-label="Quantity"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="quantity in availableQuantities" :key="quantity" :value="quantity">{{ quantity }}
              </option>
            </select>
          </div>

        </div>

        <div class="row mt-3">
          <!-- Order Type -->
          <div class="col-2">
            <label for="OrderType" class="form-label mb-0">Order Type</label>
            <select id="OrderType" class="form-select" aria-label="OrderType" v-model="selectedOrderType"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="orderType in orderTypes" :key="orderType" :value="orderType">{{ orderType }}
              </option>
            </select>
          </div>
          <!-- Market Protection Order %-->
          <div class="col-3">
            <label for="MarketProtection" class="form-label mb-0">Market Protection Order %</label>
            <select id="MarketProtection" class="form-select" aria-label="Market Protection Order %"
              :class="{ 'disabled-form': isFormDisabled }">
              <option value="1">1%</option>
              <option value="2">2%</option>
              <option value="3">3%</option>
              <option value="4">4%</option>
              <option value="5">5%</option>
            </select>
          </div>
          <!-- Stoploss -->
          <div class="col-2">
            <label for="enableStoploss" class="form-label mb-0">Stoploss</label>
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" id="enableStoploss" aria-label="Enable Stoploss"
                  :class="{ 'disabled-form': isFormDisabled }">
              </div>
              <input type="number" class="form-control" id="stoplossValue" aria-label="Stoploss" value="75"
                :class="{ 'disabled-form': isFormDisabled }">
            </div>
          </div>
          <!-- Target -->
          <div class="col-2">
            <label for="enableTarget" class="form-label mb-0">Target</label>
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" id="enableTarget" aria-label="Enable Target"
                  :class="{ 'disabled-form': isFormDisabled }">
              </div>
              <input type="number" class="form-control" id="targetValue" aria-label="Target" value="75"
                :class="{ 'disabled-form': isFormDisabled }">
            </div>
          </div>
          <!-- 1 Click Keys -->
          <div class="col-3">
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
          <div class="col-3">
            <label for="CallStrike" class="form-label mb-0">Call Strike</label>
            <select id="CallStrike" class="form-select" aria-label="Call Strike" v-model="selectedCallStrike"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="strike in callStrikes" :key="strike.securityId" :value="strike">
                {{ strike.strikePrice }}
              </option>
            </select>
            <div>
              Security ID: {{ defaultCallSecurityId }}
            </div>
            <div>
              {{ selectedCallStrike.tradingSymbol }}
            </div>
            <div>
              Call LTP: <b>{{ latestCallLTP }}</b>
            </div>
          </div>

          <!-- Live Underlying Price -->
          <div class="col-6 text-center">
            <p class="mb-0" v-if="selectedMasterSymbol === 'NIFTY'">Nifty 50: <b>{{ niftyPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'BANKNIFTY'">Bank Nifty: <b>{{ bankNiftyPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'FINNIFTY'">Fin Nifty: <b>{{ finniftyPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'NIFTYNXT50'">Nifty Next 50: <b>{{ niftynxt50Price }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'MIDCPNIFTY'">Nifty Mid Select: <b>{{ midcpniftyPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'SENSEX'">Sensex: <b>{{ sensexPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'BANKEX'">Bankex: <b>{{ bankexPrice }}</b></p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'SENSEX50'">Sensex 50: <b>{{ sensex50Price }}</b></p>
          </div>

          <!-- Put Strike Selection -->
          <div class="col-3">
            <label for="PutStrike" class="form-label mb-0">Put Strike</label>
            <select id="PutStrike" class="form-select" aria-label="Put Strike" v-model="selectedPutStrike"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="strike in putStrikes" :key="strike.securityId" :value="strike">
                {{ strike.strikePrice }}
              </option>
            </select>
            <div>
              Security ID: {{ defaultPutSecurityId }}
            </div>
            <div>
              {{ selectedPutStrike.tradingSymbol }}
            </div>
            <div>
              Put LTP: <b>{{ latestPutLTP }}</b>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Call Strike Buy/Sell Buttons -->
          <div class="col-3">
            <div class="btn-group w-100">
              <button type="button" class="btn btn-lg btn-success fs-5 my-2 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('BUY'), 'CALL')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">⬆️</span>
                Buy CE
              </button>
              <button type="button" class="btn btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent" data-bs-offset="0,-7">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('BUY', 'CALL')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
              </ul>
            </div>
            <div class="btn-group w-100">
              <button type="button" class="btn btn-lg btn-danger fs-5 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('SELL'), 'CALL')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">⬅️</span>
                Sell CE
              </button>
              <button type="button" class="btn btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('SELL', 'CALL')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
              </ul>
            </div>
          </div>

          <!-- Close & Cancel Buttons -->
          <div class="col-6 text-center">
            <button class="btn btn-lg btn-outline-dark fs-5 w-75 my-2" @click="closeAllPositions">
              <span v-if="enableHotKeys">F6 / </span>
              Close Positions
            </button>
            <button class="btn btn-lg btn-outline-dark fs-5 w-75" @click="cancelPendingOrders">
              <span v-if="enableHotKeys">F7 / </span>
              Cancel Orders
            </button>
          </div>

          <!-- Put Strike Buy/Sell Buttons -->
          <div class="col-3">
            <div class="btn-group w-100">
              <button type="button" class="btn btn-lg btn-success fs-5 my-2 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('BUY'), 'PUT')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">⬇️</span>
                Buy PE
              </button>
              <button type="button" class="btn btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent" data-bs-offset="0,-7">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('BUY', 'PUT')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
              </ul>
            </div>
            <div class="btn-group w-100">
              <button type="button" class="btn btn-lg btn-danger fs-5 w-75"
                @click="selectedOrderType !== (orderTypes.value && orderTypes.value[1]) && placeOrder(getTransactionType('SELL'), 'PUT')"
                v-bind="selectedOrderType === (orderTypes.value && orderTypes.value[1]) ? { 'data-bs-toggle': 'modal', 'data-bs-target': '#PlaceLimitOrderWindow' } : {}">
                <span v-if="enableHotKeys">➡️</span>
                Sell PE
              </button>
              <button type="button" class="btn btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" @click="setOrderDetails('SELL', 'PUT')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWindow">Place Limit Order</a></li>
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
            🤖 Automations
          </button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="positions-tab-pane" role="tabpanel" aria-labelledby="positions-tab"
          tabindex="0">
          <div class="row align-items-center">
            <div class="col-6 text-center py-2">
              <p class="mb-0">
                <b>Net Qty:
                  <span :class="totalNetQty > 0 ? 'text-success' : totalNetQty < 0 ? 'text-danger' : 'text-dark'">
                    {{ totalNetQty }}
                  </span>
                </b>
              </p>
            </div>
            <div class="col-6 text-center py-2">
              <p class="mb-0">
                <span>Total Buy Value: <b>₹ {{ totalBuyValue.toFixed(2) }}</b></span>
                <span class="ms-3">Total Sell Value: <b>₹ {{ totalSellValue.toFixed(2) }}</b></span>
              </p>
              <p class="mb-0">
              </p>
            </div>
          </div>
          <!-- Dhan Positions -->
          <table class="table table-hover" v-if="activeFetchFunction === 'fetchDhanPositions'">
            <thead>
              <tr>
                <th scope="col">Symbol Name</th>
                <th scope="col">Position Type</th>
                <th scope="col">Product Type</th>
                <th scope="col">Net Qty</th>
                <th scope="col">Buy Value</th>
                <th scope="col">Sell Value</th>
                <th scope="col">Realized Profit</th>
                <th scope="col">Unrealized Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dhanPosition in dhanPositionBook" :key="dhanPosition.securityId">
                <td>{{ dhanPosition.tradingSymbol }}</td>
                <td>{{ dhanPosition.positionType }}</td>
                <td>{{ dhanPosition.productType }}</td>
                <td
                  :class="dhanPosition.netQty > 0 ? 'text-success' : dhanPosition.netQty < 0 ? 'text-danger' : 'text-dark'">
                  {{ dhanPosition.netQty }}
                </td>
                <td>{{ dhanPosition.dayBuyValue }}</td>
                <td>{{ dhanPosition.daySellValue }}</td>
                <td
                  :class="dhanPosition.realizedProfit > 0 ? 'text-success' : dhanPosition.realizedProfit < 0 ? 'text-danger' : 'text-dark'">
                  {{ dhanPosition.realizedProfit }}
                </td>
                <td>{{ dhanPosition.unrealizedProfit }}</td>
              </tr>
              <tr v-if="dhanPositionBook.length === 0">
                <td colspan="8" class="text-center">No positions on selected broker {{ selectedBroker.brokerName
                  }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Flattrade Positions -->
          <div v-if="activeFetchFunction === 'fetchFlattradePositions'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Symbol Name</th>
                  <th scope="col">Net Qty</th>
                  <th scope="col">Net Avg</th>
                  <th scope="col">Position Type</th>
                  <th scope="col">Product Type</th>
                  <th scope="col">LTP</th>
                  <th scope="col">Buy Value</th>
                  <th scope="col">Sell Value</th>
                  <th scope="col">Realized</th>
                  <th scope="col">Unrealized</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="flatTradePositionBook.length">
                  <tr v-for="flattradePosition in flatTradePositionBook" :key="flattradePosition.tsym">
                    <td>{{ flattradePosition.tsym }}</td>
                    <td
                      :class="flattradePosition.netqty > 0 ? 'text-success' : flattradePosition.netqty < 0 ? 'text-danger' : 'text-dark'">
                      {{ flattradePosition.netqty }}
                    </td>
                    <td>{{ flattradePosition.netavgprc }}</td>
                    <td>{{ flattradePosition.netqty > 0 ? 'B' : flattradePosition.netqty < 0 ? 'S' : '-' }}</td>
                    <td>{{ flattradePosition.prd }}</td>
                    <td>{{ positionLTPs[flattradePosition.tsym] || '-' }}</td>
                    <td>{{ flattradePosition.daybuyamt }}</td>
                    <td>{{ flattradePosition.daysellamt }}</td>
                    <td
                      :class="flattradePosition.rpnl > 0 ? 'text-success' : flattradePosition.rpnl < 0 ? 'text-danger' : 'text-dark'">
                      {{ flattradePosition.rpnl }}
                    </td>
                    <td
                      :class="flattradePosition.urmtom > 0 ? 'text-success' : flattradePosition.urmtom < 0 ? 'text-danger' : 'text-dark'">
                      {{ flattradePosition.urmtom }}
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">No positions on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Shoonya Positions -->
          <div v-if="activeFetchFunction === 'fetchShoonyaPositions'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Symbol Name</th>
                  <th scope="col">Net Qty</th>
                  <th scope="col">Net Avg</th>
                  <th scope="col">Position Type</th>
                  <th scope="col">Product Type</th>
                  <th scope="col">LTP</th>
                  <th scope="col">Buy Value</th>
                  <th scope="col">Sell Value</th>
                  <th scope="col">Realized</th>
                  <th scope="col">Unrealized</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="shoonyaPositionBook.length">
                  <tr v-for="shoonyaPosition in shoonyaPositionBook" :key="shoonyaPosition.tsym">
                    <td>{{ shoonyaPosition.tsym }}</td>
                    <td
                      :class="shoonyaPosition.netqty > 0 ? 'text-success' : shoonyaPosition.netqty < 0 ? 'text-danger' : 'text-dark'">
                      {{ shoonyaPosition.netqty }}
                    </td>
                    <td>{{ shoonyaPosition.netavgprc }}</td>
                    <td>{{ shoonyaPosition.netqty > 0 ? 'B' : shoonyaPosition.netqty < 0 ? 'S' : '-' }}</td>
                    <td>{{ shoonyaPosition.prd }}</td>
                    <td>{{ positionLTPs[shoonyaPosition.tsym] || '-' }}</td>
                    <td>{{ shoonyaPosition.daybuyamt }}</td>
                    <td>{{ shoonyaPosition.daysellamt }}</td>
                    <td
                      :class="shoonyaPosition.rpnl > 0 ? 'text-success' : shoonyaPosition.rpnl < 0 ? 'text-danger' : 'text-dark'">
                      {{ shoonyaPosition.rpnl }}
                    </td>
                    <td
                      :class="shoonyaPosition.urmtom > 0 ? 'text-success' : shoonyaPosition.urmtom < 0 ? 'text-danger' : 'text-dark'">
                      {{ shoonyaPosition.urmtom }}
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">No positions on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="tab-pane fade" id="trades-tab-pane" role="tabpanel" aria-labelledby="trades-tab" tabindex="0">
          <!-- Dhan Trades -->
          <table class="table table-hover" v-if="activeFetchFunction === 'fetchDhanOrdersTradesBook'">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Execution Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dhanOrder in dhanOrders" :key="dhanOrder.orderId">
                <td>{{ dhanOrder.orderId }}</td>
                <td>{{ dhanOrder.tradingSymbol }}</td>
                <td>{{ dhanOrder.quantity }}</td>
                <td>{{ dhanOrder.price }}</td>
                <td>{{ dhanOrder.createTime }}</td>
                <td>{{ dhanOrder.orderStatus }}</td>
              </tr>
              <tr v-if="dhanOrders.length === 0">
                <td colspan="6" class="text-center">No orders or trades on selected broker {{
                  selectedBroker.brokerName }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Flattrade Trades -->
          <div v-if="activeFetchFunction === 'fetchFlattradeOrdersTradesBook'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Order ID</th>
                  <th scope="col">Trade ID</th>
                  <th scope="col">Symbol</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Price</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Reason</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="combinedOrdersAndTrades.length">
                  <template v-for="item in combinedOrdersAndTrades" :key="item.norenordno">
                    <tr>
                      <td>Order</td>
                      <td>{{ item.order.norenordno }}</td>
                      <td>-</td>
                      <td>{{ item.order.tsym }}</td>
                      <td>{{ item.order.qty }}</td>
                      <td>{{ item.order.prc }}</td>
                      <td>{{ item.order.norentm }}</td>
                      <td :class="{
                        'text-danger': item.order.status === 'REJECTED',
                        'text-success': item.order.status === 'COMPLETE',
                        'text-warning': item.order.status === 'PENDING'
                      }">
                        {{ item.order.status }}
                      </td>
                      <td>{{ item.order.rejreason }}</td>
                    </tr>
                    <tr v-if="item.trade" class="nested-trade-row">
                      <td>Trade</td>
                      <td>-</td>
                      <td>{{ item.trade.norenordno }}</td>
                      <td>{{ item.trade.tsym }}</td>
                      <td>{{ item.trade.qty }}</td>
                      <td>{{ item.trade.flprc }}</td>
                      <td>{{ item.trade.norentm }}</td>
                      <td>{{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}</td>
                      <td>-</td>
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
          <div v-if="activeFetchFunction === 'fetchShoonyaOrdersTradesBook'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Order ID</th>
                  <th scope="col">Trade ID</th>
                  <th scope="col">Symbol</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Price</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Reason</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="combinedOrdersAndTrades.length">
                  <template v-for="item in combinedOrdersAndTrades" :key="item.norenordno">
                    <tr>
                      <td>Order</td>
                      <td>{{ item.order.norenordno }}</td>
                      <td>-</td>
                      <td>{{ item.order.tsym }}</td>
                      <td>{{ item.order.qty }}</td>
                      <td>{{ item.order.prc }}</td>
                      <td>{{ item.order.norentm }}</td>
                      <td :class="{
                        'text-danger': item.order.status === 'REJECTED',
                        'text-success': item.order.status === 'COMPLETE',
                        'text-warning': item.order.status === 'PENDING'
                      }">
                        {{ item.order.status }}
                      </td>
                      <td>{{ item.order.rejreason }}</td>
                    </tr>
                    <tr v-if="item.trade" class="nested-trade-row">
                      <td>Trade</td>
                      <td>-</td>
                      <td>{{ item.trade.norenordno }}</td>
                      <td>{{ item.trade.tsym }}</td>
                      <td>{{ item.trade.qty }}</td>
                      <td>{{ item.trade.flprc }}</td>
                      <td>{{ item.trade.norentm }}</td>
                      <td>{{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}</td>
                      <td>-</td>
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
        </div>
        <div class="tab-pane fade" id="automation-tab-pane" role="tabpanel" aria-labelledby="automation-tab"
          tabindex="0">

          <div class="card text-center py-3">
            <div class="card-body text-start">
              <span class="fs-5 text-danger">Coming Soon</span>
              <h5>Smart Automations for Risk Management.</h5>
              <ul class="text-secondary">
                <li>if deployment value higher than 25% of total capital, positions will be force closed.</li>
                <li>if loss higher than 3% of total capital, activates kill switch to halt trading.</li>
                <li>kill switch activates if total buy/sell value crosses above 5 times of allowed deployment value
                </li>
              </ul>
              <span class="p-1 rounded bg-warning text-dark">This is a rough draft and will be updated in the next
                release.
              </span>
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

</template>



<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
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
  const dhanDetails = JSON.parse(localStorage.getItem('broker_Dhan') || '{}');
  const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
  const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}');

  const dhanClientId = dhanDetails.clientId;
  const dhanApiToken = dhanDetails.apiToken;
  const flattradeClientId = flattradeDetails.clientId;
  const flattradeApiToken = localStorage.getItem('FLATTRADE_API_TOKEN');
  const shoonyaApiToken = localStorage.getItem('SHOONYA_API_TOKEN');
  const shoonyaClientId = shoonyaDetails.clientId;

  if (selectedBroker.value?.brokerName === 'Dhan') {
    if (dhanClientId && dhanApiToken) {
      return tokenStatus.Dhan === 'valid' ? 'Connected' : 'Token Expired';
    }
    return 'Not Connected';
  }
  else if (selectedBroker.value?.brokerName === 'Flattrade') {
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
const selectedQuantity = ref(null);
const selectedExpiry = ref(null);
const selectedCallStrike = ref({});
const selectedPutStrike = ref({});
const exchangeSymbols = ref({});

const updateExchangeSymbols = () => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    exchangeSymbols.value = {
      NSE: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'NIFTYNXT50'],
      BSE: ['SENSEX', 'BANKEX', 'SENSEX50']
    };
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    exchangeSymbols.value = {
      NFO: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'NIFTYNXT50'],
      BFO: ['SENSEX', 'BANKEX', 'SENSEX50']
    };
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    exchangeSymbols.value = {
      NFO: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'NIFTYNXT50'],
      BFO: ['SENSEX', 'BANKEX', 'SENSEX50']
    };
  }
};
const setDefaultExchangeAndMasterSymbol = () => {
  const exchanges = Object.keys(exchangeSymbols.value);
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
const niftynxt50Price = ref('N/A');
const midcpniftyPrice = ref('N/A');
const sensexPrice = ref('N/A');
const bankexPrice = ref('N/A');
const sensex50Price = ref('N/A');
// Add a new function to get the initial price
const getInitialPrice = (symbol) => {
  const strike = callStrikes.value.find(s =>
    s.tradingSymbol.includes(symbol) &&
    (selectedBroker.value?.brokerName === 'Dhan' ?
      s.tradingSymbol.endsWith('-CE') :
      /C\d+$/.test(s.tradingSymbol))
  );
  return strike ? parseFloat(strike.strikePrice) : null;
};
const fetchTradingData = async () => {
  let response;
  if (selectedBroker.value?.brokerName === 'Dhan') {
    response = await fetch(`http://localhost:3000/dhanSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    response = await fetch(`http://localhost:3000/flattradeSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    console.log('Flattrade Symbols:', response);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    response = await fetch(`http://localhost:3000/shoonyaSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    console.log('Shoonya Symbols:', response);
  } else {
    throw new Error('Unsupported broker');
  }

  const data = await response.json();
  console.log('Data:', data);

  // Filter expiry dates for the selected master symbol and limit to 3 weeks
  const today = new Date();
  const threeWeeksLater = new Date(today.getTime() + (21 * 24 * 60 * 60 * 1000)); // Three weeks later

  expiryDates.value = data.expiryDates
    .filter(expiryDate => {
      const date = new Date(expiryDate);
      return date >= today && date <= threeWeeksLater;
    });

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
  if (niftynxt50Price.value === 'N/A') niftynxt50Price.value = getInitialPrice('NIFTYNXT50');
  if (midcpniftyPrice.value === 'N/A') midcpniftyPrice.value = getInitialPrice('MIDCPNIFTY');
  if (sensexPrice.value === 'N/A') sensexPrice.value = getInitialPrice('SENSEX');
  if (bankexPrice.value === 'N/A') bankexPrice.value = getInitialPrice('BANKEX');
  if (sensex50Price.value === 'N/A') sensex50Price.value = getInitialPrice('SENSEX50');

  updateStrikesForExpiry(selectedExpiry.value);
};
// Add watchers for the price values
watch([niftyPrice, bankNiftyPrice, finniftyPrice, niftynxt50Price, midcpniftyPrice, sensexPrice, bankexPrice, sensex50Price], () => {
  if (selectedExpiry.value) {
    updateStrikesForExpiry(selectedExpiry.value);
  }
});
const formatDate = (dateString) => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    // Extract only the date part from the date string for Dhan
    return dateString.split(' ')[0]; // Splits the string by space and returns the first part (date)
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    // Return the date string as is for Flattrade
    return dateString;
  }
  return dateString; // Default case, return the original date string
};

const updateStrikesForExpiry = (expiryDate) => {
  console.log('Updating strikes for expiry:', expiryDate);

  let filteredCallStrikes, filteredPutStrikes;

  if (selectedBroker.value?.brokerName === 'Dhan') {
    filteredCallStrikes = callStrikes.value.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = putStrikes.value.filter(strike => strike.expiryDate === expiryDate);
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
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
    } else if (selectedMasterSymbol.value === 'NIFTYNXT50') {
      currentPrice = parseFloat(niftynxt50Price.value);
    } else if (selectedMasterSymbol.value === 'MIDCPNIFTY') {
      currentPrice = parseFloat(midcpniftyPrice.value);
    } else if (selectedMasterSymbol.value === 'SENSEX') {
      currentPrice = parseFloat(sensexPrice.value);
    } else if (selectedMasterSymbol.value === 'BANKEX') {
      currentPrice = parseFloat(bankexPrice.value);
    } else if (selectedMasterSymbol.value === 'SENSEX50') {
      currentPrice = parseFloat(sensex50Price.value);
    }

    if (currentPrice && !isNaN(currentPrice) && filteredCallStrikes.length > 0) {
      const nearestStrike = filteredCallStrikes.reduce((prev, curr) =>
        Math.abs(curr.strikePrice - currentPrice) < Math.abs(prev.strikePrice - currentPrice) ? curr : prev
      );

      selectedCallStrike.value = nearestStrike;
      selectedPutStrike.value = filteredPutStrikes.find(strike => strike.strikePrice === nearestStrike.strikePrice) || {};
    }

    console.log('Selected Call Strike:', selectedCallStrike.value);
    console.log('Selected Put Strike:', selectedPutStrike.value);

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
    if (selectedBroker.value?.brokerName === 'Dhan') {
      baseSymbol = selectedPutStrike.value.tradingSymbol.replace(/-PE$/, '');
    } else if (selectedBroker.value?.brokerName === 'Flattrade') {
      baseSymbol = selectedPutStrike.value.tradingSymbol.replace(/P\d+$/, '');
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      baseSymbol = selectedPutStrike.value.tradingSymbol.replace(/P\d+$/, '');
    }
    const matchingCallStrike = callStrikes.value.find(strike =>
      strike.tradingSymbol.startsWith(baseSymbol) &&
      (selectedBroker.value?.brokerName === 'Dhan' ?
        strike.tradingSymbol.endsWith('-CE') :
        /C\d+$/.test(strike.tradingSymbol))
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
    if (selectedBroker.value?.brokerName === 'Dhan') {
      baseSymbol = selectedCallStrike.value.tradingSymbol.replace(/-CE$/, '');
    } else if (selectedBroker.value?.brokerName === 'Flattrade') {
      baseSymbol = selectedCallStrike.value.tradingSymbol.replace(/C\d+$/, '');
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      baseSymbol = selectedCallStrike.value.tradingSymbol.replace(/C\d+$/, '');
    }
    const matchingPutStrike = putStrikes.value.find(strike =>
      strike.tradingSymbol.startsWith(baseSymbol) &&
      (selectedBroker.value?.brokerName === 'Dhan' ?
        strike.tradingSymbol.endsWith('-PE') :
        /P\d+$/.test(strike.tradingSymbol))
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
  console.log('Updating Security IDs');
  defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A';
  defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A';
};

const updateAvailableQuantities = () => {
  availableQuantities.value = quantities.value[selectedMasterSymbol.value] || [];
  if (!availableQuantities.value.includes(selectedQuantity.value)) {
    selectedQuantity.value = availableQuantities.value[0];
  }
};

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

const dhanOrders = ref([]);
const fetchDhanOrdersTradesBook = async () => {
  const dhanDetails = JSON.parse(localStorage.getItem('broker_Dhan') || '{}');

  try {
    const response = await axios.get('http://localhost:3000/dhanGetOrders', {
      params: {
        DHAN_API_TOKEN: dhanDetails.apiToken,
      }
    });
    dhanOrders.value = response.data; // Set the orders array
    console.log('Dhan Order Book:', response.data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    toastMessage.value = 'Error fetching orders';
    showToast.value = true;
  }
};
const flatOrderBook = ref([]);
const flatTradeBook = ref([]);
const token = ref('');

const fetchFlattradeOrdersTradesBook = async () => {
  let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value;

  if (!selectedBroker.value || selectedBroker.value.brokerName !== 'Flattrade') {
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
    console.log('Flattrade Order Book:', response.data.orderBook);
    console.log('Flattrade Trade Book:', response.data.tradeBook);
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

  if (!selectedBroker.value || selectedBroker.value.brokerName !== 'Shoonya') {
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
    console.log('Shoonya Order Book:', response.data.orderBook);
    console.log('Shoonya Trade Book:', response.data.tradeBook);
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

const dhanPositionBook = ref([]);
const fetchDhanPositions = async () => {
  const dhanDetails = JSON.parse(localStorage.getItem('broker_Dhan') || '{}');
  if (!dhanDetails.apiToken) {
    toastMessage.value = 'Dhan API Token is missing. Please generate a token first.';
    showToast.value = true;
    return;
  }
  try {
    const response = await axios.get('http://localhost:3000/dhanPositions', {
      params: {
        DHAN_API_TOKEN: dhanDetails.apiToken,
      }
    });
    dhanPositionBook.value = response.data;
    console.log('Dhan Position Book:', dhanPositionBook.value);
  } catch (error) {
    console.error('Error fetching dhanPositionBook:', error);
    toastMessage.value = 'Failed to fetch dhanPositionBook';
    showToast.value = true;
  }
};

const flatTradePositionBook = ref([]);
const fetchFlattradePositions = async () => {
  let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value;

  if (!jKey) {
    toastMessage.value = 'Token is missing. Please generate a token first.';
    showToast.value = true;
    return;
  }

  if (!selectedBroker.value || selectedBroker.value.brokerName !== 'Flattrade') {
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
      console.log('Flattrade Position Book:', positionBookRes.data);
      updatePositionSecurityIds();
      subscribeToPositionLTPs();
      subscribeToOptions();
    } else if (positionBookRes.data.emsg === 'no data' || positionBookRes.data.emsg.includes('no data')) {
      flatTradePositionBook.value = [];
      console.log('No positions in Flattrade Position Book');
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

  if (!selectedBroker.value || selectedBroker.value.brokerName !== 'Shoonya') {
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
      console.log('No positions in Shoonya Position Book');
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

const fundLimits = ref({});
// Update the fetchFundLimit function
const fetchFundLimit = async () => {
  try {
    if (!selectedBroker.value) {
      throw new Error('No broker selected');
    }

    let response;
    if (selectedBroker.value.brokerName === 'Dhan') {
      const dhanDetails = JSON.parse(localStorage.getItem('broker_Dhan') || '{}');
      if (!dhanDetails.apiToken) {
        throw new Error('Dhan API Token is missing');
      }
      response = await axios.get('http://localhost:3000/dhanFundLimit', {
        params: {
          DHAN_API_TOKEN: dhanDetails.apiToken,
        }
      });
    }
    else if (selectedBroker.value.brokerName === 'Flattrade') {
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
    else if (selectedBroker.value.brokerName === 'Shoonya') {
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
        marginused: response.data.marginused
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


const quantities = ref({
  NIFTY: [25],
  BANKNIFTY: [15],
  FINNIFTY: [40],
  MIDCPNIFTY: [75],
  NIFTYNXT50: [10],
  SENSEX: [10],
  BANKEX: [15],
  SENSEX50: [25]
});
const availableQuantities = ref([]);

const orderTypes = computed(() => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return ['MARKET', 'LIMIT'];
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
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
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return ['Intraday', 'Margin'];
  }
  else if (selectedBroker.value?.brokerName === 'Flattrade') {
    return ['Intraday', 'Margin'];
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return ['Intraday', 'Margin'];
  }
  return [];
});
const getProductTypeValue = (productType) => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return productType.toUpperCase();
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  return productType;
};

const selectedProductType = ref(''); // Initialize with an empty string

const getTransactionType = (type) => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return type;
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    return type === 'BUY' ? 'B' : 'S';
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return type === 'BUY' ? 'B' : 'S';
  }
  return type;
};

const limitPrice = ref(null);
const modalTransactionType = ref('');
const modalOptionType = ref('');
// Get Exchange Segment for Dhan or Flattrade
const getExchangeSegment = () => {
  if (!selectedBroker.value || !selectedExchange.value) {
    throw new Error("Broker or exchange not selected");
  }

  if (selectedBroker.value.brokerName === 'Dhan') {
    if (selectedExchange.value === 'NSE') {
      return 'NSE_FNO';
    } else if (selectedExchange.value === 'BSE') {
      return 'BSE_FNO';
    } else {
      throw new Error("Selected exchange is not valid for Dhan");
    }
  } else if (selectedBroker.value.brokerName === 'Flattrade') {
    if (selectedExchange.value === 'NFO') {
      return 'NFO';
    } else if (selectedExchange.value === 'BFO') {
      return 'BFO';
    } else {
      throw new Error("Selected exchange is not valid for Flattrade");
    }
  }
  else if (selectedBroker.value.brokerName === 'Shoonya') {
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

// Prepare Order Payload for Dhan or Flattrade
const prepareOrderPayload = (transactionType, drvOptionType, selectedStrike, exchangeSegment) => {
  if (selectedBroker.value.brokerName === 'Dhan') {
    return {
      brokerClientId: selectedBroker.value.brokerClientId,
      transactionType: transactionType,
      exchangeSegment: exchangeSegment,
      productType: selectedProductType.value,
      orderType: selectedOrderType.value,
      validity: 'DAY',
      tradingSymbol: selectedStrike.tradingSymbol,
      securityId: selectedStrike.securityId,
      quantity: selectedQuantity.value,
      price: selectedOrderType.value === 'LIMIT' ? limitPrice.value : 0,
      drvExpiryDate: selectedExpiry.value,
      drvOptionType: drvOptionType
    };
  } else if (selectedBroker.value.brokerName === 'Flattrade') {
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
  } else if (selectedBroker.value.brokerName === 'Shoonya') {
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

// Place Order for Dhan or Flattrade
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

    console.log("Placing order with data:", orderData);
    let response;
    if (selectedBroker.value.brokerName === 'Dhan') {
      const dhanDetails = JSON.parse(localStorage.getItem('broker_Dhan') || '{}');

      response = await axios.post('http://localhost:3000/dhanPlaceOrder', orderData, {
        params: {
          DHAN_API_TOKEN: dhanDetails.apiToken
        }
      });
      await fetchDhanOrdersTradesBook();
    }
    else if (selectedBroker.value.brokerName === 'Flattrade') {
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
      await fetchFlattradeOrdersTradesBook();
    }
    else if (selectedBroker.value.brokerName === 'Shoonya') {
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
      await fetchShoonyaOrdersTradesBook();
    }

    console.log("Order placed successfully:", response.data);
    toastMessage.value = 'Order placed successfully';
    showToast.value = true;
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
// Place Order for Dhan or Flattrade for each position
const placeOrderForPosition = async (transactionType, optionType, position) => {
  try {
    const quantity = Math.abs(Number(position.netQty || position.netqty));

    if (quantity === 0) {
      console.log('Quantity is zero, no order will be placed.');
      return;
    }

    let orderData;
    if (selectedBroker.value.brokerName === 'Dhan') {
      orderData = {
        brokerClientId: selectedBroker.value.clientId,
        transactionType: transactionType,
        exchangeSegment: selectedExchange.value === 'NSE' ? 'NSE_FNO' : 'BSE_FNO',
        productType: selectedProductType.value,
        orderType: 'MARKET',
        validity: 'DAY',
        tradingSymbol: position.tradingSymbol,
        securityId: position.securityId,
        quantity: position.netQty,
        price: 0,
        drvExpiryDate: position.expiryDate,
        drvOptionType: optionType
      };
    } else if (selectedBroker.value.brokerName === 'Flattrade') {
      orderData = {
        uid: selectedBroker.value.clientId,
        actid: selectedBroker.value.clientId,
        exch: selectedExchange.value === 'NFO' ? 'NFO' : 'BFO',
        tsym: position.tsym,
        qty: position.netqty,
        prc: 0,
        prd: position.prd,
        trantype: transactionType,
        prctyp: 'MKT',
        ret: "DAY"
      };
    }

    console.log("Placing order for position with data:", orderData);
    let response;
    if (selectedBroker.value.brokerName === 'Dhan') {
      response = await axios.post('http://localhost:3000/dhanPlaceOrder', orderData);
      await fetchDhanOrdersTradesBook();
    }
    else if (selectedBroker.value.brokerName === 'Flattrade') {
      const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN');
      const payload = qs.stringify(orderData); // orderData already includes uid and actid
      response = await axios.post('http://localhost:3000/flattradePlaceOrder', payload, {
        headers: {
          'Authorization': `Bearer ${FLATTRADE_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      await fetchFlattradeOrdersTradesBook();
    }
    else if (selectedBroker.value.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
      const payload = qs.stringify(orderData); // orderData already includes uid and actid
      response = await axios.post('http://localhost:3000/shoonyaPlaceOrder', payload, {
        headers: {
          'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      await fetchShoonyaOrdersTradesBook();
    }

    console.log("Order placed successfully for position:", response.data);
  } catch (error) {
    console.error('Failed to place order for position:', error);
    throw error;
  }
};

// Close all positions for Dhan or Flattrade
const closeAllPositions = async () => {
  try {
    let positionsClosed = false;

    if (selectedBroker.value?.brokerName === 'Dhan') {
      for (const position of dhanPositionBook.value) {
        const netQty = Number(position.netQty); // Ensure netQty is treated as a number
        if (netQty !== 0) {
          const transactionType = netQty > 0 ? 'SELL' : 'BUY';
          const optionType = position.tradingSymbol.includes('CE') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;
        }
      }
      if (positionsClosed) {
        toastMessage.value = 'All Dhan positions closed successfully';
      } else {
        toastMessage.value = 'No positions to close for Dhan';
      }
    } else if (selectedBroker.value?.brokerName === 'Flattrade') {
      for (const position of flatTradePositionBook.value) {
        const netqty = Number(position.netqty); // Ensure netqty is treated as a number
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B';
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;
        }
      }
      if (positionsClosed) {
        toastMessage.value = 'All Flattrade positions closed successfully';
      } else {
        toastMessage.value = 'No positions to close for Flattrade';
      }
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      for (const position of shoonyaPositionBook.value) {
        const netqty = Number(position.netqty); // Ensure netqty is treated as a number
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B';
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT';
          await placeOrderForPosition(transactionType, optionType, position);
          positionsClosed = true;
        }
      }
      if (positionsClosed) {
        toastMessage.value = 'All Shoonya positions closed successfully';
      } else {
        toastMessage.value = 'No positions to close for Shoonya';
      }
    }

    showToast.value = true;
  } catch (error) {
    console.error('Error closing positions:', error);
    toastMessage.value = 'Failed to close all positions';
    showToast.value = true;
  }
};

const cancelOrder = async (order) => {
  const orderId = selectedBroker.value?.brokerName === 'Dhan' ? order.orderId : order.norenordno;
  const orderStatus = selectedBroker.value?.brokerName === 'Dhan' ? order.orderStatus : order.status;

  console.log(`Attempting to cancel order ${orderId} with status ${orderStatus}`);
  console.log(`Broker: ${selectedBroker.value?.brokerName}`);

  if ((selectedBroker.value?.brokerName === 'Dhan' && orderStatus !== 'PENDING') ||
    (selectedBroker.value?.brokerName === 'Flattrade' && orderStatus !== 'OPEN')) {
    console.log(`Order ${orderId} is not in a cancellable state and cannot be canceled.`);
    return;
  }

  try {
    if (selectedBroker.value?.brokerName === 'Dhan') {
      const dhanDetails = JSON.parse(localStorage.getItem('broker_Dhan') || '{}');
      console.log(`Sending request to cancel Dhan order ${orderId}`);
      await axios.delete('http://localhost:3000/dhanCancelOrder', {
        data: { orderId },
        params: {
          DHAN_API_TOKEN: dhanDetails.apiToken
        }
      });
    }
    else if (selectedBroker.value?.brokerName === 'Flattrade') {
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
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error);
    toastMessage.value = 'Failed to cancel order';
    showToast.value = true;
    throw error; // Rethrow to handle in cancelPendingOrders
  }
};

const cancelPendingOrders = async () => {
  console.log(`Canceling pending orders for broker: ${selectedBroker.value?.brokerName}`);

  // Fetch orders based on the selected broker
  if (selectedBroker.value?.brokerName === 'Dhan') {
    await fetchDhanOrdersTradesBook();
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    await fetchFlattradeOrdersTradesBook();
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    await fetchShoonyaOrdersTradesBook();
  }

  const pendingOrders = selectedBroker.value?.brokerName === 'Dhan'
    ? dhanOrders.value.filter(order => order.orderStatus === 'PENDING')
    : flatOrderBook.value.filter(order => order.status === 'OPEN');

  console.log(`Pending orders:`, pendingOrders);

  const cancelPromises = pendingOrders.map(order => cancelOrder(order));

  try {
    await Promise.all(cancelPromises);
    toastMessage.value = 'Pending orders canceled successfully';
    showToast.value = true;

    // Refresh the orders list based on the selected broker
    if (selectedBroker.value?.brokerName === 'Dhan') {
      await fetchDhanOrdersTradesBook();
    } else if (selectedBroker.value?.brokerName === 'Flattrade') {
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



const availableBalance = computed(() => {
  console.log('Fund Limits:', fundLimits.value);
  console.log('Selected Broker:', selectedBroker.value?.brokerName);

  if (selectedBroker.value?.brokerName === 'Dhan') {
    const dhanBalance = fundLimits.value.availabelBalance;
    console.log('Dhan Available Balance (raw):', dhanBalance);
    console.log('Dhan Available Balance (type):', typeof dhanBalance);

    // Convert to number if it's a string, or use the value directly if it's already a number
    const numericBalance = typeof dhanBalance === 'string' ? parseFloat(dhanBalance) : dhanBalance;

    console.log('Dhan Available Balance (processed):', numericBalance);
    return isNaN(numericBalance) ? null : Math.floor(numericBalance);
  }
  else if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
    const cash = Number(fundLimits.value.cash) || 0;
    const marginUsed = Number(fundLimits.value.marginused) || 0;
    const balance = Math.floor(cash - marginUsed);
    console.log(`${selectedBroker.value.brokerName} Available Balance:`, balance);
    return balance;
  }
  return null;
});
// Computed property to get the correct utilized amount based on the selected broker
const usedAmount = computed(() => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    const utilizedAmount = Number(fundLimits.value.utilizedAmount) || 0;
    return utilizedAmount;
  }
  else if (selectedBroker.value?.brokerName === 'Flattrade') {
    const marginUsed = Number(fundLimits.value.marginused) || 0;
    return marginUsed;
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    const marginUsed = Number(fundLimits.value.marginused) || 0;
    return marginUsed;
  }
  return 0;
});

const formattedDate = computed(() => {
  const today = new Date();
  const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  return today.toLocaleDateString('en-US', options).replace(/,/g, '');
});

const totalNetQty = computed(() => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return dhanPositionBook.value.reduce((total, position) => total + position.netQty, 0);
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce((total, position) => total + parseInt(position.netqty, 10), 0);
  }
  return 0;
});

const totalProfit = computed(() => {
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return dhanPositionBook.value.reduce((acc, position) => acc + position.unrealizedProfit + position.realizedProfit, 0);
  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce((acc, position) => acc + parseFloat(position.urmtom) + parseFloat(position.rpnl), 0);
  }
  return 0;
});

// const profitData = computed(() => {
//   if (selectedBroker.value?.brokerName === 'Dhan') {
//     return dhanPositionBook.value.map(position => position.unrealizedProfit + position.realizedProfit);
//   } else if (selectedBroker.value?.brokerName === 'Flattrade') {
//     return flatTradePositionBook.value.map(position => parseFloat(position.urmtom) + parseFloat(position.rpnl));
//   }
//   return [];
// });

const totalCapitalPercentage = computed(() => {
  const totalMoney = Number(availableBalance.value) + Number(usedAmount.value);
  return totalMoney ? (Number(totalProfit.value) / totalMoney) * 100 : 0;
});
const deployedCapitalPercentage = computed(() => {
  const totalUsedAmount = usedAmount.value || 0;
  return totalUsedAmount ? (totalProfit.value / totalUsedAmount) * 100 : 0;
});

const totalBrokerage = computed(() => {
  let total = 0;

  // Calculate totalValue based on totalBuyValue and totalSellValue
  const totalValue = totalBuyValue.value + totalSellValue.value;

  if (selectedBroker.value?.brokerName === 'Dhan') {
    // Calculate charges for Dhan broker
    const exchangeCharge = Math.round(totalValue * 0.0005 * 100) / 100;                     // Adjusted rate for Dhan
    const sebiCharge = Math.round(totalValue * 0.000001 * 100) / 100;                       // Adjusted rate for Dhan
    const gstCharge = Math.round((exchangeCharge + sebiCharge) * 18) / 100;                 // Adjusted rate for Dhan
    const stampdutyCharge = Math.round(totalBuyValue.value * 0.0003);                       // Adjusted rate for Dhan
    const sttCharge = Math.round(totalSellValue.value * 0.000625 * 100) / 100;               // Adjusted rate for Dhan

    // Accumulate brokerage for Dhan
    for (const order of dhanOrders.value) {
      if (order.orderStatus === 'TRADED') {
        total += 23.6; // Accumulate brokerage total
      }
    }

    // Subtract charges from total for Dhan
    total += (exchangeCharge + sebiCharge + gstCharge + stampdutyCharge + sttCharge);

  } else if (selectedBroker.value?.brokerName === 'Flattrade') {
    // Calculate charges for Flattrade
    const exchangeCharge = Math.round(totalValue * 0.000495 * 100) / 100;                   // Adjusted rate for Flattrade
    const ipftCharge = Math.round(totalValue * 0.000005 * 100) / 100;                       // Adjusted rate for Flattrade	
    const sebiCharge = Math.round(totalValue * 0.000001 * 100) / 100;                       // Adjusted rate for Flattrade
    const gstCharge = Math.round((exchangeCharge + sebiCharge + ipftCharge) * 18) / 100;    // Adjusted rate for Flattrade
    const stampdutyCharge = Math.round(totalBuyValue.value * 0.00003);                      // Adjusted rate for Flattrade
    const sttCharge = Math.round(totalSellValue.value * 0.000625);                          // Adjusted rate for Flattrade

    // Subtract charges from total for Flattrade
    total += (exchangeCharge + ipftCharge + sebiCharge + gstCharge + stampdutyCharge + sttCharge);
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
    if (!selectedBroker.value || selectedBroker.value.brokerName !== 'Flattrade') {
      toastMessage.value = 'Realtime LTP data only available for Flattrade';
      showToast.value = true;
      return;
    }

    const clientId = selectedBroker.value.clientId;
    const apiToken = localStorage.getItem('FLATTRADE_API_TOKEN');

    if (!clientId || !apiToken) {
      console.error('Flattrade client ID or API token is missing');
      return;
    }

    const response = await axios.post('http://localhost:3000/api/set-flattrade-credentials', {
      usersession: apiToken,
      userid: clientId,
      defaultCallSecurityId: defaultCallSecurityId.value,
      defaultPutSecurityId: defaultPutSecurityId.value
    });
    console.log('Credentials and security IDs set successfully:', response.data);
  } catch (error) {
    console.error('Error setting credentials and security IDs:', error);
  }
};
const socket = ref(null);
const latestCallLTP = ref('N/A');
const latestPutLTP = ref('N/A');

const defaultCallSecurityId = ref(null);
const defaultPutSecurityId = ref(null);

const connectWebSocket = () => {
  socket.value = new WebSocket('ws://localhost:8765');

  // Modify the existing socket.onmessage handler
  socket.value.onmessage = (event) => {
    const quoteData = JSON.parse(event.data);
    // console.log('Received data:', quoteData);
    if (quoteData.lp) {
      if (quoteData.tk === '26000' && selectedMasterSymbol.value === 'NIFTY') {
        niftyPrice.value = quoteData.lp;
      }
      else if (quoteData.tk === '26009' && selectedMasterSymbol.value === 'BANKNIFTY') {
        bankNiftyPrice.value = quoteData.lp;
      }
      else if (quoteData.tk === '26037' && selectedMasterSymbol.value === 'FINNIFTY') {
        finniftyPrice.value = quoteData.lp;
      }
      else if (quoteData.tk === '26013' && selectedMasterSymbol.value === 'NIFTYNXT50') {
        niftynxt50Price.value = quoteData.lp;
      }
      else if (quoteData.tk === '26074' && selectedMasterSymbol.value === 'MIDCPNIFTY') {
        midcpniftyPrice.value = quoteData.lp;
      }
      else if (quoteData.tk === '1' && selectedMasterSymbol.value === 'SENSEX') {
        sensexPrice.value = quoteData.lp;
      }
      else if (quoteData.tk === '12' && selectedMasterSymbol.value === 'BANKEX') {
        bankexPrice.value = quoteData.lp;
      }
      else if (quoteData.tk === '47' && selectedMasterSymbol.value === 'SENSEX50') {
        sensex50Price.value = quoteData.lp;
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
    let symbolToSubscribe;

    // Mapping for NSE symbols
    if (selectedMasterSymbol.value === 'NIFTY') {
      symbolToSubscribe = 'NSE|26000';
    } else if (selectedMasterSymbol.value === 'BANKNIFTY') {
      symbolToSubscribe = 'NSE|26009';
    } else if (selectedMasterSymbol.value === 'FINNIFTY') {
      symbolToSubscribe = 'NSE|26037';
    } else if (selectedMasterSymbol.value === 'NIFTYNXT50') {
      symbolToSubscribe = 'NSE|26013';
    } else if (selectedMasterSymbol.value === 'MIDCPNIFTY') {
      symbolToSubscribe = 'NSE|26074';
    }

    // Mapping for BSE symbols
    else if (selectedMasterSymbol.value === 'SENSEX') {
      symbolToSubscribe = 'BSE|1';
    } else if (selectedMasterSymbol.value === 'BANKEX') {
      symbolToSubscribe = 'BSE|12';
    } else if (selectedMasterSymbol.value === 'SENSEX50') {
      symbolToSubscribe = 'BSE|47';
    }

    if (symbolToSubscribe && symbolToSubscribe !== `NSE|${currentSubscriptions.value.masterSymbol}` && symbolToSubscribe !== `BSE|${currentSubscriptions.value.masterSymbol}`) {
      const data = {
        action: 'subscribe',
        symbols: [symbolToSubscribe]
      };
      console.log('Sending master symbol subscribe data:', data);
      socket.value.send(JSON.stringify(data));
      currentSubscriptions.value.masterSymbol = selectedMasterSymbol.value;
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
      console.log('Sending options subscribe data:', data);
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
};
const subscribeToPositionLTPs = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const symbolsToSubscribe = Object.entries(positionSecurityIds.value)
      .map(([tsym, token]) => `NFO|${token}`);

    if (symbolsToSubscribe.length > 0) {
      const data = {
        action: 'subscribe',
        symbols: symbolsToSubscribe
      };
      console.log('Sending position LTPs subscribe data:', data);
      socket.value.send(JSON.stringify(data));
    }
  }
};
// Add a watcher for flatTradePositionBook
watch(flatTradePositionBook, () => {
  updatePositionSecurityIds();
  subscribeToOptions();
}, { deep: true });

const unsubscribeFromSymbols = (symbols) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN && symbols.length > 0) {
    const data = {
      action: 'unsubscribe',
      symbols: symbols
    };
    console.log('Sending unsubscribe data:', data);
    socket.value.send(JSON.stringify(data));
  }
};

const updateSubscriptions = () => {
  const symbolsToUnsubscribe = [];

  // Check if master symbol has changed
  if (currentSubscriptions.value.masterSymbol !== selectedMasterSymbol.value) {
    if (currentSubscriptions.value.masterSymbol) {
      let oldSymbol;
      if (currentSubscriptions.value.masterSymbol === 'NIFTY') oldSymbol = 'NSE|26000';
      else if (currentSubscriptions.value.masterSymbol === 'BANKNIFTY') oldSymbol = 'NSE|26009';
      else if (currentSubscriptions.value.masterSymbol === 'FINNIFTY') oldSymbol = 'NSE|26037';
      else if (currentSubscriptions.value.masterSymbol === 'NIFTYNXT50') oldSymbol = 'NSE|26013';
      else if (currentSubscriptions.value.masterSymbol === 'MIDCPNIFTY') oldSymbol = 'NSE|26074';
      else if (currentSubscriptions.value.masterSymbol === 'SENSEX') oldSymbol = 'BSE|1';
      else if (currentSubscriptions.value.masterSymbol === 'BANKEX') oldSymbol = 'BSE|12';
      else if (currentSubscriptions.value.masterSymbol === 'SENSEX50') oldSymbol = 'BSE|47';
      if (oldSymbol) symbolsToUnsubscribe.push(oldSymbol);
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
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return dhanPositionBook.value.reduce((total, position) => total + position.dayBuyValue, 0);
  }
  return 0;
});

const totalSellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0);
  }
  if (selectedBroker.value?.brokerName === 'Dhan') {
    return dhanPositionBook.value.reduce((total, position) => total + position.daySellValue, 0);
  }
  return 0;
});

let timer;
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
  setDefaultExpiry()

  window.addEventListener('keydown', handleHotKeys);

  // Initialize with the default active tab
  if (activeTab.value === 'positions') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      fetchFlattradePositions();
      activeFetchFunction.value = 'fetchFlattradePositions';
    }
    if (selectedBroker.value?.brokerName === 'Dhan') {
      fetchDhanPositions();
      activeFetchFunction.value = 'fetchDhanPositions';
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
    if (selectedBroker.value?.brokerName === 'Dhan') {
      fetchDhanOrdersTradesBook();
      activeFetchFunction.value = 'fetchDhanOrdersTradesBook';
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
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHotKeys);
  if (socket.value) {
    socket.value.close();
  }
  clearInterval(timer);
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
      else if (newBroker.brokerName === 'Dhan') {
        activeFetchFunction.value = 'fetchDhanPositions';
        await fetchDhanPositions();
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
      else if (newBroker.brokerName === 'Dhan') {
        activeFetchFunction.value = 'fetchDhanOrdersTradesBook';
        await fetchDhanOrdersTradesBook();
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
  console.log('Selected Call Strike changed:', newStrike);
  if (newStrike !== oldStrike) {
    defaultCallSecurityId.value = newStrike.securityId || 'N/A';
  }
});

watch(selectedPutStrike, (newStrike, oldStrike) => {
  console.log('Selected Put Strike changed:', newStrike);
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
      latestCallLTP.value = 'N/A';
      latestPutLTP.value = 'N/A';

      setFlattradeCredentials();
    }
  },
  { deep: true }
);

// Modify the watcher for selectedMasterSymbol
watch(selectedMasterSymbol, async (newValue, oldValue) => {
  console.log('selectedMasterSymbol changed:', newValue);
  saveUserChoice();
  updateAvailableQuantities();

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

watch(activeTab, () => {
  // Update activeFetchFunction based on the new broker
  if (activeTab.value === 'positions') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      activeFetchFunction.value = 'fetchFlattradePositions';
      fetchFlattradePositions();
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      activeFetchFunction.value = 'fetchShoonyaPositions';
      fetchShoonyaPositions();
    }
    else if (selectedBroker.value?.brokerName === 'Dhan') {
      activeFetchFunction.value = 'fetchDhanPositions';
      fetchDhanPositions();
    }
  } else if (activeTab.value === 'trades') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      activeFetchFunction.value = 'fetchFlattradeOrdersTradesBook';
      fetchFlattradeOrdersTradesBook();
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      activeFetchFunction.value = 'fetchShoonyaOrdersTradesBook';
      fetchShoonyaOrdersTradesBook();
    }
    else if (selectedBroker.value?.brokerName === 'Dhan') {
      activeFetchFunction.value = 'fetchDhanOrdersTradesBook';
      fetchDhanOrdersTradesBook();
    }
  }
});

// Watcher to update localStorage when enableHotKeys changes
watch(enableHotKeys, (newValue) => {
  localStorage.setItem('EnableHotKeys', newValue.toString());
});
</script>
