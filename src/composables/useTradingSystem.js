import { ref, computed, watch } from 'vue'
import * as globalState from '@/stores/globalStore'
import axios from 'axios'
import qs from 'qs'
import { debounce } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { validateToken, getBrokerStatus, tokenStatus } from '@/composables/useBrokerTokenValidator'

// Global State
import {
  BASE_URL,
  killSwitchActive,
  selectedCallStrike,
  selectedPutStrike,
  quantities,
  selectedMasterSymbol,
  selectedQuantity,
  selectedOrderType,
  selectedBroker,
  toastMessage,
  showToast,
  flatTradePositionBook,
  shoonyaPositionBook,
  positionSecurityIds,
  socket,
  defaultCallSecurityId,
  defaultPutSecurityId,
  additionalSymbols,
  currentSubscriptions,
  fundLimits,
  selectedExchange,
  positionLTPs,
  selectedProductType,
  limitPrice,
  selectedFlattradePositionsSet,
  selectedShoonyaPositionsSet,
  FLATTRADE_CLIENT_ID,
  FLATTRADE_API_SECRET,
  FLATTRADE_API_KEY,
  FLATTRADE_API_TOKEN,
  SHOONYA_CLIENT_ID,
  SHOONYA_API_TOKEN,
  SHOONYA_API_KEY,
  flatOrderBook,
  flatTradeBook,
  shoonyaOrderBook,
  shoonyaTradeBook,
  enableHotKeys,
  additionalStrikeLTPs,
  ltpCallbacks,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  selectedBrokerName,
  activeTab,
  selectedExpiry,
  callStrikeOffset,
  putStrikeOffset,
  expiryOffset,
  showLTPRangeBar,
  showOHLCValues,
  masterOpenPrice,
  masterHighPrice,
  masterLowPrice,
  masterClosePrice,
  showStrikeDetails,
  callOpenPrice,
  callHighPrice,
  callLowPrice,
  callClosePrice,
  putOpenPrice,
  putHighPrice,
  putLowPrice,
  putClosePrice,
  selectedSound,
  totalRiskTargetToggle,
  totalRiskTargetType,
  totalRiskAmount,
  totalRiskPercentage,
  totalTargetAmount,
  totalTargetPercentage,
  closePositionsRisk,
  closePositionsTarget,
  riskAction,
  targetAction,
  experimentalFeatures,
  flattradeReqCode,
  stickyMTM,
  overtradeProtection,
  exchangeSymbols,
  expiryDates,
  dataFetched,
  selectedStrike,
  modalTransactionType,
  modalOptionType,
  latestCallLTP,
  latestPutLTP,
  activeFetchFunction,
  reverseMode,
  showBasketOrderModal,
  marketDepth,
  notificationSound,
  savedBaskets,
  basketName,
  editingBasketId,
  basketOrders,
  strategyType,
  strategies,
  limitOffset,
  callDepth,
  putDepth,
  symbolData,
  allSymbolsData,
  shoonyaBrokerUserId,
  shoonyaBrokerPassword,
  shoonyaOneTimePassword,
  errorMessage,
  statusMessage,
  userTriggeredTokenGeneration,
  callStrikes,
  putStrikes
} from '@/stores/globalStore'

// Kill Switch Composables
import { toggleKillSwitch } from '@/composables/useKillSwitch'

// Order Management Composables
import {
  prepareOrderPayload,
  placeOrder,
  placeOrderForPosition,
  closeAllPositions,
  cancelPendingOrders
} from '@/composables/useOrderManagement'

// Broker Selection Composables
import {
  brokerStatus,
  updateSelectedBroker,
  setFlattradeCredentials,
  setShoonyaCredentials
} from '@/composables/useBrokerFunctions'

// Trade Configuration Composables
import {
  getExchangeSegment,
  selectedLots,
  getProductTypeValue,
  getTransactionType,
  productTypes,
  updateAvailableQuantities,
  orderTypes,
  updateSelectedQuantity,
  updateStrikesForExpiry,
  synchronizeCallStrikes,
  synchronizePutStrikes
} from '@/composables/useTradeConfiguration'

// Portfolio Management Composables
import {
  updateOrdersAndPositions,
  fetchFlattradeOrdersTradesBook,
  fetchShoonyaOrdersTradesBook,
  fetchFlattradePositions,
  fetchShoonyaPositions,
  updatePositionSecurityIds,
  subscribeToPositionLTPs,
  subscribeToOptions,
  updateFundLimits,
  fetchFundLimit
} from '@/composables/usePortfolioManagement'

// Real Time LTP Data Composables
import { getMasterSymbolPrice, subscribeToLTP } from '@/composables/useMarketData'

export function useTradeView() {
  const isFormDisabled = computed(() => killSwitchActive.value)

  const exchangeOptions = computed(() => {
    return Object.keys(exchangeSymbols.value).filter((key) => key !== 'symbolData')
  })
  const todayExpirySymbol = computed(() => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

    for (const [symbol, data] of Object.entries(symbolData)) {
      if (data.expiryDay === dayOfWeek) {
        return symbol
      }
    }

    return null // No expiry today
  })

  const maxLots = computed(() => {
    const instrument = quantities.value[selectedMasterSymbol.value]
    return instrument ? instrument.maxLots : 280
  })
  const combinedOrdersAndTrades = computed(() => {
    const combined = {}

    if (selectedBroker.value?.brokerName === 'Flattrade') {
      // Process Flattrade orders and trades
      if (Array.isArray(flatOrderBook.value)) {
        flatOrderBook.value.forEach((order) => {
          combined[order.norenordno] = { order, trade: null }
        })
      }

      if (Array.isArray(flatTradeBook.value)) {
        flatTradeBook.value.forEach((trade) => {
          if (combined[trade.norenordno]) {
            combined[trade.norenordno].trade = trade
          } else {
            combined[trade.norenordno] = { order: null, trade }
          }
        })
      }
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      // Process Shoonya orders and trades
      if (Array.isArray(shoonyaOrderBook.value)) {
        shoonyaOrderBook.value.forEach((order) => {
          combined[order.norenordno] = { order, trade: null }
        })
      }

      if (Array.isArray(shoonyaTradeBook.value)) {
        shoonyaTradeBook.value.forEach((trade) => {
          if (combined[trade.norenordno]) {
            combined[trade.norenordno].trade = trade
          } else {
            combined[trade.norenordno] = { order: null, trade }
          }
        })
      }
    }

    return Object.values(combined).sort((a, b) => {
      const aTime = a.order?.norentm || a.trade?.norentm
      const bTime = b.order?.norentm || b.trade?.norentm
      return new Date(bTime) - new Date(aTime) // Sort in descending order (most recent first)
    })
  })

  const previousOrderType = ref(orderTypes.value[0])

  const availableBalance = computed(() => {
    // console.log('Fund Limits:', fundLimits.value);
    // console.log('Selected Broker:', selectedBroker.value?.brokerName);

    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya'
    ) {
      const cash = Number(fundLimits.value.cash) || 0
      const payin = Number(fundLimits.value.payin) || 0
      const marginUsed = Number(fundLimits.value.marginused) || 0

      // Use payin if cash is zero, otherwise use cash
      const availableFunds = cash + payin

      const balance = availableFunds - marginUsed
      // console.log(`${selectedBroker.value?.brokerName} Available Balance:`, balance);
      return balance
    }
    return null
  })
  const usedAmount = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const marginUsed = Number(fundLimits.value.marginused) || 0
      return marginUsed
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const marginUsed = Number(fundLimits.value.marginused) || 0
      return marginUsed
    }
    return 0
  })
  const formattedDate = computed(() => {
    const today = new Date()
    const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }
    return today.toLocaleDateString('en-US', options).replace(/,/g, '')
  })
  const totalNetQty = computed(() => {
    const calculateTotalQty = (positions) => {
      return positions.reduce((total, position) => {
        const qty = Math.abs(parseInt(position.netQty || position.netqty, 10))
        return total + qty
      }, 0)
    }

    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return calculateTotalQty(flatTradePositionBook.value)
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return calculateTotalQty(shoonyaPositionBook.value)
    }
    return 0
  })
  const totalProfit = computed(() => {
    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya'
    ) {
      return positionsWithCalculatedProfit.value.reduce((acc, position) => {
        const unrealizedProfit = position.calculatedUrmtom
        const realizedProfit = parseFloat(position.rpnl) || 0
        return acc + unrealizedProfit + realizedProfit
      }, 0)
    }
    return 0
  })
  const positionsWithCalculatedProfit = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value.map((position) => ({
        ...position,
        calculatedUrmtom: calculateUnrealizedProfit(position)
      }))
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value.map((position) => ({
        ...position,
        calculatedUrmtom: calculateUnrealizedProfit(position)
      }))
    }
    return []
  })
  const totalCapitalPercentage = computed(() => {
    const totalMoney = Number(availableBalance.value) + Number(usedAmount.value)
    return totalMoney ? (Number(totalProfit.value) / totalMoney) * 100 : 0
  })
  const totalBrokerage = computed(() => {
    let total = 0

    // Calculate totalValue based on totalBuyValue and totalSellValue
    const totalEquityValue = totalEquityBuyValue.value + totalEquitySellValue.value
    const totalDerivativeValue = totalDerivativeBuyValue.value + totalDerivativeSellValue.value

    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya'
    ) {
      // Calculate charges for Flattrade and Shoonya (they have the same structure)
      const equityExchangeCharge = Math.round(totalEquityValue * 0.00003485 * 100) / 100 //avage price from both exchange
      const equityIpftCharge = Math.round(totalEquityValue * 0.000001 * 100) / 100
      const equitySebiCharge = Math.round(totalEquityValue * 0.000001 * 100) / 100
      const equityGstCharge =
        Math.round((equityExchangeCharge + equitySebiCharge + equityIpftCharge) * 18) / 100
      const equityStampdutyCharge = Math.round(totalEquityBuyValue.value * 0.00003)
      const equitySttCharge = Math.round(totalEquitySellValue.value * 0.00025)

      const derivativesExchangeCharge = Math.round(totalDerivativeValue * 0.000495 * 100) / 100
      const derivativesIpftCharge = Math.round(totalDerivativeValue * 0.000005 * 100) / 100
      const derivativesSebiCharge = Math.round(totalDerivativeValue * 0.000001 * 100) / 100
      const derivativesGstCharge =
        Math.round(
          (derivativesExchangeCharge + derivativesIpftCharge + derivativesSebiCharge) * 18
        ) / 100
      const derivativesStampdutyCharge = Math.round(totalDerivativeBuyValue.value * 0.00003)
      const derivativesSttCharge = Math.round(totalDerivativeSellValue.value * 0.000625)

      // Add charges to total for Flattrade and Shoonya
      total +=
        equityExchangeCharge +
        equityIpftCharge +
        equitySebiCharge +
        equityGstCharge +
        equityStampdutyCharge +
        equitySttCharge +
        derivativesExchangeCharge +
        derivativesIpftCharge +
        derivativesSebiCharge +
        derivativesGstCharge +
        derivativesStampdutyCharge +
        derivativesSttCharge

      // No additional brokerage for Flattrade and Shoonya
    }

    return total
  })
  const netPnl = computed(() => totalProfit.value - totalBrokerage.value)
  const totalBuyValue = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value.reduce(
        (total, position) => total + parseFloat(position.daybuyamt || 0),
        0
      )
    }
    if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value.reduce(
        (total, position) => total + parseFloat(position.daybuyamt || 0),
        0
      )
    }
    return 0
  })
  const totalSellValue = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value.reduce(
        (total, position) => total + parseFloat(position.daysellamt || 0),
        0
      )
    }
    if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value.reduce(
        (total, position) => total + parseFloat(position.daysellamt || 0),
        0
      )
    }
    return 0
  })
  const totalEquityBuyValue = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value
        .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
        .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value
        .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
        .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
    }
    return 0
  })
  const totalEquitySellValue = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value
        .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
        .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value
        .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
        .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
    }
    return 0
  })
  const totalDerivativeBuyValue = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value
        .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
        .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value
        .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
        .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
    }
    return 0
  })
  const totalDerivativeSellValue = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value
        .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
        .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value
        .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
        .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
    }
    return 0
  })
  const ltpRangeWidth = computed(() => {
    const low = parseFloat(masterLowPrice.value)
    const high = parseFloat(masterHighPrice.value)
    const ltp = getMasterSymbolPrice() // New helper function

    if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
      return 0
    }

    return ((ltp - low) / (high - low)) * 100
  })
  const ltpMarkerPosition = computed(() => {
    const low = parseFloat(masterLowPrice.value)
    const high = parseFloat(masterHighPrice.value)
    const ltp = getMasterSymbolPrice() // New helper function

    if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
      return 0
    }

    return ((ltp - low) / (high - low)) * 100
  })
  // Computed Properties for LTP Range Bar for Call Strike
  const callLtpRangeWidth = computed(() => {
    const low = parseFloat(callLowPrice.value)
    const high = parseFloat(callHighPrice.value)
    const ltp = parseFloat(latestCallLTP.value)

    if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
      return 0
    }

    return ((ltp - low) / (high - low)) * 100
  })
  const callLtpMarkerPosition = computed(() => {
    const low = parseFloat(callLowPrice.value)
    const high = parseFloat(callHighPrice.value)
    const ltp = parseFloat(latestCallLTP.value) // Use the appropriate LTP value

    if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
      return 0
    }

    return ((ltp - low) / (high - low)) * 100
  })
  // Computed Properties for LTP Range Bar for Put Strike
  const putLtpRangeWidth = computed(() => {
    const low = parseFloat(putLowPrice.value)
    const high = parseFloat(putHighPrice.value)
    const ltp = parseFloat(latestPutLTP.value)

    if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
      return 0
    }

    return ((ltp - low) / (high - low)) * 100
  })
  const putLtpMarkerPosition = computed(() => {
    const low = parseFloat(putLowPrice.value)
    const high = parseFloat(putHighPrice.value)
    const ltp = parseFloat(latestPutLTP.value) // Use the appropriate LTP value

    if (isNaN(low) || isNaN(high) || isNaN(ltp) || high === low) {
      return 0
    }

    return ((ltp - low) / (high - low)) * 100
  })
  // Computed Properties for LTP Range Bar for Live Underlying Price
  const openMarkerPosition = computed(() => {
    const low = parseFloat(masterLowPrice.value)
    const high = parseFloat(masterHighPrice.value)
    const open = parseFloat(masterOpenPrice.value)

    if (isNaN(low) || isNaN(high) || isNaN(open) || high === low) {
      return 0
    }

    return ((open - low) / (high - low)) * 100
  })
  // Computed Properties for LTP Range Bar for Call Strike
  const callOpenMarkerPosition = computed(() => {
    const low = parseFloat(callLowPrice.value)
    const high = parseFloat(callHighPrice.value)
    const open = parseFloat(callOpenPrice.value)

    if (isNaN(low) || isNaN(high) || isNaN(open) || high === low) {
      return 0
    }

    return ((open - low) / (high - low)) * 100
  })
  // Computed Properties for LTP Range Bar for Put Strike
  const putOpenMarkerPosition = computed(() => {
    const low = parseFloat(putLowPrice.value)
    const high = parseFloat(putHighPrice.value)
    const open = parseFloat(putOpenPrice.value)

    if (isNaN(low) || isNaN(high) || isNaN(open) || high === low) {
      return 0
    }

    return ((open - low) / (high - low)) * 100
  })
  const riskReached = computed(() => {
    if (totalRiskTargetToggle.value) {
      if (totalRiskTargetType.value === 'amount' && totalRiskAmount.value > 0) {
        return totalProfit.value <= -totalRiskAmount.value
      } else if (totalRiskTargetType.value === 'percentage' && totalRiskPercentage.value > 0) {
        return totalCapitalPercentage.value <= -totalRiskPercentage.value
      }
    }
    return false
  })
  const targetReached = computed(() => {
    if (totalRiskTargetToggle.value) {
      if (totalRiskTargetType.value === 'amount' && totalTargetAmount.value > 0) {
        return totalProfit.value >= totalTargetAmount.value
      } else if (totalRiskTargetType.value === 'percentage' && totalTargetPercentage.value > 0) {
        return totalCapitalPercentage.value >= totalTargetPercentage.value
      }
    }
    return false
  })
  const sortedBasketOrders = computed(() => {
    return [...basketOrders.value].sort((a, b) => {
      if (a.transactionType === 'B' && b.transactionType !== 'B') return -1
      if (a.transactionType !== 'B' && b.transactionType === 'B') return 1
      return 0
    })
  })

  const availableStrikes = computed(() => {
    const allStrikes = new Set([
      ...callStrikes.value.map((strike) => strike.strikePrice),
      ...putStrikes.value.map((strike) => strike.strikePrice)
    ])
    return Array.from(allStrikes).sort((a, b) => a - b)
  })
  const basketLTPs = computed(() => {
    const ltps = {}
    basketOrders.value.forEach((order) => {
      ltps[order.id] = positionLTPs.value[order.tradingSymbol] || 'N/A'
    })
    return ltps
  })
  const filteredStrategies = computed(() => {
    return strategies.value.filter((strategy) => strategy.type === strategyType.value)
  })
  const isValidLimitPrice = computed(() => {
    return limitPrice.value > 0 && limitPrice.value !== ''
  })
  const limitPriceErrorMessage = computed(() => {
    if (limitPrice.value === '') {
      return 'Limit price is required.'
    } else if (limitPrice.value <= 0) {
      return 'Enter a limit price.'
    }
    return ''
  })
  const isOffsetOrderType = computed(() => {
    const isOffset = selectedOrderType.value === 'LMT_OFFSET'
    console.log('Is Offset Order Type:', isOffset, 'Selected Order Type:', selectedOrderType.value)
    return isOffset
  })
  const isCallDepthAvailable = computed(() => {
    return (
      callDepth.value.bp1 !== null &&
      callDepth.value.bq1 !== null &&
      callDepth.value.sp1 !== null &&
      callDepth.value.sq1 !== null
    )
  })

  const isPutDepthAvailable = computed(() => {
    return (
      putDepth.value.bp1 !== null &&
      putDepth.value.bq1 !== null &&
      putDepth.value.sp1 !== null &&
      putDepth.value.sq1 !== null
    )
  })
  const brokers = computed(() => {
    const brokersArray = []

    if (FLATTRADE_CLIENT_ID.value && FLATTRADE_API_KEY.value && FLATTRADE_API_SECRET.value) {
      brokersArray.push({
        id: 'Flattrade',
        brokerName: 'Flattrade',
        brokerClientId: FLATTRADE_CLIENT_ID.value,
        apiKey: FLATTRADE_API_KEY.value,
        apiSecret: FLATTRADE_API_SECRET.value,
        apiToken: FLATTRADE_API_TOKEN.value
      })
    }

    if (SHOONYA_CLIENT_ID.value && SHOONYA_API_KEY.value) {
      brokersArray.push({
        id: 'Shoonya',
        brokerName: 'Shoonya',
        brokerClientId: SHOONYA_CLIENT_ID.value,
        apiKey: SHOONYA_API_KEY.value,
        apiToken: SHOONYA_API_TOKEN.value
      })
    }

    return brokersArray
  })
  // ... (add all other computed properties here)

  // Methods
  const updateToastVisibility = (value) => {
    showToast.value = value
  }
  const setActiveTab = (tab) => {
    activeTab.value = tab
  }

  const toggleOvertradeProtection = () => {
    overtradeProtection.value = !overtradeProtection.value
    localStorage.setItem('OvertradeProtection', overtradeProtection.value.toString())
  }
  const toggleExperimentalFeatures = () => {
    experimentalFeatures.value = !experimentalFeatures.value
    localStorage.setItem('ExperimentalFeatures', JSON.stringify(experimentalFeatures.value))
  }
  const checkOvertradeProtection = () => {
    if (!overtradeProtection.value) return

    const totalValue = Math.max(totalBuyValue.value, totalSellValue.value)
    const totalAvailableBalance = availableBalance.value + usedAmount.value

    if (totalValue > totalAvailableBalance) {
      if (!killSwitchActive.value) {
        toastMessage.value = `Overtrade protection activated. Total value: ₹${totalValue.toFixed(2)} exceeds available balance: ₹${availableBalance.value.toFixed(2)}`
        showToast.value = true
        toggleKillSwitch()
      }
    }
  }

  const updateExchangeSymbols = () => {
    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya'
    ) {
      exchangeSymbols.value = {
        NFO: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'],
        BFO: ['SENSEX', 'BANKEX']
      }
    }

    // Store symbolData in exchangeSymbols
    exchangeSymbols.value.symbolData = symbolData
  }
  const setDefaultExchangeAndMasterSymbol = () => {
    const cachedData = JSON.parse(localStorage.getItem('cachedTradingData')) || {}

    // Set the exchange
    const savedExchange = cachedData.selectedExchange || localStorage.getItem('selectedExchange')
    if (savedExchange && exchangeOptions.value.includes(savedExchange)) {
      selectedExchange.value = savedExchange
    } else if (exchangeOptions.value.length > 0) {
      selectedExchange.value = exchangeOptions.value[0]
    }

    // Set the master symbol
    const savedMasterSymbol =
      cachedData.selectedMasterSymbol || localStorage.getItem('selectedMasterSymbol')
    if (
      savedMasterSymbol &&
      exchangeSymbols.value[selectedExchange.value]?.includes(savedMasterSymbol)
    ) {
      selectedMasterSymbol.value = savedMasterSymbol
    } else if (exchangeSymbols.value[selectedExchange.value]?.length > 0) {
      selectedMasterSymbol.value = exchangeSymbols.value[selectedExchange.value][0]
    }

    // If we have cached data for the selected symbol, populate allSymbolsData
    if (cachedData[selectedMasterSymbol.value]) {
      allSymbolsData[selectedMasterSymbol.value] = cachedData[selectedMasterSymbol.value]
    }
  }

  const saveUserChoice = () => {
    localStorage.setItem('selectedExchange', selectedExchange.value)
    localStorage.setItem('selectedMasterSymbol', selectedMasterSymbol.value)
  }
  const getInitialPrice = (symbol) => {
    const strike = callStrikes.value.find(
      (s) => s.tradingSymbol.includes(symbol) && /C\d+$/.test(s.tradingSymbol)
    )
    return strike ? parseFloat(strike.strikePrice) : null
  }
  const fetchTradingData = async () => {
    const masterSymbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX']

    for (const symbol of masterSymbols) {
      try {
        let exchangeSymbol

        // Set the correct exchange symbol
        if (['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'].includes(symbol)) {
          exchangeSymbol = 'NFO'
        } else if (['SENSEX', 'BANKEX'].includes(symbol)) {
          exchangeSymbol = 'BFO'
        } else {
          throw new Error(`Unknown symbol: ${symbol}`)
        }

        let response
        if (selectedBroker.value?.brokerName === 'Flattrade') {
          response = await fetch(
            `${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`
          )
        } else if (selectedBroker.value?.brokerName === 'Shoonya') {
          response = await fetch(
            `${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`
          )
        } else {
          throw new Error('Unsupported broker')
        }

        const data = await response.json()

        allSymbolsData[symbol] = {
          expiryDates: data.expiryDates || [],
          callStrikes: Array.isArray(data.callStrikes)
            ? data.callStrikes
                .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
                .map((strike) => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }))
            : [],
          putStrikes: Array.isArray(data.putStrikes)
            ? data.putStrikes
                .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
                .map((strike) => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }))
            : []
        }

        // Set initial price for each symbol
        const priceKey = `${symbol.toLowerCase()}Price`
        if (priceKey in window && window[priceKey].value === 'N/A') {
          window[priceKey].value = getInitialPrice(symbol)
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
        allSymbolsData[symbol] = { expiryDates: [], callStrikes: [], putStrikes: [] }
      }
    }

    // Update the reactive properties for the currently selected symbol
    updateSymbolData(selectedMasterSymbol.value)

    updateStrikesForExpiry(selectedExpiry.value)
    dataFetched.value = true

    // Cache the fetched data
    localStorage.setItem('cachedTradingData', JSON.stringify(allSymbolsData))
  }
  const updateSymbolData = (symbol) => {
    if (allSymbolsData[symbol]) {
      expiryDates.value = allSymbolsData[symbol].expiryDates
      callStrikes.value = allSymbolsData[symbol].callStrikes
      putStrikes.value = allSymbolsData[symbol].putStrikes
    } else {
      console.error(`No data found for ${symbol}`)
    }
  }

  const convertToComparableDate = (dateString) => {
    const date = new Date(dateString)
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('en-US', options).replace(/,/g, '')
  }

  const saveOffsets = () => {
    localStorage.setItem('callStrikeOffset', callStrikeOffset.value)
    localStorage.setItem('putStrikeOffset', putStrikeOffset.value)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''

    const [time] = timeString.split(' ')
    const [hours, minutes, seconds] = time.split(':')

    let formattedHours = parseInt(hours, 10)
    const ampm = formattedHours >= 12 ? 'PM' : 'AM'
    formattedHours = formattedHours % 12 || 12

    const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`
    return `${formattedTime}`
  }

  const setOrderDetails = (transactionType, optionType) => {
    modalTransactionType.value = getTransactionType(transactionType) // Use getTransactionType to set modalTransactionType
    modalOptionType.value = optionType
    selectedOrderType.value = orderTypes.value[1] // Set selectedOrderType to LIMIT or LMT based on broker
    selectedStrike.value =
      optionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value
  }
  const handleOrderClick = async (transactionType, optionType) => {
    modalTransactionType.value = transactionType
    modalOptionType.value = optionType

    // Set the correct strike based on the option type
    if (optionType === 'CALL') {
      selectedStrike.value = selectedCallStrike.value
    } else if (optionType === 'PUT') {
      selectedStrike.value = selectedPutStrike.value
    }

    // If it's a limit order type, the modal will be shown automatically due to data-bs-toggle and data-bs-target
    if (['LMT', 'LMT_LTP', 'LMT_OFFSET', 'MKT_PROTECTION'].includes(selectedOrderType.value)) {
      // Set initial limit price based on the order type
      handleOrderTypeChange()
    } else {
      // For market orders, place the order directly
      await placeOrder(transactionType, optionType)
    }
  }
  const resetOrderTypeIfNeeded = () => {
    if (previousOrderType.value === orderTypes.value[0]) {
      // Check if previousOrderType is MARKET or MKT
      resetOrderType()
    }
  }

  const resetOrderType = () => {
    selectedOrderType.value = orderTypes.value[0] // Set selectedOrderType to MARKET or MKT based on broker
  }

  const setStrategyType = (type) => {
    strategyType.value = type
  }
  const loadStrategy = (strategy) => {
    // Clear existing basket orders
    basketOrders.value = []

    // Implement the logic for each strategy
    switch (strategy.name) {
      case 'Short Straddle':
        addToBasket('SELL', 'CALL')
        addToBasket('SELL', 'PUT')
        break
      case 'Iron Butterfly':
        addToBasket('BUY', 'PUT', -1)
        addToBasket('SELL', 'PUT')
        addToBasket('SELL', 'CALL')
        addToBasket('BUY', 'CALL', 1)
        break
      case 'Short Strangle':
        addToBasket('SELL', 'PUT', -1)
        addToBasket('SELL', 'CALL', 1)
        break
      case 'Short Iron Condor':
        addToBasket('BUY', 'PUT', -2)
        addToBasket('SELL', 'PUT', -1)
        addToBasket('SELL', 'CALL', 1)
        addToBasket('BUY', 'CALL', 2)
        break
      case 'Batman':
        addToBasket('BUY', 'PUT', -2)
        addToBasket('SELL', 'PUT', -1)
        addToBasket('SELL', 'CALL')
        addToBasket('SELL', 'CALL', 1)
        addToBasket('BUY', 'CALL', 2)
        break
      case 'Double Plateau':
        addToBasket('BUY', 'PUT', -2)
        addToBasket('SELL', 'PUT', -1, 2) // Sell 2 contracts
        addToBasket('SELL', 'CALL', 1, 2) // Sell 2 contracts
        addToBasket('BUY', 'CALL', 2)
        break
      case 'Jade Lizard':
        addToBasket('SELL', 'PUT')
        addToBasket('SELL', 'CALL', 1)
        addToBasket('SELL', 'CALL', 2)
        break
      case 'Reverse Jade Lizard':
        addToBasket('SELL', 'CALL')
        addToBasket('SELL', 'PUT', -1)
        addToBasket('SELL', 'PUT', -2)
        break
      case 'Buy Put':
        addToBasket('BUY', 'PUT')
        break
      case 'Sell Call':
        addToBasket('SELL', 'CALL')
        break
      case 'Bear Call Spread':
        addToBasket('SELL', 'CALL')
        addToBasket('BUY', 'CALL', 1)
        break
      case 'Bear Put Spread':
        addToBasket('BUY', 'PUT')
        addToBasket('SELL', 'PUT', -1)
        break
      case 'Put Ratio Back Spread':
        addToBasket('SELL', 'PUT')
        addToBasket('BUY', 'PUT', -1, 2) // Buy 2 contracts
        break
      case 'Long Calendar with Puts':
        addToBasket('SELL', 'PUT', 0, 1, 'near') // Sell near-term expiry
        addToBasket('BUY', 'PUT', 0, 1, 'far') // Buy far-term expiry
        break
      case 'Bear Condor':
        addToBasket('BUY', 'PUT', -1)
        addToBasket('SELL', 'PUT')
        addToBasket('SELL', 'CALL', 1)
        addToBasket('BUY', 'CALL', 2)
        break
      case 'Bear Butterfly':
        addToBasket('BUY', 'PUT', -1)
        addToBasket('SELL', 'PUT', 0, 2) // Sell 2 contracts
        addToBasket('BUY', 'PUT', 1)
        break
      case 'Buy Call':
        addToBasket('BUY', 'CALL')
        break
      case 'Sell Put':
        addToBasket('SELL', 'PUT')
        break
      case 'Bull Call Spread':
        addToBasket('BUY', 'CALL')
        addToBasket('SELL', 'CALL', 1)
        break
      case 'Bull Put Spread':
        addToBasket('SELL', 'PUT')
        addToBasket('BUY', 'PUT', -1)
        break
      case 'Call Ratio Back Spread':
        addToBasket('SELL', 'CALL')
        addToBasket('BUY', 'CALL', 1, 2) // Buy 2 contracts
        break
      case 'Long Calendar with Calls':
        addToBasket('SELL', 'CALL', 0, 1, 'near') // Sell near-term expiry
        addToBasket('BUY', 'CALL', 0, 1, 'far') // Buy far-term expiry
        break
      case 'Bull Condor':
        addToBasket('BUY', 'CALL', -1)
        addToBasket('SELL', 'CALL')
        addToBasket('SELL', 'CALL', 1)
        addToBasket('BUY', 'CALL', 2)
        break
      case 'Bull Butterfly':
        addToBasket('BUY', 'CALL', -1)
        addToBasket('SELL', 'CALL', 0, 2) // Sell 2 contracts
        addToBasket('BUY', 'CALL', 1)
        break
      case 'Call Ratio Spread':
        addToBasket('BUY', 'CALL')
        addToBasket('SELL', 'CALL', 1, 2) // Sell 2 contracts
        break
      case 'Put Ratio Spread':
        addToBasket('BUY', 'PUT')
        addToBasket('SELL', 'PUT', -1, 2) // Sell 2 contracts
        break
      case 'Long Straddle':
        addToBasket('BUY', 'CALL')
        addToBasket('BUY', 'PUT')
        break
      case 'Long Iron Butterfly':
        addToBasket('SELL', 'PUT', -1)
        addToBasket('BUY', 'PUT')
        addToBasket('BUY', 'CALL')
        addToBasket('SELL', 'CALL', 1)
        break
      case 'Long Strangle':
        addToBasket('BUY', 'PUT', -1)
        addToBasket('BUY', 'CALL', 1)
        break
      case 'Long Iron Condor':
        addToBasket('SELL', 'PUT', -2)
        addToBasket('BUY', 'PUT', -1)
        addToBasket('BUY', 'CALL', 1)
        addToBasket('SELL', 'CALL', 2)
        break
      case 'Strip':
        addToBasket('BUY', 'PUT', 0, 2) // Buy 2 puts
        addToBasket('BUY', 'CALL')
        break
      case 'Strap':
        addToBasket('BUY', 'CALL', 0, 2) // Buy 2 calls
        addToBasket('BUY', 'PUT')
        break
      default:
        console.log('Strategy not implemented')
    }

    // Update the basket name
    basketName.value = strategy.name
  }
  const addToBasket = (transactionType, optionType, strikeOffset = 0, contracts = 1) => {
    let selectedStrike = optionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value

    // Adjust the strike based on the offset
    if (strikeOffset !== 0) {
      const strikes = optionType === 'CALL' ? callStrikes.value : putStrikes.value
      const currentIndex = strikes.findIndex(
        (strike) => strike.strikePrice === selectedStrike.strikePrice
      )
      selectedStrike = strikes[currentIndex + strikeOffset] || selectedStrike
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
    })
  }
  const updateBasketOrderQuantity = (order) => {
    const instrument = quantities.value[selectedMasterSymbol.value]
    if (instrument) {
      order.quantity = order.lots * instrument.lotSize
    }
  }
  const removeFromBasket = (id) => {
    basketOrders.value = basketOrders.value.filter((order) => order.id !== id)
  }
  const placeBasket = async (basketId) => {
    const basket = savedBaskets.value.find((b) => b.id === basketId)
    if (!basket) {
      toastMessage.value = 'Basket not found'
      showToast.value = true
      return
    }

    for (const order of basket.orders) {
      const success = await placeBasketOrder(order)
      if (!success) {
        toastMessage.value = `Failed to place order for ${order.tradingSymbol}`
        showToast.value = true
        break
      }
    }

    // Add a delay before fetching updated data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update both orders and positions
    await updateOrdersAndPositions()

    // Update fund limits
    await updateFundLimits()

    toastMessage.value = `Basket "${basket.name}" orders placed successfully`
    showToast.value = true
  }
  const placeBasketOrder = async (order) => {
    try {
      const exchangeSegment = getExchangeSegment()
      const orderData = prepareOrderPayload(
        order.transactionType,
        order.optionType,
        { tradingSymbol: order.tradingSymbol },
        exchangeSegment
      )
      orderData.qty = order.quantity.toString()
      orderData.prd = order.productType
      orderData.prctyp = order.orderType
      orderData.prc = order.orderType === 'LMT' ? order.price.toString() : '0'

      let response
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
        const payload = qs.stringify({
          ...orderData,
          uid: selectedBroker.value.clientId,
          actid: selectedBroker.value.clientId
        })
        response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
          headers: {
            Authorization: `Bearer ${FLATTRADE_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
        const payload = qs.stringify({
          ...orderData,
          uid: selectedBroker.value.clientId,
          actid: selectedBroker.value.clientId
        })
        response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
          headers: {
            Authorization: `Bearer ${SHOONYA_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      }

      console.log(`Placed basket order for ${order.tradingSymbol}`)
      console.log('Basket order placed successfully:', response.data)

      // Add a delay before fetching updated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both orders and positions
      await updateOrdersAndPositions()

      // Update fund limits
      await updateFundLimits()

      return true
    } catch (error) {
      console.error('Error placing basket order:', error)
      return false
    }
  }
  const placeAllBasketOrders = async () => {
    const executedBasket = {
      id: uuidv4(),
      name: basketName.value || `Basket ${new Date().toLocaleString()}`,
      orders: [...basketOrders.value],
      executionTime: new Date().toISOString()
    }

    for (const order of sortedBasketOrders.value) {
      const success = await placeBasketOrder(order)
      if (!success) {
        toastMessage.value = `Failed to place order for ${order.tradingSymbol}`
        showToast.value = true
        break
      }
    }

    // Add a delay before fetching updated data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update both orders and positions
    await updateOrdersAndPositions()

    // Update fund limits
    await updateFundLimits()

    savedBaskets.value.push(executedBasket)
    localStorage.setItem('savedBaskets', JSON.stringify(savedBaskets.value))

    basketOrders.value = []
    basketName.value = ''
    editingBasketId.value = null
    toastMessage.value = 'All basket orders placed successfully'
    showToast.value = true
    showBasketOrderModal.value = false
  }
  const updateTradingSymbol = (strike) => {
    if (strike.optionType === 'CALL') {
      selectedCallStrike.value = strike
      defaultCallSecurityId.value = strike.securityId || 'N/A'
    } else if (strike.optionType === 'PUT') {
      selectedPutStrike.value = strike
      defaultPutSecurityId.value = strike.securityId || 'N/A'
    }

    // Trigger a re-subscription to the new security
    subscribeToOptions()
  }

  const setReverseMode = (mode) => {
    reverseMode.value = mode
  }
  const reversePositions = async () => {
    try {
      let positionsReversed = false
      let positionsToReverse

      if (reverseMode.value === 'all') {
        positionsToReverse = [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
      } else {
        positionsToReverse = [
          ...selectedFlattradePositionsSet.value,
          ...selectedShoonyaPositionsSet.value
        ]
          .map((tsym) =>
            [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(
              (p) => p.tsym === tsym
            )
          )
          .filter(Boolean)
      }

      for (const position of positionsToReverse) {
        const netqty = Number(position.netqty)
        if (netqty !== 0) {
          // Close the current position
          const closeTransactionType = netqty > 0 ? 'S' : 'B'
          await placeOrderForPosition(
            closeTransactionType,
            position.tsym.includes('C') ? 'CALL' : 'PUT',
            position
          )

          // Open a new position in the opposite direction
          const openTransactionType = netqty > 0 ? 'B' : 'S'
          const reversedPosition = { ...position, netqty: Math.abs(netqty) } // Always use positive quantity
          await placeOrderForPosition(
            openTransactionType,
            position.tsym.includes('C') ? 'CALL' : 'PUT',
            reversedPosition
          )

          positionsReversed = true

          // Remove the reversed position from the selected positions if in 'selected' mode
          if (reverseMode.value === 'selected') {
            if (selectedBroker.value?.brokerName === 'Shoonya') {
              selectedShoonyaPositionsSet.value.delete(position.tsym)
            } else if (selectedBroker.value?.brokerName === 'Flattrade') {
              selectedFlattradePositionsSet.value.delete(position.tsym)
            }
          }
        }
      }

      // Add a delay before fetching updated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both orders and positions
      await updateOrdersAndPositions()

      // Update fund limits
      await updateFundLimits()

      if (positionsReversed) {
        toastMessage.value = `${reverseMode.value === 'all' ? 'All' : 'Selected'} positions reversed successfully`
      } else {
        toastMessage.value = `No positions to reverse`
      }
      showToast.value = true
    } catch (error) {
      console.error('Error reversing positions:', error)
      toastMessage.value = `Failed to reverse ${reverseMode.value === 'all' ? 'all' : 'selected'} positions`
      showToast.value = true
    }
  }

  const calculateUnrealizedProfit = (position) => {
    const ltp =
      positionLTPs.value[position.tsym || position.tradingSymbol] ||
      position.lp ||
      position.lastPrice
    const netQty = parseFloat(position.netqty || position.netQty)
    const netAvgPrice = parseFloat(position.netavgprc || position.averagePrice)
    const priceFactor = parseFloat(position.prcftr || position.multiplier || 1)

    if (ltp && !isNaN(netQty) && !isNaN(netAvgPrice)) {
      return netQty * (ltp - netAvgPrice) * priceFactor
    }
    return 0
  }
  const setDefaultExpiry = () => {
    if (expiryDates.value.length > 0) {
      const offsetIndex = parseInt(expiryOffset.value)
      const selectedIndex = Math.min(offsetIndex, expiryDates.value.length - 1)
      selectedExpiry.value = expiryDates.value[selectedIndex]
    }
  }
  const saveExpiryOffset = () => {
    localStorage.setItem('expiryOffset', expiryOffset.value)
  }

  const connectWebSocket = () => {
    let websocketUrl

    const isDev = import.meta.env.DEV
    const wsBaseUrl = isDev
      ? 'ws://localhost'
      : import.meta.env.VITE_BASE_URL.replace('http', 'ws').replace('https', 'wss')

    const getWebSocketUrl = (broker) => {
      if (isDev) {
        return broker === 'Flattrade' ? `${wsBaseUrl}:8765` : `${wsBaseUrl}:8766`
      } else {
        return `${wsBaseUrl}/ws/${broker.toLowerCase()}`
      }
    }

    if (
      ['Flattrade', 'Shoonya'].includes(selectedBroker.value?.brokerName) &&
      brokerStatus.value === 'Connected'
    ) {
      websocketUrl = getWebSocketUrl(selectedBroker.value.brokerName)
    } else {
      console.error('Invalid broker or broker not connected')
      return
    }

    console.log(`Attempting to connect to WebSocket at ${websocketUrl}`)

    try {
      socket.value = new WebSocket(websocketUrl)

      socket.value.onopen = (event) => {
        console.log('WebSocket connection opened:', event)
        handleWebSocketOpen(event)
      }

      socket.value.onmessage = handleWebSocketMessage

      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        handleWebSocketError(error)
      }

      socket.value.onclose = (event) => {
        console.log('WebSocket connection closed:', event)
        handleWebSocketClose(event)
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
    }
  }

  const handleWebSocketMessage = (event) => {
    const quoteData = JSON.parse(event.data)
    if (quoteData.lp) {
      updateMasterSymbolPrice(quoteData)
      updateOptionPrices(quoteData)
      updatePositionLTPs(quoteData)
      handleAdditionalStrikeLTPs(quoteData)
    }
    handleDepthFeed(quoteData)
  }

  const updateMasterSymbolPrice = (quoteData) => {
    const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value]
    if (symbolInfo && quoteData.tk === symbolInfo.exchangeSecurityId) {
      const priceMap = {
        NIFTY: niftyPrice,
        BANKNIFTY: bankNiftyPrice,
        FINNIFTY: finniftyPrice,
        MIDCPNIFTY: midcpniftyPrice,
        SENSEX: sensexPrice,
        BANKEX: bankexPrice
      }
      if (priceMap[selectedMasterSymbol.value]) {
        priceMap[selectedMasterSymbol.value].value = quoteData.lp
        updateOHLCIfNotEmpty('master', quoteData)
      }
    }
  }

  const updateOptionPrices = (quoteData) => {
    if (quoteData.tk === defaultCallSecurityId.value) {
      latestCallLTP.value = quoteData.lp
      updateOHLCIfNotEmpty('call', quoteData)
    } else if (quoteData.tk === defaultPutSecurityId.value) {
      latestPutLTP.value = quoteData.lp
      updateOHLCIfNotEmpty('put', quoteData)
    }
  }

  const updatePositionLTPs = (quoteData) => {
    const positionTsym = Object.keys(positionSecurityIds.value).find(
      (tsym) => positionSecurityIds.value[tsym] === quoteData.tk
    )
    if (positionTsym) {
      positionLTPs.value[positionTsym] = quoteData.lp
      // console.log(`Updated LTP for position ${positionTsym}: ${quoteData.lp}`)
    }
  }

  const handleAdditionalStrikeLTPs = (quoteData) => {
    if (ltpCallbacks.value[quoteData.tk]) {
      ltpCallbacks.value[quoteData.tk](quoteData)
    }
  }

  const handleDepthFeed = (quoteData) => {
    if (quoteData.tk === defaultCallSecurityId.value) {
      callDepth.value = { ...callDepth.value, ...quoteData }
    } else if (quoteData.tk === defaultPutSecurityId.value) {
      putDepth.value = { ...putDepth.value, ...quoteData }
    }
  }

  const handleWebSocketError = (error) => {
    console.error('WebSocket Error:', error)
  }

  const handleWebSocketOpen = () => {
    console.log('WebSocket connected')
    initializeSubscriptions()
  }

  const handleWebSocketClose = () => {
    console.log('WebSocket disconnected. Attempting to reconnect...')
    setTimeout(connectWebSocket, 5000)
  }
  // Helper function to update OHLC values if they are not empty
  const updateOHLCIfNotEmpty = (type, data) => {
    if (type === 'master') {
      if (data.o) masterOpenPrice.value = data.o
      if (data.h) masterHighPrice.value = data.h
      if (data.l) masterLowPrice.value = data.l
      if (data.c) masterClosePrice.value = data.c
    } else if (type === 'call') {
      if (data.o) callOpenPrice.value = data.o
      if (data.h) callHighPrice.value = data.h
      if (data.l) callLowPrice.value = data.l
      if (data.c) callClosePrice.value = data.c
    } else if (type === 'put') {
      if (data.o) putOpenPrice.value = data.o
      if (data.h) putHighPrice.value = data.h
      if (data.l) putLowPrice.value = data.l
      if (data.c) putClosePrice.value = data.c
    }
  }

  const subscribeToMasterSymbol = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value]
      if (symbolInfo) {
        const symbolToSubscribe = `${symbolInfo.exchangeCode}|${symbolInfo.exchangeSecurityId}`
        if (
          symbolToSubscribe !==
          `${currentSubscriptions.value.masterSymbolExchangeCode}|${currentSubscriptions.value.masterSymbolSecurityId}`
        ) {
          const data = {
            action: 'subscribe',
            symbols: [symbolToSubscribe]
          }
          // console.log('Sending master symbol subscribe data:', data);
          socket.value.send(JSON.stringify(data))
          currentSubscriptions.value.masterSymbol = selectedMasterSymbol.value
          currentSubscriptions.value.masterSymbolExchangeCode = symbolInfo.exchangeCode
          currentSubscriptions.value.masterSymbolSecurityId = symbolInfo.exchangeSecurityId
        }
      }
    }
  }

  const unsubscribeFromSymbols = (symbols) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN && symbols.length > 0) {
      const data = {
        action: 'unsubscribe',
        symbols: symbols
      }
      // console.log('Sending unsubscribe data:', data);
      socket.value.send(JSON.stringify(data))
    }
  }
  const updateSubscriptions = () => {
    const symbolsToUnsubscribe = []

    // Check if master symbol has changed
    if (currentSubscriptions.value.masterSymbol !== selectedMasterSymbol.value) {
      if (currentSubscriptions.value.masterSymbol) {
        const oldSymbolInfo =
          exchangeSymbols.value.symbolData[currentSubscriptions.value.masterSymbol]
        if (oldSymbolInfo) {
          symbolsToUnsubscribe.push(
            `${oldSymbolInfo.exchangeCode}|${oldSymbolInfo.exchangeSecurityId}`
          )
        }
      }
    }

    // Check if options have changed
    if (
      currentSubscriptions.value.callOption &&
      currentSubscriptions.value.callOption !== defaultCallSecurityId.value
    ) {
      symbolsToUnsubscribe.push(`NFO|${currentSubscriptions.value.callOption}`)
    }
    if (
      currentSubscriptions.value.putOption &&
      currentSubscriptions.value.putOption !== defaultPutSecurityId.value
    ) {
      symbolsToUnsubscribe.push(`NFO|${currentSubscriptions.value.putOption}`)
    }

    // Unsubscribe from old symbols
    if (symbolsToUnsubscribe.length > 0) {
      unsubscribeFromSymbols(symbolsToUnsubscribe)
    }

    // Subscribe to new symbols
    subscribeToMasterSymbol()
    subscribeToOptions()
    subscribeToPositionLTPs()
  }

  const unsubscribeFromAdditionalStrikes = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const exchangeSegment = getExchangeSegment()
      const symbolsToUnsubscribe = Object.keys(ltpCallbacks.value).map(
        (securityId) => `${exchangeSegment}|${securityId}`
      )

      if (symbolsToUnsubscribe.length > 0) {
        const data = {
          action: 'unsubscribe',
          symbols: symbolsToUnsubscribe
        }
        socket.value.send(JSON.stringify(data))
      }

      // Clear the callbacks
      ltpCallbacks.value = {}
    }
  }
  const debouncedUpdateSubscriptions = debounce(updateSubscriptions, 300)
  const initializeSubscriptions = () => {
    subscribeToMasterSymbol()
    subscribeToOptions()
  }

  const toggleAdditionalSymbols = () => {
    additionalSymbols.value = !additionalSymbols.value
  }
  const toggleMarketDepth = () => {
    marketDepth.value = !marketDepth.value
    localStorage.setItem('marketDepth', JSON.stringify(marketDepth.value))
  }
  const playNotificationSound = () => {
    localStorage.setItem('notificationSound', notificationSound.value.toString())
    if (notificationSound.value) {
      const audio = new Audio(`/${selectedSound.value}`)
      audio.play()
      showToastNotification('Notification sound enabled')
    } else {
      showToastNotification('Notification sound disabled')
    }
  }
  const showToastNotification = (message) => {
    toastMessage.value = message
    updateToastVisibility(true)
    setTimeout(() => {
      updateToastVisibility(false)
    }, 3000)
  }
  const subscribeToBasketLTPs = () => {
    basketOrders.value.forEach((order) => {
      const securityId = getSecurityIdForSymbol(order.tradingSymbol)
      if (securityId) {
        subscribeToLTP(securityId, updateBasketLTP)
      }
    })
  }
  const updateBasketLTP = (data) => {
    const order = basketOrders.value.find(
      (o) => getSecurityIdForSymbol(o.tradingSymbol) === data.tk
    )
    if (order) {
      positionLTPs.value[order.tradingSymbol] = data.lp
    }
  }
  const getSecurityIdForSymbol = (symbol) => {
    const strike = [...callStrikes.value, ...putStrikes.value].find(
      (s) => s.tradingSymbol === symbol
    )
    return strike ? strike.securityId : null
  }
  const saveBasket = () => {
    if (basketName.value.trim() === '') {
      toastMessage.value = 'Please enter a basket name'
      showToast.value = true
      return
    }

    if (editingBasketId.value !== null) {
      const index = savedBaskets.value.findIndex((b) => b.id === editingBasketId.value)
      if (index !== -1) {
        savedBaskets.value[index] = {
          id: editingBasketId.value,
          name: basketName.value,
          orders: [...basketOrders.value]
        }
      }
    } else {
      savedBaskets.value.push({
        id: uuidv4(),
        name: basketName.value,
        orders: [...basketOrders.value]
      })
    }

    localStorage.setItem('savedBaskets', JSON.stringify(savedBaskets.value))
    basketName.value = ''
    editingBasketId.value = null
    toastMessage.value = 'Basket saved successfully'
    showToast.value = true
  }
  const loadBasket = (basketId) => {
    const basket = savedBaskets.value.find((b) => b.id === basketId)
    if (basket) {
      basketOrders.value = [...basket.orders]
      basketName.value = basket.name
      editingBasketId.value = basketId
      subscribeToBasketLTPs()
    }
  }
  const deleteBasket = (basketId) => {
    savedBaskets.value = savedBaskets.value.filter((b) => b.id !== basketId)
    localStorage.setItem('savedBaskets', JSON.stringify(savedBaskets.value))
    if (editingBasketId.value === basketId) {
      basketName.value = ''
      editingBasketId.value = null
    }
  }
  const validateAndPlaceOrder = async () => {
    if (isValidLimitPrice.value) {
      await placeOrder(modalTransactionType.value, modalOptionType.value)
    } else {
      console.error('Invalid limit price')
      toastMessage.value = 'Invalid limit price'
      showToast.value = true
    }
  }

  const handleOrderTypeChange = () => {
    console.log('Order Type Changed:', selectedOrderType.value)

    switch (selectedOrderType.value) {
      case 'MKT':
        limitPrice.value = null
        break
      case 'LMT':
      case 'LMT_LTP':
        limitPrice.value = getCurrentLTP()
        break
      case 'LMT_OFFSET':
        limitPrice.value = getCurrentLTP() + limitOffset.value
        break
      case 'MKT_PROTECTION':
        limitPrice.value = getCurrentLTP() * 1.01
        break
      default:
        limitPrice.value = null
        break
    }
  }
  const getCurrentLTP = () => {
    return modalOptionType.value === 'CALL'
      ? parseFloat(latestCallLTP.value)
      : parseFloat(latestPutLTP.value)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        statusMessage.value = 'Token copied to clipboard'
        setTimeout(() => {
          statusMessage.value = ''
        }, 3000)
      },
      (err) => {
        console.error('Could not copy text: ', err)
        errorMessage.value = 'Failed to copy token'
        clearErrorMessage()
      }
    )
  }

  const openFlattradeAuthUrl = () => {
    statusMessage.value = 'Waiting for broker auth to complete...'

    localStorage.setItem('statusMessage', statusMessage.value)

    const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}')
    const storedFlattradeApiKey = flattradeDetails.apiKey

    if (!storedFlattradeApiKey) {
      errorMessage.value = 'API key is missing'
      clearErrorMessage()
      return
    }

    const authUrl = `https://auth.flattrade.in/?app_key=${storedFlattradeApiKey}`
    window.open(authUrl, '_blank')

    // Clear status message after 2 minutes if token generation doesn't complete
    setTimeout(() => {
      if (statusMessage.value === 'Waiting for broker auth to complete...') {
        statusMessage.value = ''
        localStorage.removeItem('statusMessage')
      }
    }, 120000) // 2 minutes
  }

  const clearErrorMessage = () => {
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000) // Clear error message after 5 seconds
  }

  const generateToken = async (broker) => {
    userTriggeredTokenGeneration.value = true // Set the flag when user triggers token generation

    if (!broker) {
      errorMessage.value = 'Broker information is missing'
      clearErrorMessage()
      return
    }

    if (broker.brokerName === 'Flattrade') {
      openFlattradeAuthUrl()
      statusMessage.value = 'Waiting for flattradeReqCode...'
      return
    }

    if (!flattradeReqCode.value) {
      errorMessage.value = 'Request code is missing'
      clearErrorMessage()
      return
    }
  }

  const getStatus = (broker) => {
    if (!broker || !broker.brokerName) {
      return { status: 'Unknown', statusClass: 'bg-secondary' }
    }

    const status = getBrokerStatus(broker.brokerName)
    let statusText = 'Activated'
    let statusClass = 'bg-success'

    if (status === 'Token missing') {
      statusText = `Token missing, Click ${broker.brokerName === 'Shoonya' ? 'Login' : 'Generate'}`
      statusClass = 'bg-warning text-dark'
    } else if (status === 'expired') {
      statusText = `Token Expired, Click ${broker.brokerName === 'Shoonya' ? 'Login' : 'Generate'}`
      statusClass = 'bg-warning text-dark'
    } else if (status === 'invalid') {
      statusText = 'Token Invalid'
      statusClass = 'bg-danger'
    }

    return { status: statusText, statusClass }
  }

  const handleShoonyaLogin = async () => {
    try {
      const encoder = new TextEncoder()

      // Retrieve Shoonya details from localStorage
      const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}')
      const clientId = shoonyaDetails.clientId
      const apiKey = shoonyaDetails.apiKey

      if (!clientId || !apiKey) {
        throw new Error('Shoonya client ID or API key is missing')
      }

      // Hash the password
      const pwdBuffer = await crypto.subtle.digest(
        'SHA-256',
        encoder.encode(shoonyaBrokerPassword.value)
      )
      const pwd = Array.from(new Uint8Array(pwdBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Create and hash the appkey
      const appkeyRaw = `${SHOONYA_CLIENT_ID.value}|${apiKey}`
      const appkeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(appkeyRaw))
      const appkey = Array.from(new Uint8Array(appkeyBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      const jData = {
        apkversion: '1.0.0',
        uid: SHOONYA_CLIENT_ID.value,
        pwd: pwd,
        factor2: shoonyaOneTimePassword.value,
        vc: `${clientId}_U`,
        appkey: appkey,
        imei: 'mac',
        source: 'API'
      }

      const jDataString = JSON.stringify(jData)
      const payload = `jData=${jDataString}&jKey=${apiKey}`

      const apiUrl = import.meta.env.PROD
        ? `${BASE_URL}/shoonya/login`
        : `${BASE_URL}/shoonya/login`

      const response = await axios.post(
        apiUrl,
        {
          jKey: apiKey,
          jData: jDataString
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.stat === 'Ok') {
        SHOONYA_API_TOKEN.value = response.data.susertoken
        localStorage.setItem('SHOONYA_API_TOKEN', SHOONYA_API_TOKEN.value)
        statusMessage.value = 'Shoonya login successful'

        // Clear the form fields
        shoonyaBrokerUserId.value = ''
        shoonyaBrokerPassword.value = ''
        shoonyaOneTimePassword.value = ''

        // Clear the status message after 5 seconds
        setTimeout(() => {
          statusMessage.value = ''
        }, 5000)
      } else {
        throw new Error(response.data.emsg || 'Login failed')
      }
    } catch (error) {
      errorMessage.value = `Shoonya login error: ${error.message}`
      clearErrorMessage()
    }
  }

  // Active Tab Functions
  const activeTabFunction = {
    Flattrade: {
      positions: 'fetchFlattradePositions',
      trades: 'fetchFlattradeOrdersTradesBook'
    },
    Shoonya: {
      positions: 'fetchShoonyaPositions',
      trades: 'fetchShoonyaOrdersTradesBook'
    }
  }

  // SetActive Tab Function
  const setActiveFetchFunctionAndFetch = async () => {
    const brokerName = selectedBroker.value?.brokerName
    const tabType = activeTab.value === 'positions' ? 'positions' : 'trades'

    if (brokerName && activeTabFunction[brokerName]) {
      const functionName = activeTabFunction[brokerName][tabType]
      activeFetchFunction.value = functionName

      try {
        await eval(functionName)()
      } catch (error) {
        console.error(`Error fetching data for ${brokerName} ${tabType}:`, error)
        // Handle the error appropriately (e.g., show an error message to the user)
      }
    } else {
      console.error('Invalid broker or tab type')
    }
  }

  // Update your debouncedFetchData function
  const debouncedFetchData = debounce(async () => {
    await setActiveFetchFunctionAndFetch()
  })

  // ... (add all other methods here)

  // Watchers
  // Watch for the price values
  watch(
    [niftyPrice, bankNiftyPrice, finniftyPrice, midcpniftyPrice, sensexPrice, bankexPrice],
    () => {
      if (selectedExpiry.value) {
        updateStrikesForExpiry(selectedExpiry.value)
      }
    }
  )
  watch(selectedLots, () => {
    updateSelectedQuantity()
  })
  watch(
    flatTradePositionBook,
    () => {
      updatePositionSecurityIds()
      subscribeToOptions()
    },
    { deep: true }
  )
  watch(
    shoonyaPositionBook,
    () => {
      updatePositionSecurityIds()
      subscribeToOptions()
    },
    { deep: true }
  )
  // Watch for changes in selectedBrokerName
  watch(selectedBrokerName, () => {
    updateSelectedBroker()
  })
  watch(selectedBroker, async (newBroker) => {
    if (newBroker) {
      try {
        selectedOrderType.value = orderTypes.value[0]
        previousOrderType.value = orderTypes.value[0]
        selectedProductType.value = getProductTypeValue(productTypes.value[1]) // Default to 'Margin' or 'M'
        await fetchFundLimit()
        updateExchangeSymbols()
        setDefaultExchangeAndMasterSymbol()
        await fetchTradingData()
        setDefaultExpiry()

        // Update the table based on the active tab
        debouncedFetchData()
      } catch (error) {
        console.error('Error updating broker data:', error)
        // Handle the error appropriately
      }
    }
  })
  watch(activeTab, () => {
    debouncedFetchData()
  })
  // Watcher for selectedExpiry to repopulate strike prices
  watch(selectedExpiry, async (newExpiry) => {
    // await fetchTradingData();
    updateStrikesForExpiry(newExpiry)
  })
  watch(selectedCallStrike, (newStrike, oldStrike) => {
    // console.log('Selected Call Strike changed:', newStrike);
    if (newStrike !== oldStrike) {
      defaultCallSecurityId.value = newStrike.securityId || 'N/A'
    }
  })
  watch(selectedPutStrike, (newStrike, oldStrike) => {
    // console.log('Selected Put Strike changed:', newStrike);
    if (newStrike !== oldStrike) {
      defaultPutSecurityId.value = newStrike.securityId || 'N/A'
    }
  })
  // Watchers for defaultCallSecurityId and defaultPutSecurityId
  // This watcher handles unsubscribing and subscribing to new security IDs,
  // setting Flattrade credentials, and sending WebSocket data when either ID changes.
  // Modify the watcher for defaultCallSecurityId and defaultPutSecurityId
  watch(
    [() => defaultCallSecurityId.value, () => defaultPutSecurityId.value],
    ([newCallId, newPutId], [oldCallId, oldPutId]) => {
      if (newCallId !== oldCallId || newPutId !== oldPutId) {
        debouncedUpdateSubscriptions()

        // Reset LTP values when subscribing to new symbols
        if (newCallId !== oldCallId) {
          latestCallLTP.value = 'N/A'
        }
        if (newPutId !== oldPutId) {
          latestPutLTP.value = 'N/A'
        }

        if (selectedBroker.value?.brokerName === 'Flattrade') {
          setFlattradeCredentials()
        }
        if (selectedBroker.value?.brokerName === 'Shoonya') {
          setShoonyaCredentials()
        }
      }
    },
    { deep: true }
  )
  // Modify the watcher for selectedMasterSymbol
  watch(selectedMasterSymbol, (newValue, oldValue) => {
    saveUserChoice()
    updateAvailableQuantities()
    updateSelectedQuantity()

    updateSymbolData(newValue)

    setDefaultExpiry()

    // Force re-synchronization of strikes
    synchronizeCallStrikes()
    synchronizePutStrikes()

    // Update subscriptions
    debouncedUpdateSubscriptions()
  })

  // Watch productTypes to set the default selectedProductType
  watch(
    productTypes,
    (newProductTypes) => {
      if (newProductTypes.length > 0) {
        selectedProductType.value = getProductTypeValue(newProductTypes[1]) // Default to 'Margin' or 'M'
      }
    },
    { immediate: true }
  )
  // Add a watcher for selectedExchange
  watch(selectedExchange, (newValue) => {
    saveUserChoice() // Save the user's choice
    if (exchangeSymbols.value[newValue].length > 0) {
      const savedMasterSymbol = localStorage.getItem('selectedMasterSymbol')
      selectedMasterSymbol.value =
        savedMasterSymbol && exchangeSymbols.value[newValue].includes(savedMasterSymbol)
          ? savedMasterSymbol
          : exchangeSymbols.value[newValue][0]
    } else {
      selectedMasterSymbol.value = null
    }
    updateAvailableQuantities()
  })
  watch(selectedOrderType, (newValue, oldValue) => {
    previousOrderType.value = oldValue
  })
  // Watcher to update localStorage when enableHotKeys changes
  watch(enableHotKeys, (newValue) => {
    localStorage.setItem('EnableHotKeys', newValue.toString())
  })
  // Modify the existing watcher for positionLTPs
  watch(
    positionLTPs,
    (newLTPs, oldLTPs) => {
      Object.entries(newLTPs).forEach(([tsym, ltp]) => {
        if (ltp !== oldLTPs[tsym]) {
          // console.log(`LTP changed for ${tsym}: ${oldLTPs[tsym]} -> ${ltp}`);
          const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(
            (p) => (p.tsym || p.tradingSymbol) === tsym
          )
          if (position) {
            // console.log(`Found position for ${tsym}:`, position);
            // Check stoplosses and targets immediately when LTP changes
            checkStoplossesAndTargets()
          }
        }
      })
    },
    { deep: true }
  )
  watch([callStrikeOffset, putStrikeOffset], () => {
    saveOffsets()
    updateStrikesForExpiry(selectedExpiry.value, true)
  })
  watch(selectedExpiry, (newExpiry) => {
    updateStrikesForExpiry(newExpiry, true)
  })
  watch(expiryOffset, (newValue) => {
    saveExpiryOffset()
    setDefaultExpiry()
  })
  // Watch for changes to showLTPRangeBar and save to localStorage
  watch(showLTPRangeBar, (newValue) => {
    localStorage.setItem('showLTPRangeBar', JSON.stringify(newValue))
  })
  // Watch for changes to showOHLCValues and save to localStorage
  watch(showOHLCValues, (newValue) => {
    localStorage.setItem('showOHLCValues', JSON.stringify(newValue))
  })
  watch(showStrikeDetails, (newValue) => {
    localStorage.setItem('showStrikeDetails', JSON.stringify(newValue))
  })
  // Watch for changes and update localStorage
  watch(
    [masterOpenPrice, masterHighPrice, masterLowPrice, masterClosePrice],
    ([open, high, low, close]) => {
      localStorage.setItem('masterOpenPrice', open)
      localStorage.setItem('masterHighPrice', high)
      localStorage.setItem('masterLowPrice', low)
      localStorage.setItem('masterClosePrice', close)
    }
  )

  watch(
    [callOpenPrice, callHighPrice, callLowPrice, callClosePrice],
    ([open, high, low, close]) => {
      localStorage.setItem('callOpenPrice', open)
      localStorage.setItem('callHighPrice', high)
      localStorage.setItem('callLowPrice', low)
      localStorage.setItem('callClosePrice', close)
    }
  )

  watch([putOpenPrice, putHighPrice, putLowPrice, putClosePrice], ([open, high, low, close]) => {
    localStorage.setItem('putOpenPrice', open)
    localStorage.setItem('putHighPrice', high)
    localStorage.setItem('putLowPrice', low)
    localStorage.setItem('putClosePrice', close)
  })
  // Add this in your component's setup or mounted hook
  watch(
    [
      selectedMasterSymbol,
      masterLowPrice,
      masterHighPrice,
      niftyPrice,
      bankNiftyPrice,
      finniftyPrice,
      midcpniftyPrice,
      sensexPrice,
      bankexPrice
    ],
    () => {
      // console.log('Master Symbol:', selectedMasterSymbol.value);
      // console.log('Low:', masterLowPrice.value);
      // console.log('High:', masterHighPrice.value);
      // console.log('LTP:', getMasterSymbolPrice());
      // console.log('Range Width:', ltpRangeWidth.value);
      // console.log('Marker Position:', ltpMarkerPosition.value);
    }
  )
  watch(additionalSymbols, (newValue) => {
    localStorage.setItem('additionalSymbols', JSON.stringify(newValue))
    if (newValue) {
      subscribeToOptions()
    } else {
      unsubscribeFromAdditionalStrikes()
      additionalStrikeLTPs.value = { call: {}, put: {} }
    }
  })
  watch(selectedSound, (newValue) => {
    localStorage.setItem('selectedSound', newValue)
    if (notificationSound.value) {
      const audio = new Audio(`/${newValue}`)
      audio.play()
    }
    showToastNotification(`Sound changed to ${newValue.replace('.mp3', '')}`)
  })
  watch(totalRiskTargetToggle, (newValue) => {
    localStorage.setItem('totalRiskTargetToggle', JSON.stringify(newValue))
  })

  watch(totalRiskTargetType, (newValue) => {
    localStorage.setItem('totalRiskTargetType', newValue)
  })

  watch(totalRiskAmount, (newValue) => {
    localStorage.setItem('totalRiskAmount', newValue.toString())
  })

  watch(totalRiskPercentage, (newValue) => {
    localStorage.setItem('totalRiskPercentage', newValue.toString())
  })

  watch(totalTargetAmount, (newValue) => {
    localStorage.setItem('totalTargetAmount', newValue.toString())
  })

  watch(totalTargetPercentage, (newValue) => {
    localStorage.setItem('totalTargetPercentage', newValue.toString())
  })
  // Add a watch effect to handle the countdown when risk is reached
  watch(riskReached, async (newValue) => {
    if (newValue && closePositionsRisk.value) {
      console.log('Risk threshold reached. Taking action.')
      if (riskAction.value === 'close') {
        await closeAllPositions()
        showToastNotification('All positions closed due to risk threshold')
      } else if (riskAction.value === 'killSwitch') {
        await toggleKillSwitch()
      }
    }
  })
  watch(targetReached, async (newValue) => {
    if (newValue && closePositionsTarget.value) {
      console.log('Target reached. Taking action.')
      if (targetAction.value === 'close') {
        await closeAllPositions()
        showToastNotification('All positions closed due to target reached')
      } else if (targetAction.value === 'killSwitch') {
        await toggleKillSwitch()
      }
    }
  })
  watch(closePositionsRisk, (newValue) => {
    localStorage.setItem('closePositionsRisk', JSON.stringify(newValue))
  })

  watch(closePositionsTarget, (newValue) => {
    localStorage.setItem('closePositionsTarget', JSON.stringify(newValue))
  })

  watch(riskAction, (newValue) => {
    localStorage.setItem('riskAction', newValue)
  })

  watch(targetAction, (newValue) => {
    localStorage.setItem('targetAction', newValue)
  })
  watch([totalBuyValue, totalSellValue, availableBalance], async () => {
    await fetchFundLimit()
    checkOvertradeProtection()
  })
  watch(experimentalFeatures, (newValue) => {
    localStorage.setItem('ExperimentalFeatures', JSON.stringify(newValue))
  })

  // Watch for changes in FLATTRADE_API_TOKEN and update localStorage
  watch(FLATTRADE_API_TOKEN, (newToken) => {
    if (newToken) {
      localStorage.setItem('FLATTRADE_API_TOKEN', newToken)
      validateToken('Flattrade')
    } else {
      localStorage.removeItem('FLATTRADE_API_TOKEN')
    }
  })
  // Watch for changes in SHOONYA_API_TOKEN and update localStorage
  watch(SHOONYA_API_TOKEN, (newToken) => {
    if (newToken) {
      localStorage.setItem('SHOONYA_API_TOKEN', newToken)
      validateToken('Shoonya')
    } else {
      localStorage.removeItem('SHOONYA_API_TOKEN')
    }
  })

  watch(flattradeReqCode, async (newCode) => {
    if (newCode && userTriggeredTokenGeneration.value) {
      statusMessage.value = `Received flattradeReqCode: ${newCode}`

      const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}')
      const storedApiKey = flattradeDetails.apiKey
      const storedApiSecret = flattradeDetails.apiSecret

      if (!storedApiKey || !storedApiSecret) {
        errorMessage.value = 'API key or secret is missing'
        clearErrorMessage()
        return
      }

      const api_secret = storedApiKey + newCode + storedApiSecret
      const hashedSecret = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(api_secret)
      )
      const apiSecretHex = Array.from(new Uint8Array(hashedSecret))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      const payload = {
        api_key: storedApiKey,
        request_code: newCode,
        api_secret: apiSecretHex
      }

      try {
        const apiUrl = import.meta.env.PROD
          ? `${BASE_URL}/flattrade/generateToken`
          : `${BASE_URL}/flattrade/generateToken`
        const res = await axios.post(apiUrl, payload)
        const token = res.data.token
        if (!token) {
          errorMessage.value = 'Token generation failed'
          clearErrorMessage()
        } else {
          FLATTRADE_API_TOKEN.value = token
          errorMessage.value = ''
          statusMessage.value = `Token generated successfully: ${token}`
          localStorage.removeItem('statusMessage') // Clear the stored status message
          console.log('Token generated successfully:', token)

          // Clear success message after 5 seconds
          setTimeout(() => {
            statusMessage.value = ''
          }, 5000)
        }
      } catch (error) {
        errorMessage.value = 'Error generating token: ' + error.message
        clearErrorMessage()
        console.error('Error generating token:', error)
      }
    }
  })
  watch(stickyMTM, (newValue) => {
    localStorage.setItem('stickyMTM', JSON.stringify(newValue))
  })
  // ... (add all other watchers here)

  return {
    // Methods
    updateToastVisibility,
    setActiveTab,
    updateExchangeSymbols,
    setDefaultExchangeAndMasterSymbol,
    fetchTradingData,
    setDefaultExpiry,
    saveUserChoice,
    saveOffsets,
    saveExpiryOffset,
    updateSymbolData,
    calculateUnrealizedProfit,
    getProductTypeValue,
    connectWebSocket,
    subscribeToMasterSymbol,
    updateSubscriptions,
    checkOvertradeProtection,
    unsubscribeFromAdditionalStrikes,
    toggleAdditionalSymbols,
    toggleMarketDepth,
    playNotificationSound,
    showToastNotification,
    subscribeToBasketLTPs,
    updateBasketLTP,
    getSecurityIdForSymbol,
    saveBasket,
    loadBasket,
    deleteBasket,
    validateAndPlaceOrder,
    handleOrderTypeChange,
    getCurrentLTP,
    handleOrderClick,
    formatTime,
    loadStrategy,
    placeBasketOrder,
    toggleOvertradeProtection,
    toggleExperimentalFeatures,
    setOrderDetails,
    updateTradingSymbol,
    convertToComparableDate,
    resetOrderTypeIfNeeded,
    setStrategyType,
    updateBasketOrderQuantity,
    removeFromBasket,
    placeBasket,
    placeAllBasketOrders,
    setReverseMode,
    reversePositions,
    copyToClipboard,
    generateToken,
    getStatus,
    handleShoonyaLogin,
    setActiveFetchFunctionAndFetch,

    // Computed properties
    brokers,
    isFormDisabled,
    exchangeOptions,
    todayExpirySymbol,
    maxLots,
    combinedOrdersAndTrades,
    availableBalance,
    usedAmount,
    formattedDate,
    totalNetQty,
    totalProfit,
    positionsWithCalculatedProfit,
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
    callLtpMarkerPosition,
    callOpenMarkerPosition,
    openMarkerPosition,
    putLtpRangeWidth,
    putLtpMarkerPosition,
    putOpenMarkerPosition

    // Reactive variables (from globalState)
  }
}
