<template>
  <NavigationComponent v-if="experimentalFeatures" />

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
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-4 fw-bold">
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
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-4 fw-bold">
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
            <span class="d-flex bg-white text-dark py-2 px-3 rounded-2 fs-4 fw-bold">
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
            <div class="d-flex" v-if="showOHLCValues">
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
            <div class="d-flex w-100 justify-content-around" v-if="showOHLCValues">
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
            <div class="d-flex w-100 justify-content-around" v-if="showOHLCValues">
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
          <div class="table-responsive" v-if="activeFetchFunction === 'fetchFlattradePositions'">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Position</th>
                  <th scope="col">Avg</th>
                  <th scope="col">LTP</th>
                  <th scope="col">TSL / SL</th>
                  <th scope="col">Target</th>
                  <th scope="col">Realized</th>
                  <th scope="col">Unrealized</th>
                  <th scope="col">Select</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="flatTradePositionBook.length">
                  <tr v-for="flattradePosition in sortedPositions" :key="flattradePosition.tsym">
                    <td>
                      <div class="d-flex">{{ flattradePosition.tsym }}</div>
                      <div class="d-flex flex-row">
                        <span
                          :class="flattradePosition.netqty > 0 ? 'text-success' : flattradePosition.netqty < 0 ? 'text-danger' : null">
                          Qty: {{ flattradePosition.netqty }}
                        </span>
                        <span class="ms-2">
                          Side:
                          <b>{{ flattradePosition.netqty > 0 ? 'B' : flattradePosition.netqty < 0 ? 'S' : '-' }}</b>
                        </span>
                        <span class="ms-2"> Type: {{ flattradePosition.prd }} </span>
                      </div>
                      <div class="mt-1 d-flex flex-row">
                        <span class="text-success">₹{{ flattradePosition.daybuyamt }}</span>
                        <span class="ms-2 text-danger">₹{{ flattradePosition.daysellamt }}</span>
                      </div>
                    </td>
                    <td>{{ flattradePosition.netavgprc }}</td>
                    <td>{{ positionLTPs[flattradePosition.tsym] || '-' }}</td>
                    <td v-if="flattradePosition.netqty != 0">
                      <!-- SL & TSL -->
                      <div class="row">
                        <div class="col-12" v-if="trailingStoplosses[flattradePosition.tsym] !== null">
                          <div class="d-flex align-items-center">
                            <span class="me-2">TSL:</span>
                            <span class="bg-danger text-white px-2 py-1 rounded">
                              {{ trailingStoplosses[flattradePosition.tsym] }}
                            </span>
                          </div>
                        </div>
                        <div class="col-12" v-else-if="stoplosses[flattradePosition.tsym] !== null">
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-danger" @click="decreaseStoploss(flattradePosition)">
                              - SL
                            </button>
                            <span class="d-flex align-items-center bg-danger text-white px-2">
                              {{ stoplosses[flattradePosition.tsym] }}
                            </span>
                            <button class="btn btn-sm btn-outline-success" @click="increaseStoploss(flattradePosition)">
                              + SL
                            </button>
                          </div>
                        </div>
                        <div v-else>No SL set</div>
                      </div>
                      <div class="btn-group mt-2" role="group">
                        <button
                          v-if="trailingStoplosses[flattradePosition.tsym] === null && stoplosses[flattradePosition.tsym] === null"
                          class="btn btn-sm btn-outline" @click="setStoploss(flattradePosition, 'trailing')">
                          Set TSL
                        </button>
                        <button
                          v-if="trailingStoplosses[flattradePosition.tsym] === null && stoplosses[flattradePosition.tsym] === null"
                          class="btn btn-sm btn-outline" @click="setStoploss(flattradePosition, 'static')">
                          Set SL
                        </button>
                        <button
                          v-if="trailingStoplosses[flattradePosition.tsym] !== null || stoplosses[flattradePosition.tsym] !== null"
                          class="btn btn-sm btn-outline-danger" @click="removeStoploss(flattradePosition)">
                          Remove SL
                        </button>
                      </div>
                    </td>
                    <td v-else style="text-align: center">-</td>
                    <td v-if="flattradePosition.netqty != 0">
                      <!-- TG -->
                      <div class="row">
                        <div class="col-12" v-if="targets[flattradePosition.tsym] !== null">
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-danger" @click="decreaseTarget(flattradePosition)">
                              - TG
                            </button>
                            <span class="d-flex align-items-center bg-success text-white px-2">
                              {{ targets[flattradePosition.tsym] }}
                            </span>
                            <button class="btn btn-sm btn-outline-success" @click="increaseTarget(flattradePosition)">
                              + TG
                            </button>
                          </div>
                        </div>
                        <div v-else>No Target set</div>
                      </div>
                      <div class="btn-group mt-2" role="group">
                        <button v-if="targets[flattradePosition.tsym] === null" class="btn btn-sm btn-outline-success"
                          @click="setTarget(flattradePosition)">
                          Set TG
                        </button>
                        <button v-if="targets[flattradePosition.tsym] !== null" class="btn btn-sm btn-outline-danger"
                          @click="removeTarget(flattradePosition)">
                          Remove TG
                        </button>
                      </div>
                    </td>
                    <td v-else style="text-align: center">-</td>
                    <td
                      :class="flattradePosition.rpnl > 0 ? 'text-success' : flattradePosition.rpnl < 0 ? 'text-danger' : null">
                      {{ flattradePosition.rpnl }}
                    </td>
                    <td
                      :class="flattradePosition.calculatedUrmtom > 0 ? 'text-success' : flattradePosition.calculatedUrmtom < 0 ? 'text-danger' : null">
                      {{ flattradePosition.calculatedUrmtom.toFixed(2) }}
                    </td>
                    <td class="position-relative">
                      <label
                        class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
                        <input type="checkbox" :id="'flattradePosition-' + flattradePosition.tsym"
                          v-model="selectedFlattradePositionsSet" :value="flattradePosition.tsym"
                          :disabled="flattradePosition.netqty == 0" />
                      </label>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="10" class="text-center">
                    No positions on selected broker {{ selectedBroker.brokerName }}
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
                  <th scope="col">Position</th>
                  <th scope="col">Avg</th>
                  <th scope="col">LTP</th>
                  <th scope="col">TSL / SL</th>
                  <th scope="col">Target</th>
                  <th scope="col">Realized</th>
                  <th scope="col">Unrealized</th>
                  <th scope="col">Select</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="shoonyaPositionBook.length">
                  <tr v-for="shoonyaPosition in sortedPositions" :key="shoonyaPosition.tsym">
                    <td>
                      <div class="d-flex">{{ shoonyaPosition.tsym }}</div>
                      <div class="d-flex flex-row">
                        <span
                          :class="shoonyaPosition.netqty > 0 ? 'text-success' : shoonyaPosition.netqty < 0 ? 'text-danger' : null">
                          Qty: {{ shoonyaPosition.netqty }}
                        </span>
                        <span class="ms-2">
                          Side:
                          <b>{{ shoonyaPosition.netqty > 0 ? 'B' : shoonyaPosition.netqty < 0 ? 'S' : '-' }}</b>
                        </span>
                        <span class="ms-2"> Type: {{ shoonyaPosition.prd }} </span>
                      </div>
                      <div class="mt-1 d-flex flex-row">
                        <span class="text-success">₹{{ shoonyaPosition.daybuyamt }}</span>
                        <span class="ms-2 text-danger">₹{{ shoonyaPosition.daysellamt }}</span>
                      </div>
                    </td>
                    <td>{{ shoonyaPosition.netavgprc }}</td>
                    <td>{{ positionLTPs[shoonyaPosition.tsym] || '-' }}</td>
                    <td v-if="shoonyaPosition.netqty != 0">
                      <!-- SL & TSL -->
                      <div class="row">
                        <div class="col-12" v-if="trailingStoplosses[shoonyaPosition.tsym] !== null">
                          <div class="d-flex align-items-center">
                            <span class="me-2">TSL:</span>
                            <span class="bg-danger text-white px-2 py-1 rounded">
                              {{ trailingStoplosses[shoonyaPosition.tsym] }}
                            </span>
                          </div>
                        </div>
                        <div class="col-12" v-else-if="stoplosses[shoonyaPosition.tsym] !== null">
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-danger" @click="decreaseStoploss(shoonyaPosition)">
                              - SL
                            </button>
                            <span class="d-flex align-items-center bg-danger text-white px-2">
                              {{ stoplosses[shoonyaPosition.tsym] }}
                            </span>
                            <button class="btn btn-sm btn-outline-success" @click="increaseStoploss(shoonyaPosition)">
                              + SL
                            </button>
                          </div>
                        </div>
                        <div v-else>No SL set</div>
                      </div>
                      <div class="btn-group mt-2" role="group">
                        <button
                          v-if="trailingStoplosses[shoonyaPosition.tsym] === null && stoplosses[shoonyaPosition.tsym] === null"
                          class="btn btn-sm btn-outline" @click="setStoploss(shoonyaPosition, 'trailing')">
                          Set TSL
                        </button>
                        <button
                          v-if="trailingStoplosses[shoonyaPosition.tsym] === null && stoplosses[shoonyaPosition.tsym] === null"
                          class="btn btn-sm btn-outline" @click="setStoploss(shoonyaPosition, 'static')">
                          Set SL
                        </button>
                        <button
                          v-if="trailingStoplosses[shoonyaPosition.tsym] !== null || stoplosses[shoonyaPosition.tsym] !== null"
                          class="btn btn-sm btn-outline-danger" @click="removeStoploss(shoonyaPosition)">
                          Remove SL
                        </button>
                      </div>
                    </td>
                    <td v-else style="text-align: center">-</td>
                    <td v-if="shoonyaPosition.netqty != 0">
                      <!-- TG -->
                      <div class="row">
                        <div class="col-12" v-if="targets[shoonyaPosition.tsym] !== null">
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-danger" @click="decreaseTarget(shoonyaPosition)">
                              - TG
                            </button>
                            <span class="d-flex align-items-center bg-success text-white px-2">
                              {{ targets[shoonyaPosition.tsym] }}
                            </span>
                            <button class="btn btn-sm btn-outline-success" @click="increaseTarget(shoonyaPosition)">
                              + TG
                            </button>
                          </div>
                        </div>
                        <div v-else>No Target set</div>
                      </div>
                      <div class="btn-group mt-2" role="group">
                        <button v-if="targets[shoonyaPosition.tsym] === null" class="btn btn-sm btn-outline-success"
                          @click="setTarget(shoonyaPosition)">
                          Set TG
                        </button>
                        <button v-if="targets[shoonyaPosition.tsym] !== null" class="btn btn-sm btn-outline-danger"
                          @click="removeTarget(shoonyaPosition)">
                          Remove TG
                        </button>
                      </div>
                    </td>
                    <td v-else style="text-align: center">-</td>
                    <td
                      :class="shoonyaPosition.rpnl > 0 ? 'text-success' : shoonyaPosition.rpnl < 0 ? 'text-danger' : null">
                      {{ shoonyaPosition.rpnl }}
                    </td>
                    <td
                      :class="shoonyaPosition.calculatedUrmtom > 0 ? 'text-success' : shoonyaPosition.calculatedUrmtom < 0 ? 'text-danger' : null">
                      {{ shoonyaPosition.calculatedUrmtom.toFixed(2) }}
                    </td>
                    <td class="position-relative">
                      <label
                        class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
                        <input type="checkbox" :id="'shoonyaPosition-' + shoonyaPosition.tsym"
                          v-model="selectedShoonyaPositionsSet" :value="shoonyaPosition.tsym"
                          :disabled="shoonyaPosition.netqty == 0" />
                      </label>
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="10" class="text-center">
                    No positions on selected broker {{ selectedBroker.brokerName }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="text-secondary">
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

          <p class="text-secondary">
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
        <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
          <div class="row py-3">
            <div class="row m-0">
              <div class="col-12 border rounded p-3">
                <h6 class="mb-0">Offset Settings</h6>
                <div class="row">
                  <!-- Select Call Strike Offset -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="callStrikeOffset" class="form-label">Call Strike Offset</label>
                    <select name="" id="callStrikeOffset" class="form-select" v-model="callStrikeOffset">
                      <option value="+4">ITM +4</option>
                      <option value="+3">ITM +3</option>
                      <option value="+2">ITM +2</option>
                      <option value="+1">ITM +1</option>
                      <option value="0">ATM 0</option>
                      <option value="-1">OTM -1</option>
                      <option value="-2">OTM -2</option>
                      <option value="-3">OTM -3</option>
                      <option value="-4">OTM -4</option>
                    </select>
                  </div>
                  <!-- Select Put Strike Offset -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="putStrikeOffset" class="form-label">Put Strike Offset</label>
                    <select name="" id="putStrikeOffset" class="form-select" v-model="putStrikeOffset">
                      <option value="+4">ITM +4</option>
                      <option value="+3">ITM +3</option>
                      <option value="+2">ITM +2</option>
                      <option value="+1">ITM +1</option>
                      <option value="0">ATM 0</option>
                      <option value="-1">OTM -1</option>
                      <option value="-2">OTM -2</option>
                      <option value="-3">OTM -3</option>
                      <option value="-4">OTM -4</option>
                    </select>
                  </div>
                  <!-- Select Expiry Offset -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="expiryOffset" class="form-label">Expiry Offset</label>
                    <select id="expiryOffset" class="form-select" v-model="expiryOffset">
                      <option value="0">Current Expiry</option>
                      <option value="1">+1 Expiry</option>
                      <option value="2">+2 Expiry</option>
                      <option value="3">+3 Expiry</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Show all positions Including Equity and Futures and Options -->
            <!-- <div class="col-12 col-md-6 col-lg-4">
            <label for="showAllPositions" class="form-label">Show Positions</label>
            <select name="" id="" class="form-select">
              <option value="all">All Positions</option>
              <option value="futures">Futures Only</option>
              <option value="options" selected>Options Only</option>
              <option value="equity">Equity Only</option>
            </select>
          </div> -->

            <!-- Risk Management Settings -->
            <div class="row m-0 mt-3">
              <div class="col-12 border rounded p-3">
                <h6 class="mb-0">Risk Management Settings</h6>
                <div class="row">
                  <!-- Overtrade Protection (Auto-Kill Switch) -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="overtradeProtection" class="form-label">
                      Overtrade Protection (Auto-Kill Switch)
                    </label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="overtradeProtection"
                        :checked="overtradeProtection" @change="toggleOvertradeProtection" />
                      <label class="form-check-label" for="overtradeProtection">
                        {{ overtradeProtection ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                    <small class="text-muted">
                      Activates Kill Switch if your total Buy or Sell value exceeds your available
                      funds, preventing overtrading.
                    </small>
                  </div>
                  <!-- Max Risk & Target Toggle -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="" class="form-label mt-2">Max Risk & Target</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="totalRiskTargetToggle"
                        v-model="totalRiskTargetToggle" />
                      <label class="form-check-label" for="totalRiskTargetToggle">
                        {{ totalRiskTargetToggle ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                  </div>
                  <!-- Total Risk and Target by Capital Or Amount -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="totalRiskTargetType" class="form-label mb-0">
                      Risk | Target Type
                    </label>
                    <select class="form-select" v-model="totalRiskTargetType">
                      <option value="percentage">Percentage</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>
                  <!-- Risk Input -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="totalRiskAmount" class="form-label mb-0">Max Risk</label>
                    <div class="input-group">
                      <span class="input-group-text">Loss</span>
                      <template v-if="totalRiskTargetType === 'amount'">
                        <input type="number" min="100" class="form-control" v-model="totalRiskAmount"
                          placeholder="Enter risk amount" />
                        <span class="input-group-text">₹</span>
                      </template>
                      <template v-if="totalRiskTargetType === 'percentage'">
                        <input type="number" min="0.1" max="5" step="0.1" class="form-control"
                          v-model="totalRiskPercentage" placeholder="Enter risk percentage" />
                        <span class="input-group-text">%</span>
                      </template>
                    </div>
                    <!-- Close Positions if Risk is reached -->
                    <label for="closePositionsRisk" class="form-label mt-2">Action if Max Risk is reached</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="closePositionsRisk"
                        v-model="closePositionsRisk" />
                      <label class="form-check-label" for="closePositionsRisk">
                        {{ closePositionsRisk ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                    <div v-if="closePositionsRisk" class="mt-2">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="riskActionClose" value="close"
                          v-model="riskAction" />
                        <label class="form-check-label" for="riskActionClose">Close Positions</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="riskActionKillSwitch" value="killSwitch"
                          v-model="riskAction" />
                        <label class="form-check-label" for="riskActionKillSwitch">Activate Kill Switch</label>
                      </div>
                    </div>
                  </div>
                  <!-- Target Input -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="totalTargetAmount" class="form-label mb-0">Max Target</label>
                    <div class="input-group">
                      <span class="input-group-text">Profit</span>
                      <template v-if="totalRiskTargetType === 'amount'">
                        <input type="number" min="100" class="form-control" v-model="totalTargetAmount"
                          placeholder="Enter target amount" />
                        <span class="input-group-text">₹</span>
                      </template>
                      <template v-if="totalRiskTargetType === 'percentage'">
                        <input type="number" min="0.1" max="5" step="0.1" class="form-control"
                          v-model="totalTargetPercentage" placeholder="Enter target %" />
                        <span class="input-group-text">%</span>
                      </template>
                    </div>
                    <!-- Close Positions if Target is reached -->
                    <label for="closePositionsTarget" class="form-label mt-2">Action if Max Target is reached</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="closePositionsTarget"
                        v-model="closePositionsTarget" />
                      <label class="form-check-label" for="closePositionsTarget">
                        {{ closePositionsTarget ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                    <div v-if="closePositionsTarget" class="mt-2">
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="targetActionClose" value="close"
                          v-model="targetAction" />
                        <label class="form-check-label" for="targetActionClose">Close Positions</label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" id="targetActionKillSwitch" value="killSwitch"
                          v-model="targetAction" />
                        <label class="form-check-label" for="targetActionKillSwitch">Activate Kill Switch</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- App Settings -->
            <div class="row m-0 mt-3">
              <div class="col-12 rounded border p-3">
                <h6 class="mb-0">App Settings</h6>
                <div class="row">
                  <!-- Show/Hide LTP Range Bar Toggle -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <!-- Show LTP Range Bar -->
                    <label for="showLTPRangeBar" class="form-label">Show LTP Range Bar</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="showLTPRangeBar" v-model="showLTPRangeBar" />
                      <label class="form-check-label" for="showLTPRangeBar">
                        {{ showLTPRangeBar ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                  </div>
                  <!-- 1 Click Keys -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <form @submit.prevent>
                      <fieldset :disabled="isFormDisabled" :class="{ 'disabled-form': isFormDisabled }">
                        <label for="enableHotKeys" class="form-label">1 Click Keys ⌨️</label>
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="enableHotKeys" v-model="enableHotKeys"
                            :class="{ 'disabled-form': isFormDisabled }" />
                          <label class="form-check-label" for="enableHotKeys">
                            {{ enableHotKeys ? 'Enabled' : 'Disabled' }}
                          </label>
                        </div>
                      </fieldset>
                    </form>
                  </div>
                  <!-- Show/Hide OHLC Values -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="showOHLCValues" class="form-label">Show OHLC Values</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="showOHLCValues" v-model="showOHLCValues" />
                      <label class="form-check-label" for="showOHLCValues">
                        {{ showOHLCValues ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                    <small class="text-muted">Reload Required</small>
                  </div>
                  <!-- Show/Hide Strike Details - Security ID, Trading Symbol -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="showStrikeDetails" class="form-label">Show Strike Details</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="showStrikeDetails"
                        v-model="showStrikeDetails" />
                      <label class="form-check-label" for="showStrikeDetails">
                        {{ showStrikeDetails ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                    <small class="text-muted">For development purposes only</small>
                  </div>
                  <!-- Subscibe LTP for 3 more additional symbols -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="additionalSymbols" class="form-label">Additional Symbols</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="additionalSymbols"
                        :checked="additionalSymbols" @change="toggleAdditionalSymbols" />
                      <label class="form-check-label" for="additionalSymbols">
                        {{ additionalSymbols ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                  </div>
                  <!-- Notification Sound -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="notificationSound" class="form-label">Notification Sound</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="notificationSound" v-model="notificationSound"
                        @change="playNotificationSound" />
                      <label class="form-check-label" for="notificationSound">
                        {{ notificationSound ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                    <select v-model="selectedSound" class="form-select mt-2" :disabled="!notificationSound">
                      <option value="cyberpunk-notification.mp3">Cyberpunk</option>
                      <option value="long-pop.wav">Long Pop</option>
                      <option value="classical.mp3">Classical</option>
                      <!-- Add more sound options as needed -->
                    </select>
                  </div>
                  <!-- Subscibe LTP for 3 more additional symbols -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="marketDepth" class="form-label">Market Depth</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="marketDepth" :checked="marketDepth"
                        @change="toggleMarketDepth" />
                      <label class="form-check-label" for="marketDepth">
                        {{ marketDepth ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                  </div>
                  <!-- Enable / Disable Experimental Features -->
                  <div class="col-12 col-md-6 col-lg-4 mt-3">
                    <label for="experimentalFeatures" class="form-label">Experimental Features</label>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="experimentalFeatures"
                        v-model="experimentalFeatures" />
                      <label class="form-check-label" for="experimentalFeatures">
                        {{ experimentalFeatures ? 'Enabled' : 'Disabled' }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 pt-5 text-center">
              <p class="text-secondary">These settings are automatically saved.</p>
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
            <h4>On Event days, option premiums can be very volatile.</h4>
            <p class="blockquote">
              It's highly recommended to avoid trading on event days as market volatility can lead to
              significant losses.
            </p>
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

</template>

<script setup>
import NavigationComponent from '../components/NavigationComponent.vue'
import { ref, computed, onMounted, watch, onBeforeUnmount, reactive } from 'vue';
import * as globalState from '@/composables/useGlobalState';

const {
  BASE_URL,
  showLTPRangeBar,
  showToast,
  toastMessage,
  activeTab,
  killSwitchActive,
  overtradeProtection,
  experimentalFeatures,
  activationTime,
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
  callStrikeOffset,
  putStrikeOffset,
  expiryOffset,
  exchangeSymbols,
  callStrikes,
  putStrikes,
  expiryDates,
  synchronizeOnLoad,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  dataFetched,
  lotsPerSymbol,
  flatOrderBook,
  flatTradeBook,
  token,
  shoonyaOrderBook,
  shoonyaTradeBook,
  flatTradePositionBook,
  shoonyaPositionBook,
  fundLimits,
  showBrokerClientId,
  quantities,
  availableQuantities,
  selectedStrike,
  selectedProductType,
  limitPrice,
  modalTransactionType,
  modalOptionType,
  selectedShoonyaPositionsSet,
  selectedFlattradePositionsSet,
  positionsInExecution,
  clockEmojis,
  currentClockEmoji,
  socket,
  latestCallLTP,
  latestPutLTP,
  defaultCallSecurityId,
  defaultPutSecurityId,
  positionLTPs,
  positionSecurityIds,
  totalRiskType,
  totalRiskTypeToggle,
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
  showBasketOrderModal,
  additionalSymbols,
  marketDepth,
  additionalStrikeLTPs,
  ltpCallbacks,
  customStrikePrice,
  notificationSound,
  selectedSound,
  riskClosingCountdown,
  totalRiskTargetToggle,
  totalRiskTargetType,
  totalRiskAmount,
  totalRiskPercentage,
  totalTargetAmount,
  totalTargetPercentage,
  savedBaskets,
  basketName,
  editingBasketId,
  basketOrders,
  closePositionsRisk,
  closePositionsTarget,
  strategyType,
  strategies,
  riskAction,
  targetAction,
  orderMargin,
  limitOffset,
  stoplosses,
  targets,
  trailingStoplosses,
  enableStoploss,
  stoplossValue,
  enableTarget,
  targetValue,
  tslHitPositions,
  callDepth,
  putDepth,
  symbolData,
  allSymbolsData
} = globalState;
import { checkAllTokens, getBrokerStatus, tokenStatus } from '@/utils/brokerTokenValidator';
import axios from 'axios';
import ToastAlert from '../components/ToastAlert.vue';
import qs from 'qs';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '@vueuse/core'; // Optional: for easier localStorage management


let timer;
let positionCheckInterval;






// Computed Variables
const brokerStatus = computed(() => {
  const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}');
  const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}');
  const paperTradingDetails = JSON.parse(localStorage.getItem('broker_PaperTrading') || '{}');

  const flattradeClientId = flattradeDetails.clientId;
  const flattradeApiToken = localStorage.getItem('FLATTRADE_API_TOKEN');
  const shoonyaApiToken = localStorage.getItem('SHOONYA_API_TOKEN');
  const shoonyaClientId = shoonyaDetails.clientId;
  const paperTradingClientId = paperTradingDetails.clientId;

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
  else if (selectedBroker.value?.brokerName === 'PaperTrading') {
    if (paperTradingClientId) {
      return 'Connected'; // PaperTrading is always connected if a client ID exists
    }
    return 'Not Connected';
  }
  return 'Not Connected';
});
const isFormDisabled = computed(() => killSwitchActive.value);
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
const killSwitchButtonText = computed(() => killSwitchActive.value ? 'Deactivate' : 'Activate');
const killSwitchButtonClass = computed(() => killSwitchActive.value ? 'btn btn-sm btn-danger shadow fs-5' : 'btn btn-sm btn-success shadow fs-5');
const availableBrokers = computed(() => {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('broker_'))
    .map(key => key.replace('broker_', ''));
});
const exchangeOptions = computed(() => {
  return Object.keys(exchangeSymbols.value).filter(key => key !== 'symbolData');
});
const todayExpirySymbol = computed(() => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

  for (const [symbol, data] of Object.entries(symbolData)) {
    if (data.expiryDay === dayOfWeek) {
      return symbol;
    }
  }

  return null; // No expiry today
});
const selectedLots = computed({
  get: () => lotsPerSymbol.value[selectedMasterSymbol.value] || 1,
  set: (value) => {
    lotsPerSymbol.value[selectedMasterSymbol.value] = value;
    saveLots();
  }
});
const maxLots = computed(() => {
  const instrument = quantities.value[selectedMasterSymbol.value];
  return instrument ? instrument.maxLots : 280;
});
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
const orderTypes = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade' ||
    selectedBroker.value?.brokerName === 'Shoonya' ||
    selectedBroker.value?.brokerName === 'PaperTrading') {
    return ['MKT', 'LMT', 'LMT_LTP', 'LMT_OFFSET', 'MKT_PROTECTION'];
  }
  return [];
});
const displayOrderTypes = computed(() => {
  return orderTypes.value.map(type => {
    switch (type) {
      case 'MKT':
        return 'Market';
      case 'LMT':
        return 'Limit';
      case 'LMT_LTP':
        return 'Limit at LTP';
      case 'LMT_OFFSET':
        return 'Limit at Offset';
      case 'MKT_PROTECTION':
        return 'Market Protection';
      default:
        return type;
    }
  });
});
const selectedOrderType = ref(orderTypes.value[0]);
const previousOrderType = ref(orderTypes.value[0]);
const productTypes = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return ['Intraday', 'Margin'];
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return ['Intraday', 'Margin'];
  }
  else if (selectedBroker.value?.brokerName === 'PaperTrading') {
    return ['Intraday', 'Margin'];
  }
  return [];
});
const availableBalance = computed(() => {
  // console.log('Fund Limits:', fundLimits.value);
  // console.log('Selected Broker:', selectedBroker.value?.brokerName);

  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
    const cash = Number(fundLimits.value.cash) || 0;
    const payin = Number(fundLimits.value.payin) || 0;
    const marginUsed = Number(fundLimits.value.marginused) || 0;

    // Use payin if cash is zero, otherwise use cash
    const availableFunds = cash + payin;

    const balance = availableFunds - marginUsed;
    // console.log(`${selectedBroker.value?.brokerName} Available Balance:`, balance);
    return balance;
  }
  if (selectedBroker.value?.brokerName === 'PaperTrading') {
    const cash = Number(fundLimits.value.cash) || 0;
    const payin = Number(fundLimits.value.payin) || 0;
    const marginUsed = Number(fundLimits.value.marginused) || 0;

    // Use payin if cash is zero, otherwise use cash
    const availableFunds = cash === 0 ? payin : cash;

    const balance = Math.floor(availableFunds - marginUsed);
    return balance;
  }
  return null;
});
const usedAmount = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
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
  const totalUsedAmount = usedAmount.value || 0;
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
const ltpRangeWidth = computed(() => {
  const low = parseFloat(masterLowPrice.value);
  const high = parseFloat(masterHighPrice.value);
  const ltp = getMasterSymbolPrice(); // New helper function

  if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
    return 0;
  }

  return ((ltp - low) / (high - low)) * 100;
});
const ltpMarkerPosition = computed(() => {
  const low = parseFloat(masterLowPrice.value);
  const high = parseFloat(masterHighPrice.value);
  const ltp = getMasterSymbolPrice(); // New helper function

  if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
    return 0;
  }

  return ((ltp - low) / (high - low)) * 100;
});
// Computed Properties for LTP Range Bar for Call Strike
const callLtpRangeWidth = computed(() => {
  const low = parseFloat(callLowPrice.value);
  const high = parseFloat(callHighPrice.value);
  const ltp = parseFloat(latestCallLTP.value);

  if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
    return 0;
  }

  return ((ltp - low) / (high - low)) * 100;
});
const callLtpMarkerPosition = computed(() => {
  const low = parseFloat(callLowPrice.value);
  const high = parseFloat(callHighPrice.value);
  const ltp = parseFloat(latestCallLTP.value); // Use the appropriate LTP value

  if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
    return 0;
  }

  return ((ltp - low) / (high - low)) * 100;
});
// Computed Properties for LTP Range Bar for Put Strike
const putLtpRangeWidth = computed(() => {
  const low = parseFloat(putLowPrice.value);
  const high = parseFloat(putHighPrice.value);
  const ltp = parseFloat(latestPutLTP.value);

  if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
    return 0;
  }

  return ((ltp - low) / (high - low)) * 100;
});
const putLtpMarkerPosition = computed(() => {
  const low = parseFloat(putLowPrice.value);
  const high = parseFloat(putHighPrice.value);
  const ltp = parseFloat(latestPutLTP.value); // Use the appropriate LTP value

  if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
    return 0;
  }

  return ((ltp - low) / (high - low)) * 100;
});
// Computed Properties for LTP Range Bar for Live Underlying Price
const openMarkerPosition = computed(() => {
  const low = parseFloat(masterLowPrice.value);
  const high = parseFloat(masterHighPrice.value);
  const open = parseFloat(masterOpenPrice.value);

  if (isNaN(low) || isNaN(high) || isNaN(open) || high === low) {
    return 0;
  }

  return ((open - low) / (high - low)) * 100;
});
// Computed Properties for LTP Range Bar for Call Strike
const callOpenMarkerPosition = computed(() => {
  const low = parseFloat(callLowPrice.value);
  const high = parseFloat(callHighPrice.value);
  const open = parseFloat(callOpenPrice.value);

  if (isNaN(low) || isNaN(high) || isNaN(open) || high === low) {
    return 0;
  }

  return ((open - low) / (high - low)) * 100;
});
// Computed Properties for LTP Range Bar for Put Strike
const putOpenMarkerPosition = computed(() => {
  const low = parseFloat(putLowPrice.value);
  const high = parseFloat(putHighPrice.value);
  const open = parseFloat(putOpenPrice.value);

  if (isNaN(low) || isNaN(high) || isNaN(open) || high === low) {
    return 0;
  }

  return ((open - low) / (high - low)) * 100;
});
const riskReached = computed(() => {
  if (totalRiskTargetToggle.value) {
    if (totalRiskTargetType.value === 'amount' && totalRiskAmount.value > 0) {
      return totalProfit.value <= -totalRiskAmount.value;
    } else if (totalRiskTargetType.value === 'percentage' && totalRiskPercentage.value > 0) {
      return totalCapitalPercentage.value <= -totalRiskPercentage.value;
    }
  }
  return false;
});
const targetReached = computed(() => {
  if (totalRiskTargetToggle.value) {
    if (totalRiskTargetType.value === 'amount' && totalTargetAmount.value > 0) {
      return totalProfit.value >= totalTargetAmount.value;
    } else if (totalRiskTargetType.value === 'percentage' && totalTargetPercentage.value > 0) {
      return totalCapitalPercentage.value >= totalTargetPercentage.value;
    }
  }
  return false;
});
const sortedBasketOrders = computed(() => {
  return [...basketOrders.value].sort((a, b) => {
    if (a.transactionType === 'B' && b.transactionType !== 'B') return -1;
    if (a.transactionType !== 'B' && b.transactionType === 'B') return 1;
    return 0;
  });
});
const additionalStrikes = computed(() => {
  if (!additionalSymbols.value) return [];

  const currentPrice = getMasterSymbolPrice();
  const allStrikes = [...new Set([...callStrikes.value, ...putStrikes.value]
    .map(strike => strike.strikePrice))]
    .sort((a, b) => a - b);

  const currentIndex = allStrikes.findIndex(strike => strike >= currentPrice);
  const startIndex = Math.max(0, currentIndex - 3);
  const endIndex = Math.min(allStrikes.length - 1, currentIndex + 3);

  return allStrikes.slice(startIndex, endIndex + 1);
});
const availableStrikes = computed(() => {
  const allStrikes = new Set([
    ...callStrikes.value.map(strike => strike.strikePrice),
    ...putStrikes.value.map(strike => strike.strikePrice)
  ]);
  return Array.from(allStrikes).sort((a, b) => a - b);
});
const basketLTPs = computed(() => {
  const ltps = {};
  basketOrders.value.forEach(order => {
    ltps[order.id] = positionLTPs.value[order.tradingSymbol] || 'N/A';
  });
  return ltps;
});
const filteredStrategies = computed(() => {
  return strategies.value.filter(strategy => strategy.type === strategyType.value);
});
const isValidLimitPrice = computed(() => {
  return limitPrice.value > 0 && limitPrice.value !== '';
});
const limitPriceErrorMessage = computed(() => {
  if (limitPrice.value === '') {
    return 'Limit price is required.';
  } else if (limitPrice.value <= 0) {
    return 'Enter a limit price.';
  }
  return '';
});
const isOffsetOrderType = computed(() => {
  const isOffset = selectedOrderType.value === 'LMT_OFFSET';
  console.log('Is Offset Order Type:', isOffset, 'Selected Order Type:', selectedOrderType.value);
  return isOffset;
});
const isCallDepthAvailable = computed(() => {
  return callDepth.value.bp1 !== null && callDepth.value.bq1 !== null && callDepth.value.sp1 !== null && callDepth.value.sq1 !== null;
});

const isPutDepthAvailable = computed(() => {
  return putDepth.value.bp1 !== null && putDepth.value.bq1 !== null && putDepth.value.sp1 !== null && putDepth.value.sq1 !== null;
});









// Functions
const updateToastVisibility = (value) => {
  showToast.value = value;
};
const setActiveTab = (tab) => {
  activeTab.value = tab;
};
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
const handleKillSwitchClick = () => {
  if (killSwitchActive.value) {
    // If the kill switch is already active, deactivate it directly
    toggleKillSwitch();
  }
  // If it's not active, the modal will be shown due to data-bs-target and data-bs-toggle
};
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
const toggleOvertradeProtection = () => {
  overtradeProtection.value = !overtradeProtection.value;
  localStorage.setItem('OvertradeProtection', overtradeProtection.value.toString());
};
const toggleExperimentalFeatures = () => {
  experimentalFeatures.value = !experimentalFeatures.value;
  localStorage.setItem('ExperimentalFeatures', JSON.stringify(experimentalFeatures.value));
};
const checkOvertradeProtection = () => {
  if (!overtradeProtection.value) return;

  const totalValue = Math.max(totalBuyValue.value, totalSellValue.value);
  const totalAvailableBalance = availableBalance.value + usedAmount.value;

  if (totalValue > totalAvailableBalance) {
    if (!killSwitchActive.value) {
      toastMessage.value = `Overtrade protection activated. Total value: ₹${totalValue.toFixed(2)} exceeds available balance: ₹${availableBalance.value.toFixed(2)}`;
      showToast.value = true;
      toggleKillSwitch();
    }
  }
};
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

const updateExchangeSymbols = () => {
  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya' || selectedBroker.value?.brokerName === 'PaperTrading') {
    exchangeSymbols.value = {
      NFO: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'],
      BFO: ['SENSEX', 'BANKEX'],
    };
  }

  // Store symbolData in exchangeSymbols
  exchangeSymbols.value.symbolData = symbolData;
};
const setDefaultExchangeAndMasterSymbol = () => {
  const cachedData = JSON.parse(localStorage.getItem('cachedTradingData')) || {};

  // Set the exchange
  const savedExchange = cachedData.selectedExchange || localStorage.getItem('selectedExchange');
  if (savedExchange && exchangeOptions.value.includes(savedExchange)) {
    selectedExchange.value = savedExchange;
  } else if (exchangeOptions.value.length > 0) {
    selectedExchange.value = exchangeOptions.value[0];
  }

  // Set the master symbol
  const savedMasterSymbol = cachedData.selectedMasterSymbol || localStorage.getItem('selectedMasterSymbol');
  if (savedMasterSymbol && exchangeSymbols.value[selectedExchange.value]?.includes(savedMasterSymbol)) {
    selectedMasterSymbol.value = savedMasterSymbol;
  } else if (exchangeSymbols.value[selectedExchange.value]?.length > 0) {
    selectedMasterSymbol.value = exchangeSymbols.value[selectedExchange.value][0];
  }

  // If we have cached data for the selected symbol, populate allSymbolsData
  if (cachedData[selectedMasterSymbol.value]) {
    allSymbolsData[selectedMasterSymbol.value] = cachedData[selectedMasterSymbol.value];
  }
};

const saveUserChoice = () => {
  localStorage.setItem('selectedExchange', selectedExchange.value);
  localStorage.setItem('selectedMasterSymbol', selectedMasterSymbol.value);
};
const getInitialPrice = (symbol) => {
  const strike = callStrikes.value.find(s =>
    s.tradingSymbol.includes(symbol) &&
    /C\d+$/.test(s.tradingSymbol)
  );
  return strike ? parseFloat(strike.strikePrice) : null;
};
const fetchTradingData = async () => {
  const masterSymbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];

  for (const symbol of masterSymbols) {
    try {
      let exchangeSymbol;

      // Set the correct exchange symbol
      if (['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'].includes(symbol)) {
        exchangeSymbol = 'NFO';
      } else if (['SENSEX', 'BANKEX'].includes(symbol)) {
        exchangeSymbol = 'BFO';
      } else {
        throw new Error(`Unknown symbol: ${symbol}`);
      }

      let response;
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        response = await fetch(`${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`);
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        response = await fetch(`${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`);
      } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
        response = await fetch(`${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`);
      } else {
        throw new Error('Unsupported broker');
      }

      const data = await response.json();

      allSymbolsData[symbol] = {
        expiryDates: data.expiryDates || [],
        callStrikes: Array.isArray(data.callStrikes)
          ? data.callStrikes
            .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
            .map(strike => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }))
          : [],
        putStrikes: Array.isArray(data.putStrikes)
          ? data.putStrikes
            .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
            .map(strike => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }))
          : [],
      };

      // Set initial price for each symbol
      const priceKey = `${symbol.toLowerCase()}Price`;
      if (priceKey in window && window[priceKey].value === 'N/A') {
        window[priceKey].value = getInitialPrice(symbol);
      }

    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      allSymbolsData[symbol] = { expiryDates: [], callStrikes: [], putStrikes: [] };
    }
  }

  // Update the reactive properties for the currently selected symbol
  updateSymbolData(selectedMasterSymbol.value);

  updateStrikesForExpiry(selectedExpiry.value);
  dataFetched.value = true;

  // Cache the fetched data
  localStorage.setItem('cachedTradingData', JSON.stringify(allSymbolsData));
};
const updateSymbolData = (symbol) => {
  if (allSymbolsData[symbol]) {
    expiryDates.value = allSymbolsData[symbol].expiryDates;
    callStrikes.value = allSymbolsData[symbol].callStrikes;
    putStrikes.value = allSymbolsData[symbol].putStrikes;
  } else {
    console.error(`No data found for ${symbol}`);
  }
};

const formatDate = (dateString) => {
  if (!dataFetched.value || !dateString) {
    return ''; // Return empty string if data hasn't been fetched or dateString is null
  }

  if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya' || selectedBroker.value?.brokerName === 'PaperTrading') {
    return dateString;
  }
  return dateString;
};
const convertToComparableDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options).replace(/,/g, '');
};
const updateStrikesForExpiry = (expiryDate, forceUpdate = false) => {
  let filteredCallStrikes, filteredPutStrikes;

  if (allSymbolsData[selectedMasterSymbol.value]) {
    filteredCallStrikes = allSymbolsData[selectedMasterSymbol.value].callStrikes.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = allSymbolsData[selectedMasterSymbol.value].putStrikes.filter(strike => strike.expiryDate === expiryDate);

    const uniqueStrikePrices = [...new Set([...filteredCallStrikes, ...filteredPutStrikes].map(strike => strike.strikePrice))].sort((a, b) => a - b);

    filteredCallStrikes = uniqueStrikePrices.map(strikePrice =>
      filteredCallStrikes.find(strike => strike.strikePrice === strikePrice) ||
      { strikePrice, expiryDate, securityId: null, tradingSymbol: null }
    );
    filteredPutStrikes = uniqueStrikePrices.map(strikePrice =>
      filteredPutStrikes.find(strike => strike.strikePrice === strikePrice) ||
      { strikePrice, expiryDate, securityId: null, tradingSymbol: null }
    );

    callStrikes.value = filteredCallStrikes;
    putStrikes.value = filteredPutStrikes;
  } else {
    console.error(`No data found for ${selectedMasterSymbol.value}`);
    return;
  }

  if (forceUpdate || !selectedCallStrike.value.securityId || !selectedPutStrike.value.securityId || selectedCallStrike.value.expiryDate !== expiryDate) {
    let currentPrice;
    switch (selectedMasterSymbol.value) {
      case 'NIFTY': currentPrice = parseFloat(niftyPrice.value); break;
      case 'BANKNIFTY': currentPrice = parseFloat(bankNiftyPrice.value); break;
      case 'FINNIFTY': currentPrice = parseFloat(finniftyPrice.value); break;
      case 'MIDCPNIFTY': currentPrice = parseFloat(midcpniftyPrice.value); break;
      case 'SENSEX': currentPrice = parseFloat(sensexPrice.value); break;
      case 'BANKEX': currentPrice = parseFloat(bankexPrice.value); break;
      default: console.error(`Unknown master symbol: ${selectedMasterSymbol.value}`); return;
    }

    if (currentPrice && !isNaN(currentPrice) && filteredCallStrikes.length > 0) {
      const nearestStrikeIndex = filteredCallStrikes.findIndex(strike =>
        Math.abs(strike.strikePrice - currentPrice) === Math.min(...filteredCallStrikes.map(s => Math.abs(s.strikePrice - currentPrice)))
      );

      const callOffsetIndex = nearestStrikeIndex - parseInt(callStrikeOffset.value);
      const putOffsetIndex = nearestStrikeIndex + parseInt(putStrikeOffset.value);

      selectedCallStrike.value = filteredCallStrikes[callOffsetIndex] || {};
      selectedPutStrike.value = filteredPutStrikes[putOffsetIndex] || {};
    }

    if (synchronizeOnLoad.value) {
      synchronizeStrikes();
      synchronizeOnLoad.value = false;
    }

    defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A';
    defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A';
  }
};
const saveOffsets = () => {
  localStorage.setItem('callStrikeOffset', callStrikeOffset.value);
  localStorage.setItem('putStrikeOffset', putStrikeOffset.value);
};
const synchronizeStrikes = () => {
  synchronizeCallStrikes();
  synchronizePutStrikes();
};
const synchronizeCallStrikes = () => {
  if (selectedPutStrike.value && selectedPutStrike.value.tradingSymbol) {
    let baseSymbol;
    if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya' || selectedBroker.value?.brokerName === 'PaperTrading') {
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
    if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya' || selectedBroker.value?.brokerName === 'PaperTrading') {
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
const saveLots = () => {
  localStorage.setItem('lotsPerSymbol', JSON.stringify(lotsPerSymbol.value));
};
const loadLots = () => {
  const savedLots = localStorage.getItem('lotsPerSymbol');
  if (savedLots) {
    lotsPerSymbol.value = JSON.parse(savedLots);
  }
};
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
const updateSelectedQuantity = () => {
  const instrument = quantities.value[selectedMasterSymbol.value];
  if (instrument) {
    const maxLots = instrument.maxLots; // Use maxLots from the instrument
    const lots = Math.min(Math.max(1, selectedLots.value), maxLots);
    lotsPerSymbol.value[selectedMasterSymbol.value] = lots;
    selectedQuantity.value = lots * instrument.lotSize;
    saveLots();
    getOrderMargin();
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
    const response = await axios.get(`${BASE_URL}/flattrade/getOrdersAndTrades`, {
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
    const response = await axios.get(`${BASE_URL}/shoonya/getOrdersAndTrades`, {
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
      // console.log('Shoonya Position Book:', positionBookRes.data);
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
      response = await axios.post(`${BASE_URL}/flattrade/fundLimit`, null, {
        params: {
          FLATTRADE_API_TOKEN,
          FLATTRADE_CLIENT_ID: selectedBroker.value.clientId
        }
      });
      fundLimits.value = {
        cash: response.data.cash,
        payin: response.data.payin,
        marginused: response.data.marginused,
      };
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
      if (!SHOONYA_API_TOKEN) {
        throw new Error('Shoonya API Token is missing');
      }
      response = await axios.post(`${BASE_URL}/shoonya/fundLimit`, null, {
        params: {
          SHOONYA_API_TOKEN,
          SHOONYA_CLIENT_ID: selectedBroker.value.clientId
        }
      });
      // Make sure the response data has the correct structure
      fundLimits.value = {
        cash: response.data.cash,
        payin: response.data.payin,
        marginused: response.data.marginused
        // Add any other relevant fields from the Shoonya response
      };
    }
    else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      fundLimits.value = {
        cash: 1000000,
        marginused: 0,
        payin: 0,
      };
    }
    else {
      throw new Error('Unsupported broker');
    }
    // fundLimits.value = response.data;
  } catch (error) {
    console.error('Failed to fetch fund limits:', error);
  }
};
const updateFundLimits = async () => {
  await fetchFundLimit();
  // console.log('Updated Fund Limits:', fundLimits.value);
};
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
const setOrderDetails = (transactionType, optionType) => {
  modalTransactionType.value = getTransactionType(transactionType); // Use getTransactionType to set modalTransactionType
  modalOptionType.value = optionType;
  selectedOrderType.value = orderTypes.value[1]; // Set selectedOrderType to LIMIT or LMT based on broker
  selectedStrike.value = optionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value;
};
const handleOrderClick = (transactionType, optionType) => {
  if (selectedOrderType.value !== orderTypes.value[1]) { // If not LMT order
    placeOrder(getTransactionType(transactionType), optionType);
  } else {
    setOrderDetails(transactionType, optionType);
  }
};
const resetOrderTypeIfNeeded = () => {
  if (previousOrderType.value === orderTypes.value[0]) { // Check if previousOrderType is MARKET or MKT
    resetOrderType();
  }
};

const resetOrderType = () => {
  selectedOrderType.value = orderTypes.value[0]; // Set selectedOrderType to MARKET or MKT based on broker
};
const getProductTypeValue = (productType) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  else if (selectedBroker.value?.brokerName === 'PaperTrading') {
    return productType === 'Intraday' ? 'I' : 'M';
  }
  return productType;
};
const getTransactionType = (type) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return type === 'BUY' ? 'B' : 'S';
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return type === 'BUY' ? 'B' : 'S';
  }
  return type;
};
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
  else if (selectedBroker.value?.brokerName === 'PaperTrading') {
    if (selectedExchange.value === 'NFO') {
      return 'NFO';
    } else if (selectedExchange.value === 'BFO') {
      return 'BFO';
    } else {
      throw new Error("Selected exchange is not valid for Paper Trading");
    }
  }
  else {
    throw new Error("Unsupported broker");
  }
};
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
const getOrderMargin = async () => {
  try {
    if (!['Flattrade', 'Shoonya'].includes(selectedBroker.value?.brokerName)) {
      throw new Error('Order margin calculation is only available for Flattrade and Shoonya');
    }

    const API_TOKEN = localStorage.getItem(`${selectedBroker.value.brokerName.toUpperCase()}_API_TOKEN`);
    if (!API_TOKEN) {
      throw new Error(`${selectedBroker.value.brokerName} API Token is missing`);
    }

    const clientId = selectedBroker.value.clientId;
    if (!clientId) {
      throw new Error(`${selectedBroker.value.brokerName} client ID is missing`);
    }

    const exchangeSegment = getExchangeSegment();

    // Function to get margin for a single strike
    const getMarginForStrike = async (strike, type) => {
      let orderData, endpoint;

      if (selectedBroker.value.brokerName === 'Flattrade') {
        orderData = {
          uid: clientId,
          actid: clientId,
          exch: exchangeSegment,
          tsym: strike.tradingSymbol,
          qty: selectedQuantity.value.toString(),
          prc: selectedOrderType.value === 'LMT' ? limitPrice.value.toString() : "0",
          prd: selectedProductType.value,
          trantype: getTransactionType('BUY'),
          prctyp: selectedOrderType.value,
        };
        endpoint = `${BASE_URL}/flattrade/getOrderMargin`;
      } else if (selectedBroker.value.brokerName === 'Shoonya') {
        orderData = {
          uid: clientId,
          actid: clientId,
          exch: exchangeSegment,
          tsym: strike.tradingSymbol,
          qty: selectedQuantity.value.toString(),
          prc: selectedOrderType.value === 'LMT' ? limitPrice.value.toString() : "0",
          prd: selectedProductType.value,
          trantype: getTransactionType('BUY'),
          prctyp: selectedOrderType.value,
          // Add any additional fields required by Shoonya
        };
        endpoint = `${BASE_URL}/shoonya/getOrderMargin`;
      }

      if (!orderData.exch || !orderData.qty || !orderData.tsym) {
        return;
      }
      const jData = JSON.stringify(orderData);
      const payload = `jKey=${API_TOKEN}&jData=${jData}`;

      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.stat === 'Ok') {
        // console.log(`Order margin for ${type}:`, response.data);
        return response.data.marginused;
      } else {
        throw new Error(response.data.emsg || `Failed to get order margin for ${type}`);
      }
    };

    // Get margins for both call and put
    const [callMargin, putMargin] = await Promise.all([
      getMarginForStrike(selectedCallStrike.value, 'call'),
      getMarginForStrike(selectedPutStrike.value, 'put')
    ]);

    orderMargin.call = callMargin;
    orderMargin.put = putMargin;

  } catch (error) {
    console.error('Error getting order margin:', error);
    // toastMessage.value = 'Failed to get order margin';
    // showToast.value = true;
    orderMargin.call = null;
    orderMargin.put = null;
  }
};
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
    const instrument = quantities.value[selectedMasterSymbol.value];
    const freezeLimit = instrument.freezeLimit;
    const orderLots = selectedLots.value;
    const fullOrderQuantity = selectedQuantity.value;

    let remainingLots = orderLots;
    let placedLots = 0;

    while (remainingLots > 0) {
      const lotsToPlace = Math.min(remainingLots, freezeLimit);
      const quantityToPlace = lotsToPlace * instrument.lotSize;

      const orderData = prepareOrderPayload(transactionType, drvOptionType, selectedStrike, exchangeSegment);
      orderData.qty = quantityToPlace.toString();

      let response;
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN');
        const payload = qs.stringify({
          ...orderData,
          uid: selectedBroker.value.clientId,
          actid: selectedBroker.value.clientId
        });
        response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
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
        response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
          headers: {
            'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }

      console.log(`Placed order for ${lotsToPlace} lots (${quantityToPlace} quantity)`); // placed here to prevent delay and debugging if required
      console.log("Order placed successfully:", response.data); // Log the response data for debugging if required
      remainingLots -= lotsToPlace;
      placedLots += lotsToPlace;
    }

    console.log(`All orders placed successfully. Total: ${placedLots} lots (${fullOrderQuantity} quantity)`); // Log the final result
    toastMessage.value = `Order(s) placed successfully for ${placedLots} lots`;
    showToast.value = true;

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits()

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
const findNewPosition = (tradingSymbol) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.find(p => p.tsym === tradingSymbol);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.find(p => p.tsym === tradingSymbol);
  }
  return null;
};
const placeOrderForPosition = async (transactionType, optionType, position) => {
  try {
    const quantity = Math.abs(Number(position.netQty || position.netqty));
    const instrument = quantities.value[selectedMasterSymbol.value];
    const freezeLimit = instrument.freezeLimit * instrument.lotSize;

    if (quantity === 0) {
      console.log('Quantity is zero, no order will be placed.');
      return;
    }

    let remainingQuantity = quantity;
    let placedQuantity = 0;

    while (remainingQuantity > 0) {
      const quantityToPlace = Math.min(remainingQuantity, freezeLimit);

      let orderData;
      if (selectedBroker.value?.brokerName === 'Flattrade' || selectedBroker.value?.brokerName === 'Shoonya') {
        orderData = {
          uid: selectedBroker.value.clientId,
          actid: selectedBroker.value.clientId,
          exch: selectedExchange.value === 'NFO' ? 'NFO' : 'BFO',
          tsym: position.tsym,
          qty: quantityToPlace.toString(),
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
        response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
          headers: {
            'Authorization': `Bearer ${FLATTRADE_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
      else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
        const payload = qs.stringify(orderData);
        response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
          headers: {
            'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }

      console.log(`Placed order for ${quantityToPlace} quantity`);

      remainingQuantity -= quantityToPlace;
      placedQuantity += quantityToPlace;
    }

    console.log(`All orders placed successfully. Total: ${placedQuantity} quantity`);
    toastMessage.value = `Order(s) placed successfully for ${getSymbol(position)}`;
    showToast.value = true;

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
const setStrategyType = (type) => {
  strategyType.value = type;
};
const loadStrategy = (strategy) => {
  // Clear existing basket orders
  basketOrders.value = [];

  // Implement the logic for each strategy
  switch (strategy.name) {
    case 'Short Straddle':
      addToBasket('SELL', 'CALL');
      addToBasket('SELL', 'PUT');
      break;
    case 'Iron Butterfly':
      addToBasket('BUY', 'PUT', -1);
      addToBasket('SELL', 'PUT');
      addToBasket('SELL', 'CALL');
      addToBasket('BUY', 'CALL', 1);
      break;
    case 'Short Strangle':
      addToBasket('SELL', 'PUT', -1);
      addToBasket('SELL', 'CALL', 1);
      break;
    case 'Short Iron Condor':
      addToBasket('BUY', 'PUT', -2);
      addToBasket('SELL', 'PUT', -1);
      addToBasket('SELL', 'CALL', 1);
      addToBasket('BUY', 'CALL', 2);
      break;
    case 'Batman':
      addToBasket('BUY', 'PUT', -2);
      addToBasket('SELL', 'PUT', -1);
      addToBasket('SELL', 'CALL');
      addToBasket('SELL', 'CALL', 1);
      addToBasket('BUY', 'CALL', 2);
      break;
    case 'Double Plateau':
      addToBasket('BUY', 'PUT', -2);
      addToBasket('SELL', 'PUT', -1, 2); // Sell 2 contracts
      addToBasket('SELL', 'CALL', 1, 2); // Sell 2 contracts
      addToBasket('BUY', 'CALL', 2);
      break;
    case 'Jade Lizard':
      addToBasket('SELL', 'PUT');
      addToBasket('SELL', 'CALL', 1);
      addToBasket('SELL', 'CALL', 2);
      break;
    case 'Reverse Jade Lizard':
      addToBasket('SELL', 'CALL');
      addToBasket('SELL', 'PUT', -1);
      addToBasket('SELL', 'PUT', -2);
      break;
    case 'Buy Put':
      addToBasket('BUY', 'PUT');
      break;
    case 'Sell Call':
      addToBasket('SELL', 'CALL');
      break;
    case 'Bear Call Spread':
      addToBasket('SELL', 'CALL');
      addToBasket('BUY', 'CALL', 1);
      break;
    case 'Bear Put Spread':
      addToBasket('BUY', 'PUT');
      addToBasket('SELL', 'PUT', -1);
      break;
    case 'Put Ratio Back Spread':
      addToBasket('SELL', 'PUT');
      addToBasket('BUY', 'PUT', -1, 2); // Buy 2 contracts
      break;
    case 'Long Calendar with Puts':
      addToBasket('SELL', 'PUT', 0, 1, 'near'); // Sell near-term expiry
      addToBasket('BUY', 'PUT', 0, 1, 'far');  // Buy far-term expiry
      break;
    case 'Bear Condor':
      addToBasket('BUY', 'PUT', -1);
      addToBasket('SELL', 'PUT');
      addToBasket('SELL', 'CALL', 1);
      addToBasket('BUY', 'CALL', 2);
      break;
    case 'Bear Butterfly':
      addToBasket('BUY', 'PUT', -1);
      addToBasket('SELL', 'PUT', 0, 2); // Sell 2 contracts
      addToBasket('BUY', 'PUT', 1);
      break;
    case 'Buy Call':
      addToBasket('BUY', 'CALL');
      break;
    case 'Sell Put':
      addToBasket('SELL', 'PUT');
      break;
    case 'Bull Call Spread':
      addToBasket('BUY', 'CALL');
      addToBasket('SELL', 'CALL', 1);
      break;
    case 'Bull Put Spread':
      addToBasket('SELL', 'PUT');
      addToBasket('BUY', 'PUT', -1);
      break;
    case 'Call Ratio Back Spread':
      addToBasket('SELL', 'CALL');
      addToBasket('BUY', 'CALL', 1, 2); // Buy 2 contracts
      break;
    case 'Long Calendar with Calls':
      addToBasket('SELL', 'CALL', 0, 1, 'near'); // Sell near-term expiry
      addToBasket('BUY', 'CALL', 0, 1, 'far');  // Buy far-term expiry
      break;
    case 'Bull Condor':
      addToBasket('BUY', 'CALL', -1);
      addToBasket('SELL', 'CALL');
      addToBasket('SELL', 'CALL', 1);
      addToBasket('BUY', 'CALL', 2);
      break;
    case 'Bull Butterfly':
      addToBasket('BUY', 'CALL', -1);
      addToBasket('SELL', 'CALL', 0, 2); // Sell 2 contracts
      addToBasket('BUY', 'CALL', 1);
      break;
    case 'Call Ratio Spread':
      addToBasket('BUY', 'CALL');
      addToBasket('SELL', 'CALL', 1, 2); // Sell 2 contracts
      break;
    case 'Put Ratio Spread':
      addToBasket('BUY', 'PUT');
      addToBasket('SELL', 'PUT', -1, 2); // Sell 2 contracts
      break;
    case 'Long Straddle':
      addToBasket('BUY', 'CALL');
      addToBasket('BUY', 'PUT');
      break;
    case 'Long Iron Butterfly':
      addToBasket('SELL', 'PUT', -1);
      addToBasket('BUY', 'PUT');
      addToBasket('BUY', 'CALL');
      addToBasket('SELL', 'CALL', 1);
      break;
    case 'Long Strangle':
      addToBasket('BUY', 'PUT', -1);
      addToBasket('BUY', 'CALL', 1);
      break;
    case 'Long Iron Condor':
      addToBasket('SELL', 'PUT', -2);
      addToBasket('BUY', 'PUT', -1);
      addToBasket('BUY', 'CALL', 1);
      addToBasket('SELL', 'CALL', 2);
      break;
    case 'Strip':
      addToBasket('BUY', 'PUT', 0, 2); // Buy 2 puts
      addToBasket('BUY', 'CALL');
      break;
    case 'Strap':
      addToBasket('BUY', 'CALL', 0, 2); // Buy 2 calls
      addToBasket('BUY', 'PUT');
      break;
    default:
      console.log('Strategy not implemented');
  }

  // Update the basket name
  basketName.value = strategy.name;
};
const addToBasket = (transactionType, optionType, strikeOffset = 0, contracts = 1) => {
  let selectedStrike = optionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value;

  // Adjust the strike based on the offset
  if (strikeOffset !== 0) {
    const strikes = optionType === 'CALL' ? callStrikes.value : putStrikes.value;
    const currentIndex = strikes.findIndex(strike => strike.strikePrice === selectedStrike.strikePrice);
    selectedStrike = strikes[currentIndex + strikeOffset] || selectedStrike;
  }

  basketOrders.value.push({
    id: uuidv4(),
    tradingSymbol: selectedStrike.tradingSymbol,
    transactionType: getTransactionType(transactionType),
    optionType,
    strikePrice: selectedStrike.strikePrice,
    lots: selectedLots.value * contracts,
    quantity: selectedQuantity.value * contracts,
    productType: selectedProductType.value,
    orderType: selectedOrderType.value,
    price: limitPrice.value
  });
};
const updateBasketOrderQuantity = (order) => {
  const instrument = quantities.value[selectedMasterSymbol.value];
  if (instrument) {
    order.quantity = order.lots * instrument.lotSize;
  }
};
const removeFromBasket = (id) => {
  basketOrders.value = basketOrders.value.filter(order => order.id !== id);
};
const placeBasket = async (basketId) => {
  const basket = savedBaskets.value.find(b => b.id === basketId);
  if (!basket) {
    toastMessage.value = 'Basket not found';
    showToast.value = true;
    return;
  }

  for (const order of basket.orders) {
    const success = await placeBasketOrder(order);
    if (!success) {
      toastMessage.value = `Failed to place order for ${order.tradingSymbol}`;
      showToast.value = true;
      break;
    }
  }

  // Add a delay before fetching updated data
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update both orders and positions
  await updateOrdersAndPositions();

  // Update fund limits
  await updateFundLimits();

  toastMessage.value = `Basket "${basket.name}" orders placed successfully`;
  showToast.value = true;
};
const placeBasketOrder = async (order) => {
  try {
    const exchangeSegment = getExchangeSegment();
    const orderData = prepareOrderPayload(order.transactionType, order.optionType, { tradingSymbol: order.tradingSymbol }, exchangeSegment);
    orderData.qty = order.quantity.toString();
    orderData.prd = order.productType;
    orderData.prctyp = order.orderType;
    orderData.prc = order.orderType === 'LMT' ? order.price.toString() : "0";

    let response;
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN');
      const payload = qs.stringify({
        ...orderData,
        uid: selectedBroker.value.clientId,
        actid: selectedBroker.value.clientId
      });
      response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
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
      response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
        headers: {
          'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }

    console.log(`Placed basket order for ${order.tradingSymbol}`);
    console.log("Basket order placed successfully:", response.data);

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits();

    return true;
  } catch (error) {
    console.error("Error placing basket order:", error);
    return false;
  }
};
const placeAllBasketOrders = async () => {
  const executedBasket = {
    id: uuidv4(),
    name: basketName.value || `Basket ${new Date().toLocaleString()}`,
    orders: [...basketOrders.value],
    executionTime: new Date().toISOString()
  };

  for (const order of sortedBasketOrders.value) {
    const success = await placeBasketOrder(order);
    if (!success) {
      toastMessage.value = `Failed to place order for ${order.tradingSymbol}`;
      showToast.value = true;
      break;
    }
  }

  // Add a delay before fetching updated data
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update both orders and positions
  await updateOrdersAndPositions();

  // Update fund limits
  await updateFundLimits();

  savedBaskets.value.push(executedBasket);
  localStorage.setItem('savedBaskets', JSON.stringify(savedBaskets.value));

  basketOrders.value = [];
  basketName.value = '';
  editingBasketId.value = null;
  toastMessage.value = 'All basket orders placed successfully';
  showToast.value = true;
  showBasketOrderModal.value = false;
};
const updateTradingSymbol = (order) => {
  const strikes = order.optionType === 'CALL' ? callStrikes.value : putStrikes.value;
  const newStrike = strikes.find(strike => strike.strikePrice === order.strikePrice);
  if (newStrike) {
    order.tradingSymbol = newStrike.tradingSymbol;
  }
};
const closeAllPositions = async () => {
  try {
    let positionsClosed = false;

    if (selectedBroker.value?.brokerName === 'Flattrade') {
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
const setReverseMode = (mode) => {
  reverseMode.value = mode;
};
const reversePositions = async () => {
  try {
    let positionsReversed = false;
    let positionsToReverse;

    if (reverseMode.value === 'all') {
      positionsToReverse = [...flatTradePositionBook.value, ...shoonyaPositionBook.value];
    } else {
      positionsToReverse = [...selectedFlattradePositionsSet.value, ...selectedShoonyaPositionsSet.value]
        .map(tsym => [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
          .find(p => p.tsym === tsym))
        .filter(Boolean);
    }

    for (const position of positionsToReverse) {
      const netqty = Number(position.netqty);
      if (netqty !== 0) {
        // Close the current position
        const closeTransactionType = netqty > 0 ? 'S' : 'B';
        await placeOrderForPosition(closeTransactionType, position.tsym.includes('C') ? 'CALL' : 'PUT', position);

        // Open a new position in the opposite direction
        const openTransactionType = netqty > 0 ? 'B' : 'S';
        const reversedPosition = { ...position, netqty: Math.abs(netqty) }; // Always use positive quantity
        await placeOrderForPosition(openTransactionType, position.tsym.includes('C') ? 'CALL' : 'PUT', reversedPosition);

        positionsReversed = true;

        // Remove the reversed position from the selected positions if in 'selected' mode
        if (reverseMode.value === 'selected') {
          if (selectedBroker.value?.brokerName === 'Shoonya') {
            selectedShoonyaPositionsSet.value.delete(position.tsym);
          } else if (selectedBroker.value?.brokerName === 'Flattrade') {
            selectedFlattradePositionsSet.value.delete(position.tsym);
          }
        }
      }
    }

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits();

    if (positionsReversed) {
      toastMessage.value = `${reverseMode.value === 'all' ? 'All' : 'Selected'} positions reversed successfully`;
    } else {
      toastMessage.value = `No positions to reverse`;
    }
    showToast.value = true;
  } catch (error) {
    console.error('Error reversing positions:', error);
    toastMessage.value = `Failed to reverse ${reverseMode.value === 'all' ? 'all' : 'selected'} positions`;
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
      await axios.post(`${BASE_URL}/flattrade/cancelOrder`, {
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
      await axios.post(`${BASE_URL}/shoonya/cancelOrder`, {
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
const setDefaultExpiry = () => {
  if (expiryDates.value.length > 0) {
    const offsetIndex = parseInt(expiryOffset.value);
    const selectedIndex = Math.min(offsetIndex, expiryDates.value.length - 1);
    selectedExpiry.value = expiryDates.value[selectedIndex];
  }
};
const saveExpiryOffset = () => {
  localStorage.setItem('expiryOffset', expiryOffset.value);
};
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

    const response = await axios.post(`${BASE_URL}/flattrade/setCredentials`, {
      usersession: apiToken,
      userid: clientId
    });
    // console.log('Credentials set successfully:', response.data);
    // toastMessage.value = 'Flattrade changes set successfully';
    // showToast.value = true;
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

    const response = await axios.post(`${BASE_URL}/shoonya/setCredentials`, {
      usersession: apiToken,
      userid: clientId
    });
    // console.log('Credentials set successfully:', response.data);
    // toastMessage.value = 'Shoonya changes set successfully';
    // showToast.value = true;
  } catch (error) {
    console.error('Error setting credentials: ', error);
    toastMessage.value = 'Failed to set Shoonya credentials';
    showToast.value = true;
  }
};
const setPaperTradingCredentials = async () => {
  try {
    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'PaperTrading') {
      toastMessage.value = 'PaperTrading broker is not selected';
      showToast.value = true;
      return;
    }

    // Check if the broker status is 'Connected'
    if (brokerStatus.value !== 'Connected') {
      console.error('PaperTrading broker is not connected');
      toastMessage.value = 'PaperTrading broker is not connected';
      showToast.value = true;
      return;
    }

    const clientId = selectedBroker.value.clientId;
    const apiKey = selectedBroker.value.apiKey;

    if (!clientId || !apiKey) {
      console.error('PaperTrading client ID or API key is missing');
      toastMessage.value = 'PaperTrading credentials are missing';
      showToast.value = true;
      return;
    }

    // Get the selected broker for paper trading
    const selectedPaperBroker = localStorage.getItem('selectedBrokerForPaper');
    if (!selectedPaperBroker) {
      console.error('No broker selected for paper trading');
      toastMessage.value = 'No broker selected for paper trading';
      showToast.value = true;
      return;
    }

    // Set credentials based on the selected broker
    if (selectedPaperBroker.brokerName === 'Flattrade') {
      await setFlattradeCredentials();
    } else if (selectedPaperBroker.brokerName === 'Shoonya') {
      await setShoonyaCredentials();
    }
    toastMessage.value = 'PaperTrading credentials set successfully';
    showToast.value = true;

  } catch (error) {
    console.error('Error setting PaperTrading credentials:', error);
    toastMessage.value = 'Failed to set PaperTrading credentials';
    showToast.value = true;
  }
};
const connectWebSocket = () => {
  let websocketUrl;

  if (selectedBroker.value?.brokerName === 'Flattrade' && brokerStatus.value === 'Connected') {
    websocketUrl = 'ws://localhost:8765';
  } else if (selectedBroker.value?.brokerName === 'Shoonya' && brokerStatus.value === 'Connected') {
    websocketUrl = 'ws://localhost:8766';
  } else if (selectedBroker.value?.brokerName === 'PaperTrading' && brokerStatus.value === 'Connected') {
    // Get the selected broker for paper trading
    const selectedPaperBroker = JSON.parse(localStorage.getItem('selectedBrokerForPaper') || '{}');
    if (selectedPaperBroker.brokerName === 'Flattrade') {
      websocketUrl = 'ws://localhost:8765';
    } else if (selectedPaperBroker.brokerName === 'Shoonya') {
      websocketUrl = 'ws://localhost:8766';
    } else {
      console.error('Invalid broker selected for paper trading');
      return;
    }
  }

  console.log(`Connecting to WebSocket at ${websocketUrl}`);
  socket.value = new WebSocket(websocketUrl);

  socket.value.onmessage = (event) => {
    const quoteData = JSON.parse(event.data);
    if (quoteData.lp) {
      const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value];
      if (symbolInfo && quoteData.tk === symbolInfo.exchangeSecurityId) {
        // Update the price for the selected master symbol
        switch (selectedMasterSymbol.value) {
          case 'NIFTY':
            niftyPrice.value = quoteData.lp;
            updateOHLCIfNotEmpty('master', quoteData);
            break;
          case 'BANKNIFTY':
            bankNiftyPrice.value = quoteData.lp;
            updateOHLCIfNotEmpty('master', quoteData);
            break;
          case 'FINNIFTY':
            finniftyPrice.value = quoteData.lp;
            updateOHLCIfNotEmpty('master', quoteData);
            break;
          case 'MIDCPNIFTY':
            midcpniftyPrice.value = quoteData.lp;
            updateOHLCIfNotEmpty('master', quoteData);
            break;
          case 'SENSEX':
            sensexPrice.value = quoteData.lp;
            updateOHLCIfNotEmpty('master', quoteData);
            break;
          case 'BANKEX':
            bankexPrice.value = quoteData.lp;
            updateOHLCIfNotEmpty('master', quoteData);
            break;
        }
      }
      else if (quoteData.tk === defaultCallSecurityId.value) {
        latestCallLTP.value = quoteData.lp;
        updateOHLCIfNotEmpty('call', quoteData);
      } else if (quoteData.tk === defaultPutSecurityId.value) {
        latestPutLTP.value = quoteData.lp;
        updateOHLCIfNotEmpty('put', quoteData);
      }

      // Update position LTPs
      const positionTsym = Object.keys(positionSecurityIds.value).find(tsym => positionSecurityIds.value[tsym] === quoteData.tk);
      if (positionTsym) {
        positionLTPs.value[positionTsym] = quoteData.lp;
      }
      // Handle additional strike LTPs
      if (ltpCallbacks.value[quoteData.tk]) {
        ltpCallbacks.value[quoteData.tk](quoteData);
      }
    }

    // Handle depth feed
    if (quoteData.tk === defaultCallSecurityId.value) {
      // console.log('Updating call depth:', quoteData);
      callDepth.value = { ...callDepth.value, ...quoteData };
    } else if (quoteData.tk === defaultPutSecurityId.value) {
      // console.log('Updating put depth:', quoteData);
      putDepth.value = { ...putDepth.value, ...quoteData };
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
// Helper function to update OHLC values if they are not empty
const updateOHLCIfNotEmpty = (type, data) => {
  if (type === 'master') {
    if (data.o) masterOpenPrice.value = data.o;
    if (data.h) masterHighPrice.value = data.h;
    if (data.l) masterLowPrice.value = data.l;
    if (data.c) masterClosePrice.value = data.c;
  } else if (type === 'call') {
    if (data.o) callOpenPrice.value = data.o;
    if (data.h) callHighPrice.value = data.h;
    if (data.l) callLowPrice.value = data.l;
    if (data.c) callClosePrice.value = data.c;
  } else if (type === 'put') {
    if (data.o) putOpenPrice.value = data.o;
    if (data.h) putHighPrice.value = data.h;
    if (data.l) putLowPrice.value = data.l;
    if (data.c) putClosePrice.value = data.c;
  }
};
const currentSubscriptions = ref({
  masterSymbol: null,
  callOption: null,
  putOption: null
});
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
      socket.value.send(JSON.stringify(data));
      currentSubscriptions.value.callOption = defaultCallSecurityId.value;
      currentSubscriptions.value.putOption = defaultPutSecurityId.value;
      getOrderMargin();
    }

    if (additionalSymbols.value) {
      additionalStrikes.value.forEach(strike => {
        const callStrike = callStrikes.value.find(s => s.strikePrice === strike);
        const putStrike = putStrikes.value.find(s => s.strikePrice === strike);

        if (callStrike) subscribeToLTP(callStrike.securityId, updateAdditionalStrikeLTP);
        if (putStrike) subscribeToLTP(putStrike.securityId, updateAdditionalStrikeLTP);
      });
    }
  }

  // Subscribe to position LTPs separately
  subscribeToPositionLTPs();
};
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
const subscribeToLTP = (securityId, callback) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const exchangeSegment = getExchangeSegment();
    const symbolToSubscribe = `${exchangeSegment}|${securityId}`;
    const data = {
      action: 'subscribe',
      symbols: [symbolToSubscribe]
    };
    socket.value.send(JSON.stringify(data));

    // Store the callback for this security ID
    ltpCallbacks.value[securityId] = callback;
  }
};
const updateAdditionalStrikeLTP = (data) => {
  const callStrike = callStrikes.value.find(s => s.securityId === data.tk);
  const putStrike = putStrikes.value.find(s => s.securityId === data.tk);

  if (callStrike) {
    additionalStrikeLTPs.value.call[callStrike.strikePrice] = data.lp;
  } else if (putStrike) {
    additionalStrikeLTPs.value.put[putStrike.strikePrice] = data.lp;
  }
};
const unsubscribeFromAdditionalStrikes = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const exchangeSegment = getExchangeSegment();
    const symbolsToUnsubscribe = Object.keys(ltpCallbacks.value).map(securityId => `${exchangeSegment}|${securityId}`);

    if (symbolsToUnsubscribe.length > 0) {
      const data = {
        action: 'unsubscribe',
        symbols: symbolsToUnsubscribe
      };
      socket.value.send(JSON.stringify(data));
    }

    // Clear the callbacks
    ltpCallbacks.value = {};
  }
};
const debouncedUpdateSubscriptions = debounce(updateSubscriptions, 300);
const initializeSubscriptions = () => {
  subscribeToMasterSymbol();
  subscribeToOptions();
};
// Helper function to get the correct price for the selected master symbol
const getMasterSymbolPrice = () => {
  switch (selectedMasterSymbol.value) {
    case 'NIFTY':
      return parseFloat(niftyPrice.value);
    case 'BANKNIFTY':
      return parseFloat(bankNiftyPrice.value);
    case 'FINNIFTY':
      return parseFloat(finniftyPrice.value);
    case 'MIDCPNIFTY':
      return parseFloat(midcpniftyPrice.value);
    case 'SENSEX':
      return parseFloat(sensexPrice.value);
    case 'BANKEX':
      return parseFloat(bankexPrice.value);
    default:
      return 0;
  }
};
const toggleAdditionalSymbols = () => {
  additionalSymbols.value = !additionalSymbols.value;
};
const toggleMarketDepth = () => {
  marketDepth.value = !marketDepth.value;
  localStorage.setItem('marketDepth', JSON.stringify(marketDepth.value));
};
const playNotificationSound = () => {
  localStorage.setItem('notificationSound', notificationSound.value.toString());
  if (notificationSound.value) {
    const audio = new Audio(`/${selectedSound.value}`);
    audio.play();
    showToastNotification('Notification sound enabled');
  } else {
    showToastNotification('Notification sound disabled');
  }
};
const showToastNotification = (message) => {
  toastMessage.value = message;
  updateToastVisibility(true);
  setTimeout(() => {
    updateToastVisibility(false);
  }, 3000);
};
const subscribeToBasketLTPs = () => {
  basketOrders.value.forEach(order => {
    const securityId = getSecurityIdForSymbol(order.tradingSymbol);
    if (securityId) {
      subscribeToLTP(securityId, updateBasketLTP);
    }
  });
};
const updateBasketLTP = (data) => {
  const order = basketOrders.value.find(o => getSecurityIdForSymbol(o.tradingSymbol) === data.tk);
  if (order) {
    positionLTPs.value[order.tradingSymbol] = data.lp;
  }
};
const getSecurityIdForSymbol = (symbol) => {
  const strike = [...callStrikes.value, ...putStrikes.value].find(s => s.tradingSymbol === symbol);
  return strike ? strike.securityId : null;
};
const saveBasket = () => {
  if (basketName.value.trim() === '') {
    toastMessage.value = 'Please enter a basket name';
    showToast.value = true;
    return;
  }

  if (editingBasketId.value !== null) {
    const index = savedBaskets.value.findIndex(b => b.id === editingBasketId.value);
    if (index !== -1) {
      savedBaskets.value[index] = {
        id: editingBasketId.value,
        name: basketName.value,
        orders: [...basketOrders.value]
      };
    }
  } else {
    savedBaskets.value.push({
      id: uuidv4(),
      name: basketName.value,
      orders: [...basketOrders.value]
    });
  }

  localStorage.setItem('savedBaskets', JSON.stringify(savedBaskets.value));
  basketName.value = '';
  editingBasketId.value = null;
  toastMessage.value = 'Basket saved successfully';
  showToast.value = true;
};
const loadBasket = (basketId) => {
  const basket = savedBaskets.value.find(b => b.id === basketId);
  if (basket) {
    basketOrders.value = [...basket.orders];
    basketName.value = basket.name;
    editingBasketId.value = basketId;
    subscribeToBasketLTPs();
  }
};
const deleteBasket = (basketId) => {
  savedBaskets.value = savedBaskets.value.filter(b => b.id !== basketId);
  localStorage.setItem('savedBaskets', JSON.stringify(savedBaskets.value));
  if (editingBasketId.value === basketId) {
    basketName.value = '';
    editingBasketId.value = null;
  }
};
const validateAndPlaceOrder = () => {
  if (isValidLimitPrice.value) {
    placeOrder(modalTransactionType.value, modalOptionType.value);
    // The modal will be dismissed automatically due to the data-bs-dismiss attribute
  }
};

const handleOrderTypeChange = () => {
  console.log('Order Type Changed:', selectedOrderType.value);

  switch (selectedOrderType.value) {
    case 'MKT':
      limitPrice.value = null;
      break;
    case 'LMT':
      if (!limitPrice.value) {
        limitPrice.value = getCurrentLTP();
      }
      break;
    case 'LMT_LTP':
      limitPrice.value = getCurrentLTP();
      break;
    case 'LMT_OFFSET':
      limitPrice.value = getCurrentLTP() + limitOffset.value;
      break;
    case 'MKT_PROTECTION':
      limitPrice.value = getCurrentLTP() * 1.01;
      break;
    default:
      limitPrice.value = null;
      break;
  }
};
const getCurrentLTP = () => {
  return modalOptionType.value === 'CALL' ? parseFloat(latestCallLTP.value) : parseFloat(latestPutLTP.value);
};
const setStoploss = (position, type) => {
  if (!enableStoploss.value) {
    console.log('Stoploss is disabled.');
    return;
  }
  const quantity = Math.abs(Number(position.netQty || position.netqty));

  if (quantity === 0) {
    console.log(`Quantity is zero for ${position.tsym}, no stoploss will be set.`);
    return;
  }

  const ltp = parseFloat(positionLTPs.value[position.tsym]);
  if (isNaN(ltp)) {
    console.error(`Invalid LTP for ${position.tsym}: ${positionLTPs.value[position.tsym]}`);
    return;
  }

  const stoplossValueNum = parseFloat(stoplossValue.value);
  if (isNaN(stoplossValueNum)) {
    console.error(`Invalid stoploss value: ${stoplossValue.value}`);
    return;
  }

  const isLongPosition = position.netqty > 0;
  let stoplossPrice;

  try {
    if (type === 'trailing') {
      stoplossPrice = isLongPosition ? ltp - stoplossValueNum : ltp + stoplossValueNum;
      trailingStoplosses.value[position.tsym] = parseFloat(stoplossPrice.toFixed(2));
      stoplosses.value[position.tsym] = null;
    } else {
      stoplossPrice = isLongPosition ? ltp - stoplossValueNum : ltp + stoplossValueNum;
      stoplosses.value[position.tsym] = parseFloat(stoplossPrice.toFixed(2));
      trailingStoplosses.value[position.tsym] = null;
    }
    tslHitPositions.delete(position.tsym);
    console.log(`${type === 'trailing' ? 'TSL' : 'SL'} set for ${position.tsym}: ${stoplossPrice.toFixed(2)}`);
  } catch (error) {
    console.error(`Error setting ${type} stoploss for ${position.tsym}:`, error);
  }
};
const removeStoploss = (position) => {
  stoplosses.value[position.tsym] = null;
  trailingStoplosses.value[position.tsym] = null;
  tslHitPositions.delete(position.tsym);
};
const increaseStoploss = (position) => {
  if (stoplosses.value[position.tsym] !== null) {
    stoplosses.value[position.tsym] = Number((stoplosses.value[position.tsym] + 0.5).toFixed(2));
  }
};

const decreaseStoploss = (position) => {
  if (stoplosses.value[position.tsym] !== null) {
    stoplosses.value[position.tsym] = Number((stoplosses.value[position.tsym] - 0.5).toFixed(2));
  }
};
const setTarget = (position) => {
  if (!enableTarget.value) {
    console.log('Target is disabled.');
    return;
  }
  const quantity = Math.abs(Number(position.netQty || position.netqty));

  if (quantity === 0) {
    console.log(`Quantity is zero for ${position.tsym}, no target will be set.`);
    return;
  }

  if (enableTarget.value && targetValue.value > 0) {
    const ltp = positionLTPs.value[position.tsym];

    // Set target above the LTP for all positions, rounded to 2 decimal places
    targets.value[position.tsym] = Number((parseFloat(ltp) + parseFloat(targetValue.value)).toFixed(2));

    // console.log(`Target set for ${position.tsym}: LTP = ${ltp}, TargetValue = ${targetValue.value}, Target = ${targets.value[position.tsym]}`);
  } else {
    // If target is not enabled or targetValue is not set, remove any existing target
    targets.value[position.tsym] = null;
    // console.log(`Target removed for ${position.tsym}`);
  }
};
const removeTarget = (position) => {
  targets.value[position.tsym] = null;
};
const increaseTarget = (position) => {
  if (targets.value[position.tsym] !== null) {
    targets.value[position.tsym] += 0.5; // Adjust increment value as needed
  }
};
const decreaseTarget = (position) => {
  if (targets.value[position.tsym] !== null) {
    targets.value[position.tsym] -= 0.5; // Adjust decrement value as needed
  }
};

const checkTargets = (newLTPs) => {
  if (!enableTarget.value) {
    // console.log('Target is disabled.');
    return;
  }
  // console.log('Checking targets...');
  const validTargets = Object.entries(targets.value).filter(([tsym, target]) => target !== null && target !== undefined);

  if (validTargets.length === 0) {
    // console.log('No valid targets set. Skipping check.');
    return;
  }

  for (const [tsym, target] of validTargets) {
    const currentLTP = positionLTPs.value[tsym];
    const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(p => p.tsym === tsym);

    // console.log(`Checking target for ${tsym}: Current LTP = ${currentLTP}, Target = ${target}`);
    if (position && currentLTP) {
      const isLongPosition = position.netqty > 0;
      if ((isLongPosition && currentLTP >= target) || (!isLongPosition && currentLTP <= target)) {
        console.log(`Target reached for ${tsym}. Placing order to close position.`);
        const transactionType = isLongPosition ? 'S' : 'B';
        placeOrderForPosition(transactionType, position.tsym.includes('C') ? 'CALL' : 'PUT', position);
        removeTarget(position);
        toastMessage.value = 'Target hit for ' + tsym;
        showToast.value = true;
      }
    }
  }
};
const checkStoplosses = () => {
  if (!enableStoploss.value) {
    // console.log('Stoploss is disabled.');
    return;
  }

  const stoplossValueNum = parseFloat(stoplossValue.value);
  if (isNaN(stoplossValueNum)) {
    console.error(`Invalid stoploss value: ${stoplossValue.value}`);
    return;
  }

  // Check static stoplosses
  for (const [tsym, sl] of Object.entries(stoplosses.value)) {
    if (sl !== null && positionLTPs.value[tsym] !== undefined) {
      const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(p => p.tsym === tsym);
      if (position) {
        const isLongPosition = position.netqty > 0;
        const currentLTP = parseFloat(positionLTPs.value[tsym]);
        if (isNaN(currentLTP)) {
          console.error(`Invalid LTP for ${tsym}: ${positionLTPs.value[tsym]}`);
          continue;
        }
        if ((isLongPosition && currentLTP <= sl) || (!isLongPosition && currentLTP >= sl)) {
          console.log(`Static SL hit for ${tsym}: LTP ${currentLTP}, SL ${sl}`);
          placeOrderForPosition(isLongPosition ? 'S' : 'B', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
          removeStoploss(position);
          toastMessage.value = 'Stoploss hit for ' + tsym;
          showToast.value = true;
        }
      }
    }
  }

  // Check trailing stoplosses
  for (const [tsym, tsl] of Object.entries(trailingStoplosses.value)) {
    if (tsl !== null && positionLTPs.value[tsym] !== undefined) {
      const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(p => p.tsym === tsym);
      if (position) {
        const isLongPosition = position.netqty > 0;
        const currentLTP = parseFloat(positionLTPs.value[tsym]);
        if (isNaN(currentLTP)) {
          console.error(`Invalid LTP for ${tsym}: ${positionLTPs.value[tsym]}`);
          continue;
        }

        if (isLongPosition) {
          if (currentLTP > tsl + stoplossValueNum) {
            // Update TSL for long positions
            trailingStoplosses.value[tsym] = parseFloat((currentLTP - stoplossValueNum).toFixed(2));
          } else if (currentLTP <= tsl && !tslHitPositions.has(tsym)) {
            // Hit TSL for long positions
            console.log(`TSL hit for ${tsym}: LTP ${currentLTP}, TSL ${tsl}`);
            placeOrderForPosition('S', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
            removeStoploss(position);
            toastMessage.value = 'Trailing Stoploss hit for ' + tsym;
            showToast.value = true;
            tslHitPositions.add(tsym); // Mark TSL as hit
          }
        } else {
          if (currentLTP < tsl - stoplossValueNum) {
            // Update TSL for short positions
            trailingStoplosses.value[tsym] = parseFloat((currentLTP + stoplossValueNum).toFixed(2));
          } else if (currentLTP >= tsl && !tslHitPositions.has(tsym)) {
            // Hit TSL for short positions
            console.log(`TSL hit for ${tsym}: LTP ${currentLTP}, TSL ${tsl}`);
            placeOrderForPosition('B', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
            removeStoploss(position);
            toastMessage.value = 'Trailing Stoploss hit for ' + tsym;
            showToast.value = true;
            tslHitPositions.add(tsym); // Mark TSL as hit
          }
        }
      }
    }
  }
};
const checkStoplossesAndTargets = () => {
  checkStoplosses();
  checkTargets();
};




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

// Watchers
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
// Watch for the price values
watch([niftyPrice, bankNiftyPrice, finniftyPrice, midcpniftyPrice, sensexPrice, bankexPrice], () => {
  if (selectedExpiry.value) {
    updateStrikesForExpiry(selectedExpiry.value);
  }
});
watch(selectedLots, () => {
  updateSelectedQuantity();
});
watch(flatTradePositionBook, () => {
  updatePositionSecurityIds();
  subscribeToOptions();
}, { deep: true });
watch(shoonyaPositionBook, () => {
  updatePositionSecurityIds();
  subscribeToOptions();
}, { deep: true });
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
  // await fetchTradingData();
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
      if (selectedBroker.value?.brokerName === 'PaperTrading') {
        setPaperTradingCredentials();
      }
    }
  },
  { deep: true }
);
// Modify the watcher for selectedMasterSymbol
watch(selectedMasterSymbol, (newValue, oldValue) => {
  saveUserChoice();
  updateAvailableQuantities();
  updateSelectedQuantity();

  updateSymbolData(newValue);

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
// Modify the existing watcher for positionLTPs
watch(positionLTPs, (newLTPs, oldLTPs) => {
  Object.entries(newLTPs).forEach(([tsym, ltp]) => {
    if (ltp !== oldLTPs[tsym]) {
      // console.log(`LTP changed for ${tsym}: ${oldLTPs[tsym]} -> ${ltp}`);
      const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
        .find(p => (p.tsym || p.tradingSymbol) === tsym);
      if (position) {
        // console.log(`Found position for ${tsym}:`, position);
        // Check stoplosses and targets immediately when LTP changes
        checkStoplossesAndTargets();
      }
    }
  });
}, { deep: true });
watch([callStrikeOffset, putStrikeOffset], () => {
  saveOffsets();
  updateStrikesForExpiry(selectedExpiry.value, true);
});
watch(selectedExpiry, (newExpiry) => {
  updateStrikesForExpiry(newExpiry, true);
});
watch(expiryOffset, (newValue) => {
  saveExpiryOffset();
  setDefaultExpiry();
});
// Watch for changes to showLTPRangeBar and save to localStorage
watch(showLTPRangeBar, (newValue) => {
  localStorage.setItem('showLTPRangeBar', JSON.stringify(newValue));
});
// Watch for changes to showOHLCValues and save to localStorage
watch(showOHLCValues, (newValue) => {
  localStorage.setItem('showOHLCValues', JSON.stringify(newValue));
});
watch(showStrikeDetails, (newValue) => {
  localStorage.setItem('showStrikeDetails', JSON.stringify(newValue));
});
// Watch for changes and update localStorage
watch([masterOpenPrice, masterHighPrice, masterLowPrice, masterClosePrice],
  ([open, high, low, close]) => {
    localStorage.setItem('masterOpenPrice', open);
    localStorage.setItem('masterHighPrice', high);
    localStorage.setItem('masterLowPrice', low);
    localStorage.setItem('masterClosePrice', close);
  }
);

watch([callOpenPrice, callHighPrice, callLowPrice, callClosePrice],
  ([open, high, low, close]) => {
    localStorage.setItem('callOpenPrice', open);
    localStorage.setItem('callHighPrice', high);
    localStorage.setItem('callLowPrice', low);
    localStorage.setItem('callClosePrice', close);
  }
);

watch([putOpenPrice, putHighPrice, putLowPrice, putClosePrice],
  ([open, high, low, close]) => {
    localStorage.setItem('putOpenPrice', open);
    localStorage.setItem('putHighPrice', high);
    localStorage.setItem('putLowPrice', low);
    localStorage.setItem('putClosePrice', close);
  }
);
// Add this in your component's setup or mounted hook
watch([selectedMasterSymbol, masterLowPrice, masterHighPrice, niftyPrice, bankNiftyPrice, finniftyPrice, midcpniftyPrice, sensexPrice, bankexPrice], () => {
  // console.log('Master Symbol:', selectedMasterSymbol.value);
  // console.log('Low:', masterLowPrice.value);
  // console.log('High:', masterHighPrice.value);
  // console.log('LTP:', getMasterSymbolPrice());
  // console.log('Range Width:', ltpRangeWidth.value);
  // console.log('Marker Position:', ltpMarkerPosition.value);
});
watch(additionalSymbols, (newValue) => {
  localStorage.setItem('additionalSymbols', JSON.stringify(newValue));
  if (newValue) {
    subscribeToOptions();
  } else {
    unsubscribeFromAdditionalStrikes();
    additionalStrikeLTPs.value = { call: {}, put: {} };
  }
});
watch(selectedSound, (newValue) => {
  localStorage.setItem('selectedSound', newValue);
  if (notificationSound.value) {
    const audio = new Audio(`/${newValue}`);
    audio.play();
  }
  showToastNotification(`Sound changed to ${newValue.replace('.mp3', '')}`);
});
watch(totalRiskTargetToggle, (newValue) => {
  localStorage.setItem('totalRiskTargetToggle', JSON.stringify(newValue));
});

watch(totalRiskTargetType, (newValue) => {
  localStorage.setItem('totalRiskTargetType', newValue);
});

watch(totalRiskAmount, (newValue) => {
  localStorage.setItem('totalRiskAmount', newValue.toString());
});

watch(totalRiskPercentage, (newValue) => {
  localStorage.setItem('totalRiskPercentage', newValue.toString());
});

watch(totalTargetAmount, (newValue) => {
  localStorage.setItem('totalTargetAmount', newValue.toString());
});

watch(totalTargetPercentage, (newValue) => {
  localStorage.setItem('totalTargetPercentage', newValue.toString());
});
// Add a watch effect to handle the countdown when risk is reached
watch(riskReached, async (newValue) => {
  if (newValue && closePositionsRisk.value) {
    console.log('Risk threshold reached. Taking action.');
    if (riskAction.value === 'close') {
      await closeAllPositions();
      showToastNotification('All positions closed due to risk threshold');
    } else if (riskAction.value === 'killSwitch') {
      await toggleKillSwitch();
    }
  }
});
watch(targetReached, async (newValue) => {
  if (newValue && closePositionsTarget.value) {
    console.log('Target reached. Taking action.');
    if (targetAction.value === 'close') {
      await closeAllPositions();
      showToastNotification('All positions closed due to target reached');
    } else if (targetAction.value === 'killSwitch') {
      await toggleKillSwitch();
    }
  }
});
watch(closePositionsRisk, (newValue) => {
  localStorage.setItem('closePositionsRisk', JSON.stringify(newValue));
});

watch(closePositionsTarget, (newValue) => {
  localStorage.setItem('closePositionsTarget', JSON.stringify(newValue));
});

watch(riskAction, (newValue) => {
  localStorage.setItem('riskAction', newValue);
});

watch(targetAction, (newValue) => {
  localStorage.setItem('targetAction', newValue);
});
watch([totalBuyValue, totalSellValue, availableBalance], async () => {
  await fetchFundLimit();
  checkOvertradeProtection();
});
watch(experimentalFeatures, (newValue) => {
  localStorage.setItem('ExperimentalFeatures', JSON.stringify(newValue));
});
</script>
