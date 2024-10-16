<template>
  <NavigationComponent />

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
    <div class="col-6 col-md-5 col-lg-3 text-center">
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
    <div class="col-4 col-md-4 col-lg-3 text-center mt-3 mt-md-3 mt-lg-0">
      <p class="mb-1"><b>Total Funds</b></p>
      <p class="mt-2 mb-0">
        ₹ {{ availableBalance !== null ? availableBalance.toLocaleString('en-IN', {
          maximumFractionDigits: 2
        }) : 'N/A' }}
      </p>
    </div>

    <!-- Utilized Margin -->
    <div class="col-4 col-md-4 col-lg-2 text-center mt-3 mt-md-3 mt-lg-0">
      <p class="mb-1"><b>Utilized Margin</b></p>
      <p class="mt-2 mb-0">₹ {{ usedAmount }}</p>
    </div>

    <!-- Today's Expiry -->
    <div class="col-4 col-md-4 col-lg-2 text-end mt-3 mt-md-3 mt-lg-0">
      <p class="mb-1"><b>Today's Expiry</b></p>
      <p class="mb-0 d-flex align-items-center justify-content-center">
        <span class="fs-4 text-decoration-none me-2 text-danger" id="events-tab" type="button" data-bs-toggle="modal"
          data-bs-target="#eventsModal">
          📅
        </span>
        <b v-if="todayExpirySymbol" class="text-danger">{{ todayExpirySymbol }}</b>
        <b v-else class="text-secondary">-</b>
      </p>
    </div>
  </section>

  <!-- Total Profit & Net PNL -->
  <section class="row py-3" :class="{ 'MTM': stickyMTM }">
    <div class="col-12 col-md-5 col-lg-5">
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
    <div class="col-6 col-md-4 col-lg-4 mt-3 mt-md-0 mt-lg-0">
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
    <div class="col-6 col-md-3 col-lg-3 d-flex justify-content-center align-items-center mt-3 mt-md-0 mt-lg-0">
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

  <!-- Kill Switch MessageWindow -->
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
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-5 fw-bold">
              {{ killSwitchRemainingTime }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trade Warning MessageWindow -->
  <section v-if="riskReached && !killSwitchActive" class="row py-1">
    <div class="col-12">
      <div class="bg-warning text-dark p-3 rounded-3 shadow">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h5 class="mb-2">Trade Warning</h5>
            <p class="mb-0">Risk Threshold Reached!</p>
          </div>
          <div class="text-center">
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-5 fw-bold">
              Make Adjustments Or Close Positions
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Trade Success MessageWindow -->
  <section v-if="targetReached && !killSwitchActive" class="row py-1">
    <div class="col-12">
      <div class="bg-success text-white p-3 rounded-3 shadow">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h5 class="mb-2">Trade Success</h5>
            <p class="mb-0">Target Reached!</p>
          </div>
          <div class="text-center">
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-5 fw-bold">
              Close Positions to Lock in Profits
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
          <!-- <div class="col-6 col-md-4 col-lg-2">
          <label for="Segment" class="form-label mb-0">Segment</label>
          <select
            id="Segment"
            class="form-select"
            aria-label="Segment"
            :class="{ 'disabled-form': isFormDisabled }"
            disabled
          >
            <option value="Options" selected>Options</option>
            <option value="Futures">Futures</option>
          </select>
        </div> -->

          <!-- Master Symbol Selection -->
          <div class="col-6 col-md-4 col-lg-3">
            <label for="MasterSymbol" class="form-label mb-0">Master Symbol</label>
            <select id="MasterSymbol" class="form-select" aria-label="Master Symbol" v-model="selectedMasterSymbol"
              :class="{ 'disabled-form': isFormDisabled }">
              <option v-for="symbol in exchangeSymbols[selectedExchange]" :key="symbol" :value="symbol">
                {{ symbol }}
              </option>
            </select>
          </div>

          <!-- Expiry Date Selection -->
          <div class="col-6 col-md-4 col-lg-3">
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
                :max="maxLots" @input="updateSelectedQuantity" :class="{ 'disabled-form': isFormDisabled }" />
              <span class="input-group-text">{{ selectedQuantity }}</span>
            </div>
          </div>
        </div>

        <div class="row mt-3">
          <!-- Order Type -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="OrderType" class="form-label mb-0">Order Type</label>
            <div class="input-group">
              <select id="OrderType" class="form-select w-75" aria-label="OrderType" v-model="selectedOrderType"
                :class="{ 'disabled-form': isFormDisabled }" @change="handleOrderTypeChange">
                <option v-for="(displayType, index) in displayOrderTypes" :key="orderTypes[index]"
                  :value="orderTypes[index]">
                  {{ displayType }}
                </option>
              </select>
              <!-- Offset input (only visible for 'Limit at Offset' order type) -->
              <span class="input-group-text flex-shrink w-25 p-0 ps-2" v-if="isOffsetOrderType">
                <input type="number" id="LimitOffset" class="form-control border-0 p-1" min="-9" max="9"
                  v-model="limitOffset" @input="handleOrderTypeChange" :class="{ 'disabled-form': isFormDisabled }" />
              </span>
            </div>
          </div>

          <!-- Predefined Stoploss -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="enableStoploss" class="form-label mb-0">Predefined Stoploss</label>
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" id="enableStoploss"
                  aria-label="Enable Predefined Stoploss" v-model="enableStoploss"
                  :class="{ 'disabled-form': isFormDisabled }" />
              </div>
              <input type="number" class="form-control" id="stoplossValue" aria-label="Predefined Stoploss (points)"
                v-model="stoplossValue" :class="{ 'disabled-form': isFormDisabled }" />
              <span class="input-group-text">₹ Points</span>
            </div>
          </div>
          <!-- Predefined Target -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="enableTarget" class="form-label mb-0">Predefined Target</label>
            <div class="input-group mb-3">
              <div class="input-group-text">
                <input class="form-check-input mt-0" type="checkbox" id="enableTarget"
                  aria-label="Enable Predefined Target" v-model="enableTarget"
                  :class="{ 'disabled-form': isFormDisabled }" />
              </div>
              <input type="number" class="form-control" id="targetValue" aria-label="Predefined Target (points)"
                v-model="targetValue" :class="{ 'disabled-form': isFormDisabled }" />
              <span class="input-group-text">₹ Points</span>
            </div>
          </div>
          <!-- Steadfast AI Assistant -->
          <div class="col-6 col-md-3 col-lg-3">
            <label for="SteadfastAIAssistant" class="form-label mb-1">Steadfast AI Assistant</label>
            <div class="input-group mb-3">
              <button data-bs-toggle="modal" data-bs-target="#SteadfastAIAssistantModal"
                class="btn btn-sm btn-outline-danger w-100">✨ Open Chat</button>
            </div>
          </div>
        </div>

        <!-- Trading Symbols & Strikes -->
        <div class="row align-items-center justify-content-between mt-3">
          <!-- Call Strike Selection -->
          <div class="col-12 col-md-4 col-lg-4">
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
              <span class="input-group-text" :class="{
                'text-success': parseFloat(latestCallLTP) > parseFloat(callOpenPrice),
                'text-danger': parseFloat(latestCallLTP) < parseFloat(callOpenPrice)
              }">{{ latestCallLTP }}
              </span>
            </div>
            <div class="mt-1">
              <span v-if="socket && socket.readyState === 1 && latestCallLTP && selectedQuantity">
                Margin Required: ₹{{ (parseFloat(latestCallLTP) * selectedQuantity).toFixed(2) }}
              </span>
              <span v-else-if="orderMargin.call !== null">Margin Required: ₹{{ orderMargin.call }}</span>
              <span v-else>Margin: Not available</span>
            </div>
            <div v-if="showStrikeDetails">
              <div class="mt-2">{{ selectedCallStrike.tradingSymbol }}</div>
              <div class="text-muted">Security ID: {{ selectedCallStrike.securityId }}</div>
            </div>
            <!-- Call OHLC Values -->
            <div class="d-flex w-100 justify-content-around flex-wrap" v-if="showOHLCValues">
              <span class="text-primary">O: {{ callOpenPrice }}</span>
              <span class="text-success">H: {{ callHighPrice }}</span>
              <span class="text-danger">L: {{ callLowPrice }}</span>
              <span class="text-warning">C: {{ callClosePrice }}</span>
            </div>
            <!-- LTP Range Bar for Call Strike -->
            <div v-if="showLTPRangeBar" class="ltp-range-bar mt-3 mb-2">
              <div class="ltp-range">
                <div class="ltp-range-fill" :style="{ width: callLtpRangeWidth + '%' }"></div>
                <div class="ltp-range-marker" :style="{ left: callLtpRangeWidth + '%' }"></div>
                <div class="ltp-range-open-marker" :style="{ left: callOpenMarkerPosition + '%' }"></div>
              </div>
              <div class="d-flex justify-content-between">
                <span class="ltp-range-low">L: {{ callLowPrice }}</span>
                <span class="ltp-range-high">H: {{ callHighPrice }}</span>
              </div>
            </div>
            <!-- Call Market Depth -->
            <div v-if="isCallDepthAvailable & marketDepth">
              <h6>Market Depth</h6>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Buy Price</th>
                    <th>Buy Qty</th>
                    <th>Sell Price</th>
                    <th>Sell Qty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ callDepth.bp1 }}</td>
                    <td>{{ callDepth.bq1 }}</td>
                    <td>{{ callDepth.sp1 }}</td>
                    <td>{{ callDepth.sq1 }}</td>
                  </tr>
                  <tr>
                    <td>{{ callDepth.bp2 }}</td>
                    <td>{{ callDepth.bq2 }}</td>
                    <td>{{ callDepth.sp2 }}</td>
                    <td>{{ callDepth.sq2 }}</td>
                  </tr>
                  <tr>
                    <td>{{ callDepth.bp3 }}</td>
                    <td>{{ callDepth.bq3 }}</td>
                    <td>{{ callDepth.sp3 }}</td>
                    <td>{{ callDepth.sq3 }}</td>
                  </tr>
                  <tr>
                    <td>{{ callDepth.bp4 }}</td>
                    <td>{{ callDepth.bq4 }}</td>
                    <td>{{ callDepth.sp4 }}</td>
                    <td>{{ callDepth.sq4 }}</td>
                  </tr>
                  <tr>
                    <td>{{ callDepth.bp5 }}</td>
                    <td>{{ callDepth.bq5 }}</td>
                    <td>{{ callDepth.sp5 }}</td>
                    <td>{{ callDepth.sq5 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Live Underlying Price -->
          <div class="col-12 col-md-4 col-lg-4 text-center">
            <p class="mb-0" v-if="selectedMasterSymbol === 'NIFTY'">
              Nifty 50:
              <b :class="{
                'text-success': parseFloat(niftyPrice) > parseFloat(masterOpenPrice),
                'text-danger': parseFloat(niftyPrice) < parseFloat(masterOpenPrice)
              }">{{ niftyPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'BANKNIFTY'">
              Bank Nifty:
              <b :class="{
                'text-success': parseFloat(bankNiftyPrice) > parseFloat(masterOpenPrice),
                'text-danger': parseFloat(bankNiftyPrice) < parseFloat(masterOpenPrice)
              }">{{ bankNiftyPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'FINNIFTY'">
              Fin Nifty:
              <b :class="{
                'text-success': parseFloat(finniftyPrice) > parseFloat(masterOpenPrice),
                'text-danger': parseFloat(finniftyPrice) < parseFloat(masterOpenPrice)
              }">{{ finniftyPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'MIDCPNIFTY'">
              Nifty Mid Select:
              <b :class="{
                'text-success': parseFloat(midcpniftyPrice) > parseFloat(masterOpenPrice),
                'text-danger': parseFloat(midcpniftyPrice) < parseFloat(masterOpenPrice)
              }">{{ midcpniftyPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'SENSEX'">
              Sensex:
              <b :class="{
                'text-success': parseFloat(sensexPrice) > parseFloat(masterOpenPrice),
                'text-danger': parseFloat(sensexPrice) < parseFloat(masterOpenPrice)
              }">{{ sensexPrice }}</b>
            </p>
            <p class="mb-0" v-if="selectedMasterSymbol === 'BANKEX'">
              Bankex:
              <b :class="{
                'text-success': parseFloat(bankexPrice) > parseFloat(masterOpenPrice),
                'text-danger': parseFloat(bankexPrice) < parseFloat(masterOpenPrice)
              }">{{ bankexPrice }}</b>
            </p>
            <!-- Master OHLC Values -->
            <div class="d-flex w-100 justify-content-around flex-wrap" v-if="showOHLCValues">
              <span class="text-primary">O: {{ masterOpenPrice }}</span>
              <span class="text-success">H: {{ masterHighPrice }}</span>
              <span class="text-danger">L: {{ masterLowPrice }}</span>
              <span class="text-warning">C: {{ masterClosePrice }}</span>
            </div>
            <!-- LTP Range Bar for Live Underlying Price -->
            <div v-if="showLTPRangeBar" class="ltp-range-bar mt-3 mb-2">
              <div class="ltp-range">
                <div class="ltp-range-fill" :style="{ width: ltpRangeWidth + '%' }"></div>
                <div class="ltp-range-marker" :style="{ left: ltpMarkerPosition + '%' }"></div>
                <div class="ltp-range-open-marker" :style="{ left: openMarkerPosition + '%' }"></div>
              </div>
              <div class="d-flex justify-content-between">
                <span class="ltp-range-low">L: {{ masterLowPrice }}</span>
                <span class="ltp-range-high">H: {{ masterHighPrice }}</span>
              </div>
            </div>
          </div>

          <!-- Put Strike Selection -->
          <div class="col-12 col-md-4 col-lg-4">
            <label for="PutStrike" class="form-label mb-0 d-flex flex-row justify-content-between">
              <span class="ms-4">LTP</span>
              <span>Put Strike</span>
            </label>
            <div class="input-group">
              <span class="input-group-text" :class="{
                'text-success': parseFloat(latestPutLTP) > parseFloat(putOpenPrice),
                'text-danger': parseFloat(latestPutLTP) < parseFloat(putOpenPrice)
              }">{{ latestPutLTP }}
              </span>
              <select id="PutStrike" class="form-select" aria-label="Put Strike" v-model="selectedPutStrike"
                :class="{ 'disabled-form': isFormDisabled }">
                <option v-for="strike in putStrikes" :key="strike.securityId" :value="strike">
                  {{ strike.strikePrice }}
                </option>
              </select>
            </div>
            <div class="mt-1">
              <span v-if="socket && socket.readyState === 1 && latestPutLTP && selectedQuantity">
                Margin Required: ₹{{ (parseFloat(latestPutLTP) * selectedQuantity).toFixed(2) }}
              </span>
              <span v-else-if="orderMargin.put !== null">Margin Required: ₹{{ orderMargin.put }}</span>
              <span v-else>Margin: Not available</span>
            </div>
            <div v-if="showStrikeDetails">
              <div class="mt-2">{{ selectedPutStrike.tradingSymbol }}</div>
              <div class="text-muted">Security ID: {{ selectedPutStrike.securityId }}</div>
            </div>
            <!-- Put OHLC Values -->
            <div class="d-flex w-100 justify-content-around flex-wrap" v-if="showOHLCValues">
              <span class="text-primary">O: {{ putOpenPrice }}</span>
              <span class="text-success">H: {{ putHighPrice }}</span>
              <span class="text-danger">L: {{ putLowPrice }}</span>
              <span class="text-warning">C: {{ putClosePrice }}</span>
            </div>
            <!-- LTP Range Bar for Put Strike -->
            <div v-if="showLTPRangeBar" class="ltp-range-bar mt-3 mb-2">
              <div class="ltp-range">
                <div class="ltp-range-fill" :style="{ width: putLtpRangeWidth + '%' }"></div>
                <div class="ltp-range-marker" :style="{ left: putLtpRangeWidth + '%' }"></div>
                <div class="ltp-range-open-marker" :style="{ left: putOpenMarkerPosition + '%' }"></div>
              </div>
              <div class="d-flex justify-content-between">
                <span class="ltp-range-low">L: {{ putLowPrice }}</span>
                <span class="ltp-range-high">H: {{ putHighPrice }}</span>
              </div>
            </div>
            <!-- Put Market Depth -->
            <div v-if="isPutDepthAvailable & marketDepth">
              <h6>Market Depth</h6>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Buy Price</th>
                    <th>Buy Qty</th>
                    <th>Sell Price</th>
                    <th>Sell Qty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ putDepth.bp1 }}</td>
                    <td>{{ putDepth.bq1 }}</td>
                    <td>{{ putDepth.sp1 }}</td>
                    <td>{{ putDepth.sq1 }}</td>
                  </tr>
                  <tr>
                    <td>{{ putDepth.bp2 }}</td>
                    <td>{{ putDepth.bq2 }}</td>
                    <td>{{ putDepth.sp2 }}</td>
                    <td>{{ putDepth.sq2 }}</td>
                  </tr>
                  <tr>
                    <td>{{ putDepth.bp3 }}</td>
                    <td>{{ putDepth.bq3 }}</td>
                    <td>{{ putDepth.sp3 }}</td>
                    <td>{{ putDepth.sq3 }}</td>
                  </tr>
                  <tr>
                    <td>{{ putDepth.bp4 }}</td>
                    <td>{{ putDepth.bq4 }}</td>
                    <td>{{ putDepth.sp4 }}</td>
                    <td>{{ putDepth.sq4 }}</td>
                  </tr>
                  <tr>
                    <td>{{ putDepth.bp5 }}</td>
                    <td>{{ putDepth.bq5 }}</td>
                    <td>{{ putDepth.sp5 }}</td>
                    <td>{{ putDepth.sq5 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Add this after the Put Strike Selection -->
          <div v-if="additionalSymbols" class="col-12 mt-3">
            <h5>Additional Strike LTPs</h5>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Call LTP</th>
                    <th>Strike</th>
                    <th>Put LTP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="strike in additionalStrikes" :key="strike">
                    <td>{{ additionalStrikeLTPs.call[strike] || 'N/A' }}</td>
                    <td><strong>{{ strike }}</strong></td>
                    <td>{{ additionalStrikeLTPs.put[strike] || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="row align-items-center justify-content-between mt-3">
          <!-- Call Strike Buy/Sell Buttons -->
          <div class="order-1 order-md-1 order-lg-1 col-6 col-md-4 col-lg-4">
            <div class="btn-group col-12 col-md-10 col-lg-10">
              <button type="button" class="btn btn-sm btn-success fs-5 my-2 w-75"
                @click="handleOrderClick('BUY', 'CALL')"
                :data-bs-toggle="selectedOrderType === orderTypes[1] ? 'modal' : null"
                :data-bs-target="selectedOrderType === orderTypes[1] ? '#PlaceLimitOrderWindow' : null">
                <span v-if="enableHotKeys">⬆️</span>
                Buy CE
              </button>
              <button type="button"
                class="btn btn-sm btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent" data-bs-offset="0,-7">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" @click="setOrderDetails('BUY', 'CALL')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWithResetOrderTypeWindow">Place Limit Order</a>
                </li>
                <li>
                  <a class="dropdown-item" @click="addToBasket('BUY', 'CALL')">Add to Basket</a>
                </li>
              </ul>
            </div>
            <div class="btn-group col-12 col-md-10 col-lg-10">
              <button type="button" class="btn btn-sm btn-danger fs-5 w-75" @click="handleOrderClick('SELL', 'CALL')"
                :data-bs-toggle="selectedOrderType === orderTypes[1] ? 'modal' : null"
                :data-bs-target="selectedOrderType === orderTypes[1] ? '#PlaceLimitOrderWindow' : null">
                <span v-if="enableHotKeys">⬅️</span>
                Sell CE
              </button>
              <button type="button"
                class="btn btn-sm btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" @click="setOrderDetails('SELL', 'CALL')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWithResetOrderTypeWindow">Place Limit Order</a>
                </li>
                <li>
                  <a class="dropdown-item" @click="addToBasket('SELL', 'CALL')">Add to Basket</a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Close & Cancel Buttons -->
          <div class="order-3 order-md-2 order-lg-2 col-12 col-md-4 col-lg-4 text-center">
            <div class="row mt-2">
              <div class="col-6 col-md-12 col-lg-12">
                <button v-if="selectedShoonyaPositionsSet.size === 0 && selectedFlattradePositionsSet.size === 0"
                  class="btn btn-sm btn-outline fs-5 col-12 col-md-11 col-lg-10" @click="closeAllPositions">
                  <span v-if="enableHotKeys">F6 / </span>
                  Close All
                </button>
                <button v-if="selectedShoonyaPositionsSet.size > 0 || selectedFlattradePositionsSet.size > 0"
                  class="btn btn-sm btn-outline fs-5 col-12 col-md-11 col-lg-10" @click="closeSelectedPositions">
                  <span v-if="enableHotKeys">F6 / </span>
                  Close Selected
                </button>
              </div>
              <div class="col-6 col-md-12 col-lg-12">
                <button class="btn btn-sm btn-outline fs-5 col-12 col-md-11 col-lg-10 mt-md-2 mt-lg-2"
                  @click="cancelPendingOrders">
                  <span v-if="enableHotKeys">F7 / </span>
                  Cancel Orders
                </button>
              </div>
            </div>
          </div>
          <!-- Put Strike Buy/Sell Buttons -->
          <div class="order-2 order-md-3 order-lg-3 col-6 col-md-4 col-lg-4 text-end">
            <div class="btn-group col-12 col-md-10 col-lg-10">
              <button type="button" class="btn btn-sm btn-success fs-5 my-2 w-75"
                @click="handleOrderClick('BUY', 'PUT')"
                :data-bs-toggle="selectedOrderType === orderTypes[1] ? 'modal' : null"
                :data-bs-target="selectedOrderType === orderTypes[1] ? '#PlaceLimitOrderWindow' : null">
                <span v-if="enableHotKeys">⬇️</span>
                Buy PE
              </button>
              <button type="button"
                class="btn btn-sm btn-outline-success fs-5 my-2 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent" data-bs-offset="0,-7">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" @click="setOrderDetails('BUY', 'PUT')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWithResetOrderTypeWindow">Place Limit Order</a>
                </li>
                <li>
                  <a class="dropdown-item" @click="addToBasket('BUY', 'PUT')">Add to Basket</a>
                </li>
              </ul>
            </div>
            <div class="btn-group col-12 col-md-10 col-lg-10">
              <button type="button" class="btn btn-sm btn-danger fs-5 w-75" @click="handleOrderClick('SELL', 'PUT')"
                :data-bs-toggle="selectedOrderType === orderTypes[1] ? 'modal' : null"
                :data-bs-target="selectedOrderType === orderTypes[1] ? '#PlaceLimitOrderWindow' : null">
                <span v-if="enableHotKeys">➡️</span>
                Sell PE
              </button>
              <button type="button"
                class="btn btn-sm btn-outline-danger fs-5 dropdown-toggle dropdown-toggle-split w-25"
                data-bs-toggle="dropdown" aria-expanded="false" data-bs-reference="parent">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" @click="setOrderDetails('SELL', 'PUT')" data-bs-toggle="modal"
                    data-bs-target="#PlaceLimitOrderWithResetOrderTypeWindow">Place Limit Order</a>
                </li>
                <li>
                  <a class="dropdown-item" @click="addToBasket('SELL', 'PUT')">Add to Basket</a>
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
          <button class="nav-link" id="basket-tab" data-bs-toggle="tab" data-bs-target="#basket-tab-pane" type="button"
            role="tab" aria-controls="basket-tab-pane" aria-selected="false">
            🧺 Basket Orders
          </button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="positions-tab-pane" role="tabpanel" aria-labelledby="positions-tab"
          tabindex="0">
          <div class="row align-items-center">
            <div class="col-md-4 col-lg-4 text-center py-2">
              <p class="mb-0">
                <b>Net Qty:
                  <span :class="totalNetQty > 0 ? 'text-success' : totalNetQty < 0 ? 'text-danger' : null">
                    {{ totalNetQty }}
                  </span>
                </b>
              </p>
            </div>
            <div class="col-md-4 col-lg-6 text-center py-2">
              <p class="mb-0">
                <span>Total Buy Value: <b>₹ {{ totalBuyValue.toFixed(2) }}</b></span>
                <span class="ms-3">Total Sell Value: <b>₹ {{ totalSellValue.toFixed(2) }}</b></span>
              </p>
              <p class="mb-0"></p>
            </div>
            <!-- 1 Click Reverse Positions for Reverse All & Selected positions -->
            <!-- <div class="col-md-4 col-lg-2 text-center">
            <button
              class="btn btn-sm btn-outline-secondary me-1"
              data-bs-toggle="modal"
              data-bs-target="#ReversePositionsConfirmationModal"
              @click="setReverseMode('selected')"
              v-if="selectedShoonyaPositionsSet.size > 0 || selectedFlattradePositionsSet.size > 0"
            >
              🔃 Selected
            </button>
            <button
              class="btn btn-sm btn-outline-secondary"
              data-bs-toggle="modal"
              data-bs-target="#ReversePositionsConfirmationModal"
              @click="setReverseMode('all')"
            >
              🔃 Reverse
            </button>
          </div> -->
          </div>

          <!-- Flattrade Positions -->
          <PositionsTableComponent v-if="activeFetchFunction === 'fetchFlattradePositions'"
            :positions="flatTradePositionBook" :selected-broker="selectedBroker"
            :selected-positions-set="selectedFlattradePositionsSet"
            @update:selected-positions-set="selectedFlattradePositionsSet = $event"
            @set-stoploss="(position, type) => setStoploss(position, type)" @remove-stoploss="removeStoploss"
            @increase-stoploss="increaseStoploss" @decrease-stoploss="decreaseStoploss" @set-target="setTarget"
            @remove-target="removeTarget" @increase-target="increaseTarget" @decrease-target="decreaseTarget" />

          <!-- Shoonya Positions -->
          <PositionsTableComponent v-if="activeFetchFunction === 'fetchShoonyaPositions'"
            :positions="shoonyaPositionBook" :selected-broker="selectedBroker"
            :selected-positions-set="selectedShoonyaPositionsSet"
            @update:selected-positions-set="selectedShoonyaPositionsSet = $event"
            @set-stoploss="(position, type) => setStoploss(position, type)" @remove-stoploss="removeStoploss"
            @increase-stoploss="increaseStoploss" @decrease-stoploss="decreaseStoploss" @set-target="setTarget"
            @remove-target="removeTarget" @increase-target="increaseTarget" @decrease-target="decreaseTarget" />

          <!-- PaperTrading Positions -->
          <PositionsTableComponent v-if="activeFetchFunction === 'fetchPaperTradingPositions'"
            :positions="paperTradingPositionBook" :selected-broker="selectedBroker"
            :selected-positions-set="selectedPaperPositionsSet"
            @update:selected-positions-set="selectedPaperPositionsSet = $event"
            @set-stoploss="(position, type) => setStoploss(position, type)" @remove-stoploss="removeStoploss"
            @increase-stoploss="increaseStoploss" @decrease-stoploss="decreaseStoploss" @set-target="setTarget"
            @remove-target="removeTarget" @increase-target="increaseTarget" @decrease-target="decreaseTarget" />

          <p class="text-secondary my-2">
            Aim for a 1-3% daily target and set a 1-1.5% stoploss to manage trades effectively and
            minimize losses.
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
                        {{ item.order.status }} {{ item.order.rejreason }}
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
                      <td class="text-success">
                        {{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}
                      </td>
                    </tr>
                  </template>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">
                    No orders or trades on selected broker {{ selectedBroker.brokerName }}
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
                        {{ item.order.status }} {{ item.order.rejreason }}
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
                      <td class="text-success">
                        {{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}
                      </td>
                    </tr>
                  </template>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">
                    No orders or trades on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- PaperTrading Trades -->
          <div class="table-responsive" v-if="activeFetchFunction === 'fetchPaperTradingOrdersTradesBook'">
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
                        {{ item.order.status }} {{ item.order.rejreason }}
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
                      <td class="text-success">
                        {{ item.trade.stat === 'Ok' ? 'EXECUTED' : item.trade.stat }}
                      </td>
                    </tr>
                  </template>
                </template>
                <tr v-else>
                  <td colspan="9" class="text-center">
                    No orders or trades on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-secondary my-2">
            This trades tab fetches orders and trades from selected broker and combines them. Only
            failed orders are shown. If the order is successfully placed, you'll only see the
            respective trade.
          </p>
        </div>
        <div class="tab-pane fade" id="basket-tab-pane" role="tabpanel" aria-labelledby="basket-tab" tabindex="0">
          <div class="row py-3" v-if="experimentalFeatures">
            <div class="col-12">
              <h5>Ready Made Strategies</h5>
              <div class="mb-3">
                <div class="btn-group" role="group">
                  <button @click="setStrategyType('Bullish')"
                    :class="['btn', 'btn-outline-primary', { active: strategyType === 'Bullish' }]">
                    Bullish
                  </button>
                  <button @click="setStrategyType('Bearish')"
                    :class="['btn', 'btn-outline-primary', { active: strategyType === 'Bearish' }]">
                    Bearish
                  </button>
                  <button @click="setStrategyType('Neutral')"
                    :class="['btn', 'btn-outline-primary', { active: strategyType === 'Neutral' }]">
                    Neutral
                  </button>
                  <button @click="setStrategyType('Others')"
                    :class="['btn', 'btn-outline-primary', { active: strategyType === 'Others' }]">
                    Others
                  </button>
                </div>
                <select v-model="selectedExpiry" class="form-select d-inline-block w-auto ms-2">
                  <option v-for="expiry in expiryDates" :key="expiry" :value="expiry">
                    {{ expiry }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-12">
              <div class="row">
                <div v-for="strategy in filteredStrategies" :key="strategy.id" class="col-md-3 mb-3">
                  <div class="card strategy-card" @click="loadStrategy(strategy)">
                    <div class="card-body">
                      <h6 class="card-title">{{ strategy.name }}</h6>
                      <img :src="strategy.image" class="img-fluid mb-2" :alt="strategy.name" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row py-3">
            <div class="col-12">
              <h5>Basket Name</h5>
              <div class="mb-3">
                <input v-model="basketName" placeholder="Enter basket name" class="form-control mb-2" />
              </div>
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Product</th>
                    <th>Order Type</th>
                    <th>Price</th>
                    <th>LTP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in sortedBasketOrders" :key="order.id">
                    <td>
                      {{ order.tradingSymbol }}
                      <select v-model="order.strikePrice" @change="updateTradingSymbol(order)"
                        class="form-select form-select-sm mt-1">
                        <option v-for="strike in availableStrikes" :key="strike" :value="strike">
                          {{ strike }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select v-model="order.transactionType" class="form-select form-select-sm">
                        <option value="B">BUY</option>
                        <option value="S">SELL</option>
                      </select>
                      {{ order.optionType }}
                    </td>
                    <td>
                      <div class="input-group input-group-sm">
                        <input type="number" class="form-control" v-model.number="order.lots" :min="1" :max="maxLots"
                          @input="updateBasketOrderQuantity(order)" />
                        <span class="input-group-text">{{ order.quantity }}</span>
                      </div>
                    </td>
                    <td>{{ order.productType }}</td>
                    <td>
                      <select v-model="order.orderType" class="form-select form-select-sm">
                        <option v-for="orderType in orderTypes" :key="orderType" :value="orderType">
                          {{ orderType }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input v-if="order.orderType === 'LMT'" type="number" class="form-control form-control-sm"
                        v-model.number="order.price" placeholder="Price" />
                      <span v-else>-</span>
                    </td>
                    <td>{{ basketLTPs[order.id] }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary me-2" @click="placeBasketOrder(order)">
                        Place
                      </button>
                      <button class="btn btn-sm btn-danger" @click="removeFromBasket(order.id)">
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="d-flex justify-content-end">
                <button @click="saveBasket" class="btn btn-outline-success ms-2">💾 Save</button>
              </div>
            </div>
          </div>
          <div class="row py-3">
            <div class="col-12">
              <h5>Saved Baskets</h5>
              <div v-for="basket in savedBaskets" :key="basket.id" class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">{{ basket.name }}</h6>
                  <div>
                    <button @click="placeBasket(basket.id)" class="btn btn-sm btn-success me-2">
                      Place
                    </button>
                    <button @click="loadBasket(basket.id)" class="btn btn-sm btn-primary me-2">
                      Edit
                    </button>
                    <button @click="deleteBasket(basket.id)" class="btn btn-sm btn-danger me-2">
                      Delete
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Product</th>
                        <th>Order Type</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="order in basket.orders" :key="order.id">
                        <td>{{ order.tradingSymbol }}</td>
                        <td>
                          {{ order.transactionType === 'B' ? 'BUY' : 'SELL' }} {{ order.optionType }}
                        </td>
                        <td>{{ order.quantity }}</td>
                        <td>{{ order.productType }}</td>
                        <td>{{ order.orderType }}</td>
                        <td>{{ order.price }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Toast Alert -->
  <ToastAlert :show="showToast" :message="toastMessage" :sound-enabled="notificationSound"
    :selected-sound="selectedSound" @update:show="updateToastVisibility" />

  <!-- Limit Price Input Modal (conditionally rendered) -->
  <div class="modal fade" id="PlaceLimitOrderWindow" tabindex="-1" aria-labelledby="PlaceLimitOrderWindowLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="PlaceLimitOrderWindowLabel">
            {{ modalTransactionType }} {{ modalOptionType }}: {{ selectedMasterSymbol }} {{
              selectedStrike.strikePrice }} {{ selectedStrike.expiryDate }}
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form @submit.prevent>
          <div class="modal-body">
            <div class="col-12">
              <label for="LimitPrice" class="form-label mb-0">Limit Price</label>
              <input type="number" id="LimitPrice" class="form-control" v-model="limitPrice"
                placeholder="Enter limit price" :class="{ 'is-invalid': !isValidLimitPrice }" min="1" step="1" />
              <div class="invalid-feedback" v-if="!isValidLimitPrice">
                {{ limitPriceErrorMessage }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm fs-5 btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-sm fs-5 btn-primary" :disabled="!isValidLimitPrice"
              data-bs-dismiss="modal" @click="validateAndPlaceOrder">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Limit Price Input Modal with Reset Order Type (conditionally rendered) -->
  <div class="modal fade" id="PlaceLimitOrderWithResetOrderTypeWindow" tabindex="-1"
    aria-labelledby="PlaceLimitOrderWithResetOrderTypeWindowLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="PlaceLimitOrderWithResetOrderTypeWindowLabel">
            {{ modalTransactionType }} {{ modalOptionType }}: {{ selectedMasterSymbol }} {{
              selectedStrike.strikePrice }} {{ selectedStrike.expiryDate }}
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
            @click="resetOrderTypeIfNeeded"></button>
        </div>
        <form @submit.prevent>
          <div class="modal-body">
            <div class="col-12">
              <label for="LimitPrice" class="form-label mb-0">Limit Price</label>
              <input type="number" id="LimitPrice" class="form-control" v-model="limitPrice"
                placeholder="Enter limit price" :class="{ 'is-invalid': !isValidLimitPrice }" min="1" step="1" />
              <div class="invalid-feedback" v-if="!isValidLimitPrice">
                {{ limitPriceErrorMessage }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sm fs-5 btn-secondary" data-bs-dismiss="modal"
              @click="resetOrderTypeIfNeeded">
              Cancel
            </button>
            <button type="button" class="btn btn-sm fs-5 btn-primary" :disabled="!isValidLimitPrice"
              data-bs-dismiss="modal" @click="validateAndPlaceOrder">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Kill Swtich Activation Confirmation Modal -->
  <div class="modal fade" id="KillSwitchActivationConfirmationModal" tabindex="-1"
    aria-labelledby="KillSwitchActivationConfirmationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="KillSwitchActivationConfirmationModalLabel">
            Confirm Kill Switch Activation
          </h5>
        </div>
        <div class="modal-body">
          <blockquote class="blockquote">
            This action will <b class="text-danger">close all positions</b> and block trading for the
            next 6 hours.
          </blockquote>
          <p>Are you sure you want to continue?</p>
        </div>
        <div class="modal-footer">
          <div class="d-flex flex-row justify-content-between w-100">
            <button type="button" class="btn btn-sm fs-5 btn-outline-secondary w-50 me-1" data-bs-dismiss="modal">
              No
            </button>
            <button type="button" class="btn btn-sm fs-5 btn-danger w-50 ms-1" data-bs-dismiss="modal"
              @click="toggleKillSwitch">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Reverse All/Selected Positions Confirmation Modal -->
  <div class="modal fade" id="ReversePositionsConfirmationModal" tabindex="-1"
    aria-labelledby="ReversePositionsConfirmationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="ReversePositionsConfirmationModalLabel">
            Confirm Reverse Positions
          </h5>
        </div>
        <div class="modal-body">
          <blockquote class="blockquote">
            This action will
            <b class="text-danger">reverse {{ reverseMode === 'all' ? 'all' : 'selected' }} positions</b>
          </blockquote>
          <p>Are you sure you want to continue?</p>
        </div>
        <div class="modal-footer">
          <div class="d-flex flex-row justify-content-between w-100">
            <button type="button" class="btn btn-sm btn-outline-secondary w-50 me-1" data-bs-dismiss="modal">
              No
            </button>
            <button type="button" class="btn btn-sm btn-primary w-50 ms-1" data-bs-dismiss="modal"
              @click="reversePositions">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Events Modal -->
  <div class="modal fade" id="eventsModal" tabindex="-1" aria-labelledby="eventsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="eventsModalLabel">Events</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="bg-danger text-white p-3">
            <h4>Watch out for events!</h4>
          </div>
          <div class="iframe-container">
            <iframe id="events-iframe"
              src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_economicActivity,_inflation,_credit,_centralBanks,_confidenceIndex,_balance,_Bonds&importance=1,2,3&features=datepicker,timeselector&countries=14&calType=week&timeZone=23&lang=1"
              frameborder="0" allowtransparency="true"></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Steadfast AI Assistant Modal -->
  <div class="modal fade" id="SteadfastAIAssistantModal" tabindex="-1" aria-labelledby="SteadfastAIAssistantModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-body">
          <ChatAIComponent />
        </div>
      </div>
    </div>
  </div>




</template>

<script setup>
import NavigationComponent from '@/components/NavigationComponent.vue'
import { onMounted, onBeforeUnmount } from 'vue';
import { useTradeView } from '@/composables/useTradingSystem';
import { checkAllTokens } from '@/utils/brokerTokenValidator';
import ToastAlert from '@/components/ToastAlertComponent.vue';
import PositionsTableComponent from '@/components/PositionsTableComponent.vue';
import ChatAIComponent from '@/components/ChatAIComponent.vue';

const {
  // Methods
  updateToastVisibility,
  setActiveTab,
  toggleKillSwitch,
  updateSelectedBroker,
  updateExchangeSymbols,
  setDefaultExchangeAndMasterSymbol,
  fetchTradingData,
  setDefaultExpiry,
  updateStrikesForExpiry,
  updateAvailableQuantities,
  updateSelectedQuantity,
  updateSymbolData,
  fetchFlattradePositions,
  fetchShoonyaPositions,
  fetchFlattradeOrdersTradesBook,
  fetchShoonyaOrdersTradesBook,
  fetchPaperTradingPositions,
  fetchPaperTradingOrdersTradesBook,
  handleHotKeys,
  closeAllPositions,
  getProductTypeValue,
  connectWebSocket,
  saveBasket,
  loadBasket,
  deleteBasket,
  validateAndPlaceOrder,
  handleOrderTypeChange,
  setStoploss,
  removeStoploss,
  increaseStoploss,
  decreaseStoploss,
  setTarget,
  removeTarget,
  increaseTarget,
  decreaseTarget,
  checkStoplossesAndTargets,
  maskBrokerClientId,
  initKillSwitch,
  formatDate,
  loadLots,
  handleOrderClick,
  formatTime,
  loadStrategy,
  placeBasketOrder,
  setOrderDetails,
  cancelPendingOrders,
  handleKillSwitchClick,
  closeSelectedPositions,
  updateTradingSymbol,
  toggleBrokerClientIdVisibility,
  resetOrderTypeIfNeeded,
  setStrategyType,
  updateBasketOrderQuantity,
  removeFromBasket,
  placeBasket,
  reversePositions,

  // Computed properties
  brokerStatus,
  isFormDisabled,
  killSwitchRemainingTime,
  killSwitchButtonText,
  killSwitchButtonClass,
  availableBrokers,
  exchangeOptions,
  todayExpirySymbol,
  selectedLots,
  maxLots,
  combinedOrdersAndTrades,
  orderTypes,
  displayOrderTypes,
  productTypes,
  availableBalance,
  usedAmount,
  totalNetQty,
  totalProfit,
  totalBuyValue,
  totalSellValue,
  riskReached,
  targetReached,
  ltpRangeWidth,
  ltpMarkerPosition,
  netPnl,
  totalCapitalPercentage,
  isOffsetOrderType,
  isValidLimitPrice,
  limitPriceErrorMessage,
  isCallDepthAvailable,
  isPutDepthAvailable,
  filteredStrategies,
  sortedBasketOrders,
  availableStrikes,
  basketLTPs,
  callLtpRangeWidth,
  callOpenMarkerPosition,
  openMarkerPosition,
  putLtpRangeWidth,
  putOpenMarkerPosition,
  additionalStrikes,
  deployedCapitalPercentage,


  // Reactive variables
  showLTPRangeBar,
  showToast,
  toastMessage,
  activeTab,
  killSwitchActive,
  experimentalFeatures,
  currentTime,
  enableHotKeys,
  selectedBroker,
  selectedBrokerName,
  selectedExchange,
  selectedMasterSymbol,
  selectedQuantity,
  selectedExpiry,
  selectedCallStrike,
  selectedPutStrike,
  exchangeSymbols,
  callStrikes,
  putStrikes,
  expiryDates,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  flatTradePositionBook,
  shoonyaPositionBook,
  paperTradingPositionBook,
  showBrokerClientId,
  selectedStrike,
  selectedProductType,
  limitPrice,
  modalTransactionType,
  modalOptionType,
  selectedShoonyaPositionsSet,
  selectedFlattradePositionsSet,
  selectedPaperPositionsSet,
  currentClockEmoji,
  socket,
  latestCallLTP,
  latestPutLTP,
  activeFetchFunction,
  masterOpenPrice,
  masterHighPrice,
  masterLowPrice,
  masterClosePrice,
  callOpenPrice,
  callHighPrice,
  callLowPrice,
  callClosePrice,
  putOpenPrice,
  putHighPrice,
  putLowPrice,
  putClosePrice,
  showOHLCValues,
  showStrikeDetails,
  reverseMode,
  additionalSymbols,
  marketDepth,
  additionalStrikeLTPs,
  notificationSound,
  selectedSound,
  savedBaskets,
  basketName,
  strategyType,
  orderMargin,
  limitOffset,
  enableStoploss,
  stoplossValue,
  enableTarget,
  targetValue,
  callDepth,
  putDepth,
  allSymbolsData,
  selectedOrderType,
  stickyMTM,
} = useTradeView();

let timer;
let positionCheckInterval;
let checkInterval;

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

  // Load cached trading data
  const cachedData = JSON.parse(localStorage.getItem('cachedTradingData'));
  if (cachedData) {
    Object.keys(cachedData).forEach(key => {
      allSymbolsData[key] = cachedData[key];
    });
    updateExchangeSymbols();
    setDefaultExchangeAndMasterSymbol();
    updateSymbolData(selectedMasterSymbol.value);
  } else {
    updateExchangeSymbols();
    setDefaultExchangeAndMasterSymbol();
    await fetchTradingData();
  }

  updateAvailableQuantities();
  loadLots();
  updateSelectedQuantity();
  setDefaultExpiry();

  window.addEventListener('keydown', handleHotKeys);

  // Initialize with the default active tab
  if (activeTab.value === 'positions') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      fetchFlattradePositions();
      activeFetchFunction.value = 'fetchFlattradePositions';
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      fetchShoonyaPositions();
      activeFetchFunction.value = 'fetchShoonyaPositions';
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      fetchPaperTradingPositions();
      activeFetchFunction.value = 'fetchPaperTradingPositions';
    }
  }
  if (activeTab.value === 'trades') {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      fetchFlattradeOrdersTradesBook();
      activeFetchFunction.value = 'fetchFlattradeOrdersTradesBook';
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      fetchShoonyaOrdersTradesBook();
      activeFetchFunction.value = 'fetchShoonyaOrdersTradesBook';
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      fetchPaperTradingOrdersTradesBook();
      activeFetchFunction.value = 'fetchPaperTradingOrdersTradesBook';
    }
  }

  enableHotKeys.value = localStorage.getItem('EnableHotKeys') !== 'false';

  timer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  connectWebSocket();

  const ltpBarsavedPreference = localStorage.getItem('showLTPRangeBar');
  if (ltpBarsavedPreference !== null) {
    showLTPRangeBar.value = JSON.parse(ltpBarsavedPreference);
  }
  const ohlcValuesSavedPreference = localStorage.getItem('showOHLCValues');
  if (ohlcValuesSavedPreference !== null) {
    showOHLCValues.value = JSON.parse(ohlcValuesSavedPreference);
  }
  if (selectedExpiry.value) {
    updateStrikesForExpiry(selectedExpiry.value, true);
  }
  const storedBaskets = localStorage.getItem('savedBaskets');
  if (storedBaskets) {
    savedBaskets.value = JSON.parse(storedBaskets);
  }
  positionCheckInterval = setInterval(checkStoplossesAndTargets, 1000);
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


</script>
