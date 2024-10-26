<template>
  <AppNavigationComponent />
  <section class="row py-3">
    <div class="row m-0">
      <div class="col-12 border rounded p-3 bg-color-2">
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
      <div class="col-12 border rounded p-3 bg-color-2">
        <h6 class="mb-0">Risk Management Settings</h6>
        <div class="row">
          <!-- Overtrade Protection (Auto-Kill Switch) -->
          <div class="col-12 col-md-6 col-lg-4 mt-3">
            <label for="overtradeProtection" class="form-label">
              Overtrade Protection (Auto-Kill Switch)
            </label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="overtradeProtection" :checked="overtradeProtection"
                @change="toggleOvertradeProtection" />
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
            <label for="" class="form-label mt-2">Max Risk & Target Warning</label>
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
                <input type="number" min="0.1" max="5" step="0.1" class="form-control" v-model="totalRiskPercentage"
                  placeholder="Enter risk percentage" />
                <span class="input-group-text">%</span>
              </template>
            </div>
            <!-- Close Positions if Risk is reached -->
            <label for="closePositionsRisk" class="form-label mt-2">Action if Max Risk is reached</label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="closePositionsRisk" v-model="closePositionsRisk" />
              <label class="form-check-label" for="closePositionsRisk">
                {{ closePositionsRisk ? 'Enabled' : 'Disabled' }}
              </label>
            </div>
            <div v-if="closePositionsRisk" class="mt-2">
              <div class="form-check">
                <input class="form-check-input" type="radio" id="riskActionClose" value="close" v-model="riskAction" />
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
                <input type="number" min="0.1" max="5" step="0.1" class="form-control" v-model="totalTargetPercentage"
                  placeholder="Enter target %" />
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
      <div class="col-12 rounded border p-3 bg-color-2">
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
              <input class="form-check-input" type="checkbox" id="showStrikeDetails" v-model="showStrikeDetails" />
              <label class="form-check-label" for="showStrikeDetails">
                {{ showStrikeDetails ? 'Enabled' : 'Disabled' }}
              </label>
            </div>
            <small class="text-muted">For development purposes only</small>
          </div>
          <!-- Notification Sound -->
          <div class="col-12 col-md-6 col-lg-4 mt-3">
            <label for="notificationSound" class="form-label">Notification Sound</label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="notificationSound" v-model="notificationSound"
                @change="toggleNotificationSound" />
              <label class="form-check-label" for="notificationSound">
                {{ notificationSound ? 'Enabled' : 'Disabled' }}
              </label>
            </div>
          </div>
          <!-- Market Depth Toggle -->
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
          <!-- Enable / Disable Sticky MTM -->
          <div class="col-12 col-md-6 col-lg-4 mt-3">
            <label for="stickyMTM" class="form-label">Sticky MTM Section</label>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="stickyMTM" v-model="stickyMTM" />
              <label class="form-check-label" for="stickyMTM">
                {{ stickyMTM ? 'Enabled' : 'Disabled' }}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 pt-5 text-center">
      <p class="text-secondary">These settings are automatically saved.</p>
    </div>
  </section>
</template>

<script setup>
import AppNavigationComponent from '@/components/AppNavigationComponent.vue'
import { useAppSettings } from '@/composables/useAppSettings'

// Import global state
import {
  // UI Settings
  showLTPRangeBar,
  showOHLCValues,
  showStrikeDetails,
  stickyMTM,

  // Trading Settings
  callStrikeOffset,
  putStrikeOffset,
  expiryOffset,
  overtradeProtection,

  // Feature Settings
  marketDepth,

  // Notification Settings
  notificationSound,

  // Risk Management Settings
  totalRiskTargetToggle,
  totalRiskTargetType,
  totalRiskAmount,
  totalRiskPercentage,
  totalTargetAmount,
  totalTargetPercentage,
  closePositionsRisk,
  closePositionsTarget,
  riskAction,
  targetAction
} from '@/stores/globalStore'

const {
  toggleLTPRangeBar,
  toggleOHLCValues,
  toggleStrikeDetails,
  toggleStickyMTM,
  saveOffsets,
  toggleOvertradeProtection,
  toggleMarketDepth,
} = useAppSettings()
</script>
