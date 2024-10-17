import { ref, computed, watch } from 'vue'
import * as globalState from '@/stores/globalStore'
import axios from 'axios'
import qs from 'qs'
import { debounce } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import {
  validateToken,
  checkAllTokens,
  getBrokerStatus,
  tokenStatus
} from '@/utils/brokerTokenValidator'

export function useTradeView() {
  // Reactive variables (from globalState)
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
    paperTradingPositionBook,
    paperTradingOrderBook,
    paperTradingTradeBook,
    fundLimits,
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
    allSymbolsData,
    API_TOKEN,
    FLATTRADE_API_KEY,
    FLATTRADE_API_SECRET,
    FLATTRADE_CLIENT_ID,
    FLATTRADE_API_TOKEN,
    SHOONYA_API_KEY,
    SHOONYA_CLIENT_ID,
    SHOONYA_API_TOKEN,
    PAPERTRADING_API_KEY,
    PAPERTRADING_CLIENT_ID,
    flattradeReqCode,
    shoonyaBrokerUserId,
    shoonyaBrokerPassword,
    shoonyaOneTimePassword,
    errorMessage,
    statusMessage,
    userTriggeredTokenGeneration,
    selectedBrokerToDelete,
    selectedBrokerForPaper,
    stickyMTM,
    savedStickyMTM
  } = globalState

  // Computed Variables
  const brokerStatus = computed(() => {
    const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}')
    const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}')
    const paperTradingDetails = JSON.parse(localStorage.getItem('broker_PaperTrading') || '{}')

    const flattradeClientId = flattradeDetails.clientId
    const flattradeApiToken = localStorage.getItem('FLATTRADE_API_TOKEN')
    const shoonyaApiToken = localStorage.getItem('SHOONYA_API_TOKEN')
    const shoonyaClientId = shoonyaDetails.clientId
    const paperTradingClientId = paperTradingDetails.clientId

    if (selectedBroker.value?.brokerName === 'Flattrade') {
      if (flattradeClientId && flattradeApiToken) {
        return tokenStatus.Flattrade === 'valid' ? 'Connected' : 'Token Expired'
      }
      return 'Not Connected'
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      if (shoonyaClientId && shoonyaApiToken) {
        return tokenStatus.Shoonya === 'valid' ? 'Connected' : 'Token Expired'
      }
      return 'Not Connected'
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      if (paperTradingClientId) {
        return 'Connected' // PaperTrading is always connected if a client ID exists
      }
      return 'Not Connected'
    }
    return 'Not Connected'
  })
  const isFormDisabled = computed(() => killSwitchActive.value)
  const remainingTimeInMs = computed(() => {
    if (!activationTime.value || !killSwitchActive.value) return 0
    const sixHoursInMillis = 6 * 60 * 60 * 1000
    return Math.max(0, sixHoursInMillis - (currentTime.value - activationTime.value))
  })
  const killSwitchRemainingTime = computed(() => {
    if (remainingTimeInMs.value === 0) return ''

    const hours = Math.floor(remainingTimeInMs.value / (60 * 60 * 1000))
    const minutes = Math.floor((remainingTimeInMs.value % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((remainingTimeInMs.value % (60 * 1000)) / 1000)

    return `${hours}h ${minutes}m ${seconds}s`
  })
  const killSwitchButtonText = computed(() => (killSwitchActive.value ? 'Deactivate' : 'Activate'))
  const killSwitchButtonClass = computed(() =>
    killSwitchActive.value
      ? 'btn btn-sm btn-danger shadow fs-6'
      : 'btn btn-sm btn-success shadow fs-6'
  )
  const availableBrokers = computed(() => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith('broker_'))
      .map((key) => key.replace('broker_', ''))
  })
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
  const selectedLots = computed({
    get: () => lotsPerSymbol.value[selectedMasterSymbol.value] || 1,
    set: (value) => {
      lotsPerSymbol.value[selectedMasterSymbol.value] = value
      saveLots()
    }
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
  const orderTypes = computed(() => {
    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya' ||
      selectedBroker.value?.brokerName === 'PaperTrading'
    ) {
      return ['MKT', 'LMT', 'LMT_LTP', 'LMT_OFFSET', 'MKT_PROTECTION']
    }
    return []
  })
  const displayOrderTypes = computed(() => {
    return orderTypes.value.map((type) => {
      switch (type) {
        case 'MKT':
          return 'Market'
        case 'LMT':
          return 'Limit'
        case 'LMT_LTP':
          return 'Limit at LTP'
        case 'LMT_OFFSET':
          return 'Limit at Offset'
        case 'MKT_PROTECTION':
          return 'Market Protection'
        default:
          return type
      }
    })
  })
  const selectedOrderType = ref(orderTypes.value[0])
  const previousOrderType = ref(orderTypes.value[0])
  const productTypes = computed(() => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return ['Intraday', 'Margin']
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return ['Intraday', 'Margin']
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      return ['Intraday', 'Margin']
    }
    return []
  })
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
    if (selectedBroker.value?.brokerName === 'PaperTrading') {
      const cash = Number(fundLimits.value.cash) || 0
      const payin = Number(fundLimits.value.payin) || 0
      const marginUsed = Number(fundLimits.value.marginused) || 0

      // Use payin if cash is zero, otherwise use cash
      const availableFunds = cash === 0 ? payin : cash

      const balance = Math.floor(availableFunds - marginUsed)
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
  const additionalStrikes = computed(() => {
    if (!additionalSymbols.value) return []

    const currentPrice = getMasterSymbolPrice()
    const allStrikes = [
      ...new Set([...callStrikes.value, ...putStrikes.value].map((strike) => strike.strikePrice))
    ].sort((a, b) => a - b)

    const currentIndex = allStrikes.findIndex((strike) => strike >= currentPrice)
    const startIndex = Math.max(0, currentIndex - 3)
    const endIndex = Math.min(allStrikes.length - 1, currentIndex + 3)

    return allStrikes.slice(startIndex, endIndex + 1)
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

    // Add PaperTrading broker
    if (PAPERTRADING_CLIENT_ID.value && PAPERTRADING_API_KEY.value) {
      brokersArray.push({
        id: 'PaperTrading',
        brokerName: 'PaperTrading',
        brokerClientId: PAPERTRADING_CLIENT_ID.value,
        apiKey: PAPERTRADING_API_KEY.value,
        apiToken: '' // PaperTrading does not have an API token
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
  const initKillSwitch = () => {
    const storedStatus = localStorage.getItem('KillSwitchStatus')
    const storedActivationTime = localStorage.getItem('KillSwitchActivationTime')

    if (storedStatus === 'true' && storedActivationTime) {
      killSwitchActive.value = true
      activationTime.value = parseInt(storedActivationTime)
    } else {
      // Deactivate kill switch if KillSwitchActivationTime is missing
      killSwitchActive.value = false
      activationTime.value = 0
      localStorage.removeItem('KillSwitchStatus')
      localStorage.removeItem('KillSwitchActivationTime')
    }
  }
  const handleKillSwitchClick = () => {
    if (killSwitchActive.value) {
      // If the kill switch is already active, deactivate it directly
      toggleKillSwitch()
    }
    // If it's not active, the modal will be shown due to data-bs-target and data-bs-toggle
  }
  const toggleKillSwitch = async () => {
    const newStatus = killSwitchActive.value ? 'DEACTIVATED' : 'ACTIVATED'
    if (newStatus === 'ACTIVATED') {
      await closeAllPositions() // Wait for closeAllPositions to complete
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (newStatus === 'DEACTIVATED' && remainingTimeInMs.value > 0) {
      cycleClockEmoji()
      toastMessage.value = 'Kill Switch cannot be deactivated within 6 hours of activation'
      showToast.value = true
      return
    }

    // Handle different response messages
    if (newStatus === 'ACTIVATED') {
      toastMessage.value = 'Kill Switch activated successfully'
      killSwitchActive.value = true
      localStorage.setItem('KillSwitchStatus', 'true')
      activationTime.value = Date.now()
      localStorage.setItem('KillSwitchActivationTime', activationTime.value.toString())
      enableHotKeys.value = false
    } else {
      toastMessage.value = 'Kill Switch deactivated successfully'
      killSwitchActive.value = false
      localStorage.removeItem('KillSwitchStatus')
      activationTime.value = 0
      localStorage.removeItem('KillSwitchActivationTime')
    }

    showToast.value = true
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
  const updateSelectedBroker = () => {
    const availableBrokerNames = availableBrokers.value

    if (availableBrokerNames.length === 0) {
      selectedBroker.value = null
      localStorage.removeItem('selectedBroker')
      selectedBrokerName.value = ''
    } else if (
      selectedBrokerName.value &&
      availableBrokerNames.includes(selectedBrokerName.value)
    ) {
      const brokerDetails = JSON.parse(
        localStorage.getItem(`broker_${selectedBrokerName.value}`) || '{}'
      )
      selectedBroker.value = brokerDetails
      localStorage.setItem('selectedBroker', JSON.stringify(brokerDetails))
    } else {
      selectedBroker.value = null
      localStorage.removeItem('selectedBroker')
      selectedBrokerName.value = ''
    }
  }

  const updateExchangeSymbols = () => {
    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya' ||
      selectedBroker.value?.brokerName === 'PaperTrading'
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
        } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
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

  const formatDate = (dateString) => {
    if (!dataFetched.value || !dateString) {
      return '' // Return empty string if data hasn't been fetched or dateString is null
    }

    if (
      selectedBroker.value?.brokerName === 'Flattrade' ||
      selectedBroker.value?.brokerName === 'Shoonya' ||
      selectedBroker.value?.brokerName === 'PaperTrading'
    ) {
      return dateString
    }
    return dateString
  }
  const convertToComparableDate = (dateString) => {
    const date = new Date(dateString)
    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('en-US', options).replace(/,/g, '')
  }
  const updateStrikesForExpiry = (expiryDate, forceUpdate = false) => {
    let filteredCallStrikes, filteredPutStrikes

    if (allSymbolsData[selectedMasterSymbol.value]) {
      filteredCallStrikes = allSymbolsData[selectedMasterSymbol.value].callStrikes.filter(
        (strike) => strike.expiryDate === expiryDate
      )
      filteredPutStrikes = allSymbolsData[selectedMasterSymbol.value].putStrikes.filter(
        (strike) => strike.expiryDate === expiryDate
      )

      const uniqueStrikePrices = [
        ...new Set(
          [...filteredCallStrikes, ...filteredPutStrikes].map((strike) => strike.strikePrice)
        )
      ].sort((a, b) => a - b)

      filteredCallStrikes = uniqueStrikePrices.map(
        (strikePrice) =>
          filteredCallStrikes.find((strike) => strike.strikePrice === strikePrice) || {
            strikePrice,
            expiryDate,
            securityId: null,
            tradingSymbol: null
          }
      )
      filteredPutStrikes = uniqueStrikePrices.map(
        (strikePrice) =>
          filteredPutStrikes.find((strike) => strike.strikePrice === strikePrice) || {
            strikePrice,
            expiryDate,
            securityId: null,
            tradingSymbol: null
          }
      )

      callStrikes.value = filteredCallStrikes
      putStrikes.value = filteredPutStrikes
    } else {
      console.error(`No data found for ${selectedMasterSymbol.value}`)
      return
    }

    if (
      forceUpdate ||
      !selectedCallStrike.value.securityId ||
      !selectedPutStrike.value.securityId ||
      selectedCallStrike.value.expiryDate !== expiryDate
    ) {
      let currentPrice
      switch (selectedMasterSymbol.value) {
        case 'NIFTY':
          currentPrice = parseFloat(niftyPrice.value)
          break
        case 'BANKNIFTY':
          currentPrice = parseFloat(bankNiftyPrice.value)
          break
        case 'FINNIFTY':
          currentPrice = parseFloat(finniftyPrice.value)
          break
        case 'MIDCPNIFTY':
          currentPrice = parseFloat(midcpniftyPrice.value)
          break
        case 'SENSEX':
          currentPrice = parseFloat(sensexPrice.value)
          break
        case 'BANKEX':
          currentPrice = parseFloat(bankexPrice.value)
          break
        default:
          console.error(`Unknown master symbol: ${selectedMasterSymbol.value}`)
          return
      }

      if (currentPrice && !isNaN(currentPrice) && filteredCallStrikes.length > 0) {
        const nearestStrikeIndex = filteredCallStrikes.findIndex(
          (strike) =>
            Math.abs(strike.strikePrice - currentPrice) ===
            Math.min(...filteredCallStrikes.map((s) => Math.abs(s.strikePrice - currentPrice)))
        )

        const callOffsetIndex = nearestStrikeIndex - parseInt(callStrikeOffset.value)
        const putOffsetIndex = nearestStrikeIndex + parseInt(putStrikeOffset.value)

        selectedCallStrike.value = filteredCallStrikes[callOffsetIndex] || {}
        selectedPutStrike.value = filteredPutStrikes[putOffsetIndex] || {}
      }

      if (synchronizeOnLoad.value) {
        synchronizeStrikes()
        synchronizeOnLoad.value = false
      }

      defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A'
      defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A'
    }
  }
  const saveOffsets = () => {
    localStorage.setItem('callStrikeOffset', callStrikeOffset.value)
    localStorage.setItem('putStrikeOffset', putStrikeOffset.value)
  }
  const synchronizeStrikes = () => {
    synchronizeCallStrikes()
    synchronizePutStrikes()
  }
  const synchronizeCallStrikes = () => {
    if (selectedPutStrike.value && selectedPutStrike.value.tradingSymbol) {
      let baseSymbol
      if (
        selectedBroker.value?.brokerName === 'Flattrade' ||
        selectedBroker.value?.brokerName === 'Shoonya' ||
        selectedBroker.value?.brokerName === 'PaperTrading'
      ) {
        baseSymbol = selectedPutStrike.value.tradingSymbol.replace(/P\d+$/, '')
      }
      const matchingCallStrike = callStrikes.value.find(
        (strike) =>
          strike.tradingSymbol.startsWith(baseSymbol) && /C\d+$/.test(strike.tradingSymbol)
      )
      if (matchingCallStrike) {
        selectedCallStrike.value = matchingCallStrike
      } else {
        selectedCallStrike.value = {}
      }
    }
    updateSecurityIds()
  }
  const synchronizePutStrikes = () => {
    if (selectedCallStrike.value && selectedCallStrike.value.tradingSymbol) {
      let baseSymbol
      if (
        selectedBroker.value?.brokerName === 'Flattrade' ||
        selectedBroker.value?.brokerName === 'Shoonya' ||
        selectedBroker.value?.brokerName === 'PaperTrading'
      ) {
        baseSymbol = selectedCallStrike.value.tradingSymbol.replace(/C\d+$/, '')
      }
      const matchingPutStrike = putStrikes.value.find(
        (strike) =>
          strike.tradingSymbol.startsWith(baseSymbol) && /P\d+$/.test(strike.tradingSymbol)
      )
      if (matchingPutStrike) {
        selectedPutStrike.value = matchingPutStrike
      } else {
        selectedPutStrike.value = {}
      }
    }
    updateSecurityIds()
  }
  const updateSecurityIds = () => {
    // console.log('Updating Security IDs');
    defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A'
    defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A'
  }
  const saveLots = () => {
    localStorage.setItem('lotsPerSymbol', JSON.stringify(lotsPerSymbol.value))
  }
  const loadLots = () => {
    const savedLots = localStorage.getItem('lotsPerSymbol')
    if (savedLots) {
      lotsPerSymbol.value = JSON.parse(savedLots)
    }
  }
  const updateAvailableQuantities = () => {
    const instrument = quantities.value[selectedMasterSymbol.value]
    if (instrument) {
      availableQuantities.value = Array.from({ length: instrument.maxLots }, (_, i) => ({
        lots: i + 1,
        quantity: (i + 1) * instrument.lotSize
      }))
    } else {
      availableQuantities.value = []
    }
    // Ensure selectedQuantity is in the available quantities list
    if (!availableQuantities.value.some((q) => q.quantity === selectedQuantity.value)) {
      selectedQuantity.value = availableQuantities.value[0]?.quantity || 0
    }
  }
  const updateSelectedQuantity = () => {
    const instrument = quantities.value[selectedMasterSymbol.value]
    if (instrument) {
      const maxLots = instrument.maxLots // Use maxLots from the instrument
      const lots = Math.min(Math.max(1, selectedLots.value), maxLots)
      lotsPerSymbol.value[selectedMasterSymbol.value] = lots
      selectedQuantity.value = lots * instrument.lotSize
      saveLots()
      getOrderMargin()
    }
  }
  const handleHotKeys = (event) => {
    if (!enableHotKeys.value) return

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowRight':
      case 'ArrowLeft':
      case 'F6':
      case 'F7':
        event.preventDefault() // Prevent default browser action
        break
    }

    switch (event.key) {
      case 'ArrowUp':
        placeOrder(getTransactionType('BUY'), 'CALL')
        break
      case 'ArrowDown':
        placeOrder(getTransactionType('BUY'), 'PUT')
        break
      case 'ArrowRight':
        placeOrder(getTransactionType('SELL'), 'PUT')
        break
      case 'ArrowLeft':
        placeOrder(getTransactionType('SELL'), 'CALL')
        break
      case 'F6':
        closeAllPositions()
        break
      case 'F7':
        cancelPendingOrders()
        break
    }
  }
  const fetchFlattradeOrdersTradesBook = async () => {
    let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value

    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
      toastMessage.value = 'Flattrade broker is not selected.'
      showToast.value = true
      return
    }

    const clientId = selectedBroker.value.clientId

    if (!jKey || !clientId) {
      toastMessage.value = 'Token or Client ID is missing. Please generate a token first.'
      showToast.value = true
      return
    }

    try {
      const response = await axios.get(`${BASE_URL}/flattrade/getOrdersAndTrades`, {
        params: {
          FLATTRADE_API_TOKEN: jKey,
          FLATTRADE_CLIENT_ID: clientId
        }
      })

      flatOrderBook.value = response.data.orderBook
      flatTradeBook.value = response.data.tradeBook
      // console.log('Flattrade Order Book:', response.data.orderBook);
      // console.log('Flattrade Trade Book:', response.data.tradeBook);
    } catch (error) {
      toastMessage.value = 'Error fetching trades: ' + error.message
      showToast.value = true
      console.error('Error fetching trades:', error)
    }
  }
  const fetchShoonyaOrdersTradesBook = async () => {
    let jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value

    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
      toastMessage.value = 'Shoonya broker is not selected.'
      showToast.value = true
      return
    }

    const clientId = selectedBroker.value.clientId

    if (!jKey || !clientId) {
      toastMessage.value = 'Token or Client ID is missing. Please generate a token first.'
      showToast.value = true
      return
    }

    try {
      const response = await axios.get(`${BASE_URL}/shoonya/getOrdersAndTrades`, {
        params: {
          SHOONYA_API_TOKEN: jKey,
          SHOONYA_CLIENT_ID: clientId
        }
      })

      shoonyaOrderBook.value = response.data.orderBook
      shoonyaTradeBook.value = response.data.tradeBook
      // console.log('Shoonya Order Book:', response.data.orderBook);
      // console.log('Shoonya Trade Book:', response.data.tradeBook);
    } catch (error) {
      toastMessage.value = 'Error fetching trades: ' + error.message
      showToast.value = true
      console.error('Error fetching trades:', error)
    }
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
  const fetchFlattradePositions = async () => {
    let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value

    if (!jKey) {
      toastMessage.value = 'Token is missing. Please generate a token first.'
      showToast.value = true
      return
    }

    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
      toastMessage.value = 'Flattrade broker is not selected.'
      showToast.value = true
      return
    }

    const clientId = selectedBroker.value.clientId

    const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: clientId, actid: clientId })}`

    try {
      const positionBookRes = await axios.post(
        'https://piconnect.flattrade.in/PiConnectTP/PositionBook',
        positionBookPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      if (
        Array.isArray(positionBookRes.data) &&
        positionBookRes.data.every((item) => item.stat === 'Ok')
      ) {
        flatTradePositionBook.value = positionBookRes.data
        // console.log('Flattrade Position Book:', positionBookRes.data);
        updatePositionSecurityIds()
        subscribeToPositionLTPs()
        subscribeToOptions()
      } else if (
        positionBookRes.data.emsg === 'no data' ||
        positionBookRes.data.emsg.includes('no data')
      ) {
        flatTradePositionBook.value = []
        // console.log('No positions in Flattrade Position Book');
      } else {
        const errorMsg = positionBookRes.data.emsg || 'Unknown error'
        console.error('Error fetching position book:', errorMsg)
        flatTradePositionBook.value = []
      }
    } catch (error) {
      console.error('Error fetching position book:', error)
      flatTradePositionBook.value = []
    }
  }
  const fetchShoonyaPositions = async () => {
    let jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value

    if (!jKey) {
      toastMessage.value = 'Token is missing. Please generate a token first.'
      showToast.value = true
      return
    }

    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
      toastMessage.value = 'Shoonya broker is not selected.'
      showToast.value = true
      return
    }

    const clientId = selectedBroker.value.clientId

    const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: clientId, actid: clientId })}`

    try {
      const positionBookRes = await axios.post(
        'https://api.shoonya.com/NorenWClientTP/PositionBook',
        positionBookPayload,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      if (
        Array.isArray(positionBookRes.data) &&
        positionBookRes.data.every((item) => item.stat === 'Ok')
      ) {
        shoonyaPositionBook.value = positionBookRes.data
        // console.log('Shoonya Position Book:', positionBookRes.data);
        updatePositionSecurityIds()
        subscribeToPositionLTPs()
        subscribeToOptions()
      } else if (
        positionBookRes.data.emsg === 'no data' ||
        positionBookRes.data.emsg.includes('no data')
      ) {
        shoonyaPositionBook.value = []
        // console.log('No positions in Shoonya Position Book');
      } else {
        const errorMsg = positionBookRes.data.emsg || 'Unknown error'
        console.error('Error fetching position book:', errorMsg)
        shoonyaPositionBook.value = []
      }
    } catch (error) {
      console.error('Error fetching position book:', error)
      shoonyaPositionBook.value = []
    }
  }
  const fetchFundLimit = async () => {
    try {
      if (!selectedBroker.value) {
        throw new Error('No broker selected')
      }

      let response
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
        if (!FLATTRADE_API_TOKEN) {
          throw new Error('Flattrade API Token is missing')
        }
        response = await axios.post(`${BASE_URL}/flattrade/fundLimit`, null, {
          params: {
            FLATTRADE_API_TOKEN,
            FLATTRADE_CLIENT_ID: selectedBroker.value.clientId
          }
        })
        fundLimits.value = {
          cash: response.data.cash,
          payin: response.data.payin,
          marginused: response.data.marginused
        }
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
        if (!SHOONYA_API_TOKEN) {
          throw new Error('Shoonya API Token is missing')
        }
        response = await axios.post(`${BASE_URL}/shoonya/fundLimit`, null, {
          params: {
            SHOONYA_API_TOKEN,
            SHOONYA_CLIENT_ID: selectedBroker.value.clientId
          }
        })
        // Make sure the response data has the correct structure
        fundLimits.value = {
          cash: response.data.cash,
          payin: response.data.payin,
          marginused: response.data.marginused
          // Add any other relevant fields from the Shoonya response
        }
      } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
        fundLimits.value = {
          cash: 1000000,
          marginused: 0,
          payin: 0
        }
      } else {
        throw new Error('Unsupported broker')
      }
      // fundLimits.value = response.data;
    } catch (error) {
      console.error('Failed to fetch fund limits:', error)
    }
  }
  const updateFundLimits = async () => {
    await fetchFundLimit()
    // console.log('Updated Fund Limits:', fundLimits.value);
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
  const getProductTypeValue = (productType) => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return productType === 'Intraday' ? 'I' : 'M'
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return productType === 'Intraday' ? 'I' : 'M'
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      return productType === 'Intraday' ? 'I' : 'M'
    }
    return productType
  }
  const getTransactionType = (type) => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return type === 'BUY' ? 'B' : 'S'
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return type === 'BUY' ? 'B' : 'S'
    }
    return type
  }
  const getExchangeSegment = () => {
    if (!selectedBroker.value || !selectedExchange.value) {
      throw new Error('Broker or exchange not selected')
    }

    if (selectedBroker.value?.brokerName === 'Flattrade') {
      if (selectedExchange.value === 'NFO') {
        return 'NFO'
      } else if (selectedExchange.value === 'BFO') {
        return 'BFO'
      } else {
        throw new Error('Selected exchange is not valid for Flattrade')
      }
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      if (selectedExchange.value === 'NFO') {
        return 'NFO'
      } else if (selectedExchange.value === 'BFO') {
        return 'BFO'
      } else {
        throw new Error('Selected exchange is not valid for Shoonya')
      }
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      if (selectedExchange.value === 'NFO') {
        return 'NFO'
      } else if (selectedExchange.value === 'BFO') {
        return 'BFO'
      } else {
        throw new Error('Selected exchange is not valid for Paper Trading')
      }
    } else {
      throw new Error('Unsupported broker')
    }
  }
  const prepareOrderPayload = (transactionType, drvOptionType, selectedStrike, exchangeSegment) => {
    let price = '0'
    let priceType = 'MKT'

    switch (selectedOrderType.value) {
      case 'LMT':
        price = limitPrice.value.toString()
        priceType = 'LMT'
        break
      case 'LMT_LTP':
        price = getCurrentLTP().toString()
        priceType = 'LMT'
        break
      case 'LMT_OFFSET':
        price = (getCurrentLTP() + limitOffset.value).toString()
        priceType = 'LMT'
        break
      case 'MKT_PROTECTION':
        price = (getCurrentLTP() * 1.01).toString()
        priceType = 'LMT'
        break
    }

    const commonPayload = {
      uid: selectedBroker.value.clientId,
      actid: selectedBroker.value.clientId,
      exch: exchangeSegment,
      tsym: selectedStrike.tradingSymbol,
      qty: selectedQuantity.value.toString(),
      prc: price,
      prd: getProductTypeValue(selectedProductType.value),
      trantype: getTransactionType(transactionType),
      prctyp: priceType,
      ret: 'DAY',
      ordersource: 'API'
    }

    switch (selectedBroker.value?.brokerName) {
      case 'Flattrade':
        return {
          ...commonPayload
          // Add any additional fields specific to Flattrade here
        }
      case 'Shoonya':
        return {
          ...commonPayload
          // Add any additional fields specific to Shoonya here
        }
      case 'PaperTrading':
        return {
          ...commonPayload,
          paperTrade: true,
          drvOptionType,
          strikePrice: selectedStrike.strikePrice,
          originalOrderType: selectedOrderType.value // Store the original order type for paper trading
          // Add any additional fields specific to PaperTrading here
        }
      default:
        throw new Error('Unsupported broker')
    }
  }
  const getOrderMargin = async () => {
    try {
      let brokerName = selectedBroker.value?.brokerName
      let clientId = selectedBroker.value?.clientId
      let API_TOKEN

      console.log('Initial broker:', brokerName)
      console.log('Initial clientId:', clientId)

      if (brokerName === 'PaperTrading') {
        const selectedPaperBroker = JSON.parse(
          localStorage.getItem('selectedBrokerForPaper') || '{}'
        )
        brokerName = selectedPaperBroker.brokerName
        clientId = selectedPaperBroker.clientId
        console.log('Paper trading broker:', brokerName)
        console.log('Paper trading clientId:', clientId)

        // If clientId is still undefined, try to get it from the broker details
        if (!clientId) {
          const brokerDetails = JSON.parse(localStorage.getItem(`broker_${brokerName}`) || '{}')
          clientId = brokerDetails.clientId
          console.log('Retrieved clientId from broker details:', clientId)
        }
      }

      if (!['Flattrade', 'Shoonya'].includes(brokerName)) {
        throw new Error('Order margin calculation is only available for Flattrade and Shoonya')
      }

      API_TOKEN = localStorage.getItem(`${brokerName.toUpperCase()}_API_TOKEN`)
      console.log('API_TOKEN:', API_TOKEN ? 'Present' : 'Missing')

      if (!API_TOKEN) {
        throw new Error(`${brokerName} API Token is missing`)
      }

      if (!clientId) {
        console.log('Missing clientId for broker:', brokerName)
        throw new Error(`${brokerName} client ID is missing`)
      }

      // ... rest of the function remains the same
    } catch (error) {
      console.error('Error getting order margin:', error)
      orderMargin.call = null
      orderMargin.put = null
    }
  }
  const placeOrder = async (transactionType, drvOptionType) => {
    try {
      let selectedStrike =
        drvOptionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value

      if (!selectedStrike || !selectedStrike.tradingSymbol || !selectedStrike.securityId) {
        throw new Error(`Selected ${drvOptionType.toLowerCase()} strike is not properly defined`)
      }

      const exchangeSegment = getExchangeSegment()
      const instrument = quantities.value[selectedMasterSymbol.value]
      const freezeLimit = instrument.freezeLimit
      const orderLots = selectedLots.value
      const fullOrderQuantity = selectedQuantity.value

      let remainingLots = orderLots
      let placedLots = 0

      while (remainingLots > 0) {
        const lotsToPlace = Math.min(remainingLots, freezeLimit)
        const quantityToPlace = lotsToPlace * instrument.lotSize

        const orderData = prepareOrderPayload(
          transactionType,
          drvOptionType,
          selectedStrike,
          exchangeSegment
        )
        orderData.qty = quantityToPlace.toString()

        // Handle dynamic price updates for LMT_LTP and LMT_OFFSET
        if (['LMT_LTP', 'LMT_OFFSET', 'MKT_PROTECTION'].includes(selectedOrderType.value)) {
          const currentLTP = getCurrentLTP()
          switch (selectedOrderType.value) {
            case 'LMT_LTP':
              orderData.prc = currentLTP.toString()
              break
            case 'LMT_OFFSET':
              orderData.prc = (currentLTP + limitOffset.value).toString()
              break
            case 'MKT_PROTECTION':
              orderData.prc = (currentLTP * 1.01).toString()
              break
          }
        }

        let response
        if (selectedBroker.value?.brokerName === 'Flattrade') {
          const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
          const payload = qs.stringify(orderData)
          response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
            headers: {
              Authorization: `Bearer ${FLATTRADE_API_TOKEN}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        } else if (selectedBroker.value?.brokerName === 'Shoonya') {
          const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
          const payload = qs.stringify(orderData)
          response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
            headers: {
              Authorization: `Bearer ${SHOONYA_API_TOKEN}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
          response = simulatePaperTradingOrder(orderData)
        }

        console.log(`Placed order for ${lotsToPlace} lots (${quantityToPlace} quantity)`)
        console.log('Order placed successfully:', response.data)
        remainingLots -= lotsToPlace
        placedLots += lotsToPlace

        // Add a small delay between orders for LMT_LTP and LMT_OFFSET to get updated LTP
        if (['LMT_LTP', 'LMT_OFFSET'].includes(selectedOrderType.value)) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      console.log(
        `All orders placed successfully. Total: ${placedLots} lots (${fullOrderQuantity} quantity)`
      )
      toastMessage.value = `Order(s) placed successfully for ${placedLots} lots`
      showToast.value = true

      // Add a delay before fetching updated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both orders and positions
      await updateOrdersAndPositions()

      // Update fund limits
      await updateFundLimits()
    } catch (error) {
      console.error('Error placing order:', error)
      if (error.response?.data?.message) {
        const firstThreeWords = error.response.data.message.split(' ').slice(0, 3).join(' ')
        toastMessage.value = firstThreeWords
      } else {
        toastMessage.value = 'Failed to place order unfortunately'
      }
      showToast.value = true
    }
  }
  const updateOrdersAndPositions = async () => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      await Promise.all([fetchFlattradeOrdersTradesBook(), fetchFlattradePositions()])
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      await Promise.all([fetchShoonyaOrdersTradesBook(), fetchShoonyaPositions()])
    } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
      await Promise.all([fetchPaperTradingOrdersTradesBook(), fetchPaperTradingPositions()])
    }
  }
  const findNewPosition = (tradingSymbol) => {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      return flatTradePositionBook.value.find((p) => p.tsym === tradingSymbol)
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      return shoonyaPositionBook.value.find((p) => p.tsym === tradingSymbol)
    }
    return null
  }
  const placeOrderForPosition = async (transactionType, optionType, position) => {
    try {
      const quantity = Math.abs(Number(position.netQty || position.netqty))
      const instrument = quantities.value[selectedMasterSymbol.value]
      const freezeLimit = instrument.freezeLimit * instrument.lotSize

      if (quantity === 0) {
        console.log('Quantity is zero, no order will be placed.')
        return
      }

      let remainingQuantity = quantity
      let placedQuantity = 0

      while (remainingQuantity > 0) {
        const quantityToPlace = Math.min(remainingQuantity, freezeLimit)

        let orderData
        if (
          selectedBroker.value?.brokerName === 'Flattrade' ||
          selectedBroker.value?.brokerName === 'Shoonya'
        ) {
          orderData = {
            uid: selectedBroker.value.clientId,
            actid: selectedBroker.value.clientId,
            exch: selectedExchange.value === 'NFO' ? 'NFO' : 'BFO',
            tsym: position.tsym,
            qty: quantityToPlace.toString(),
            prc: '0',
            prd: position.prd,
            trantype: transactionType,
            prctyp: 'MKT',
            ret: 'DAY'
          }
        }

        let response
        if (selectedBroker.value?.brokerName === 'Flattrade') {
          const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
          const payload = qs.stringify(orderData)
          response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
            headers: {
              Authorization: `Bearer ${FLATTRADE_API_TOKEN}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        } else if (selectedBroker.value?.brokerName === 'Shoonya') {
          const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
          const payload = qs.stringify(orderData)
          response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
            headers: {
              Authorization: `Bearer ${SHOONYA_API_TOKEN}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          })
        }

        console.log(`Placed order for ${quantityToPlace} quantity`)

        remainingQuantity -= quantityToPlace
        placedQuantity += quantityToPlace
      }

      console.log(`All orders placed successfully. Total: ${placedQuantity} quantity`)
      toastMessage.value = `Order(s) placed successfully for ${getSymbol(position)}`
      showToast.value = true

      // Add a delay before fetching updated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both orders and positions
      await updateOrdersAndPositions()

      // Update fund limits
      await updateFundLimits()
    } catch (error) {
      console.error('Failed to place order for position:', error)
      toastMessage.value = 'Failed to place order for SL/Target'
      showToast.value = true
    }
  }
  const simulatePaperTradingOrder = (orderData) => {
    const orderId = uuidv4()
    const order = {
      ...orderData,
      orderId,
      status: 'COMPLETE',
      orderTimestamp: new Date().toISOString(),
      lastUpdateTimestamp: new Date().toISOString(),
      averagePrice: parseFloat(orderData.prc) || getMasterSymbolPrice()
    }

    paperTradingOrderBook.value.push(order)

    const trade = {
      tradeId: uuidv4(),
      orderId,
      exchangeOrderId: `PaperTrade-${orderId}`,
      tradingSymbol: order.tsym,
      tradeTimestamp: new Date().toISOString(),
      quantity: parseInt(order.qty),
      tradePrice: order.averagePrice,
      product: order.prd,
      ctcl: '',
      remarks: 'Paper Trading Simulated Trade'
    }

    paperTradingTradeBook.value.push(trade)

    updatePaperTradingPosition(order)
    savePaperTradingData()

    return { data: { stat: 'Ok', norenordno: orderId } }
  }
  const updatePaperTradingPosition = (order) => {
    const existingPosition = paperTradingPositionBook.value.find(
      (pos) => pos.tsym === order.tsym && pos.prd === order.prd
    )

    if (existingPosition) {
      const quantity = parseInt(order.qty) * (order.trantype === 'B' ? 1 : -1)
      existingPosition.netqty = (parseInt(existingPosition.netqty) + quantity).toString()
      existingPosition.daybuyqty = (
        parseInt(existingPosition.daybuyqty) + (order.trantype === 'B' ? parseInt(order.qty) : 0)
      ).toString()
      existingPosition.daysellqty = (
        parseInt(existingPosition.daysellqty) + (order.trantype === 'S' ? parseInt(order.qty) : 0)
      ).toString()
      existingPosition.ltp = order.averagePrice.toString()
      // Update other fields as needed
    } else {
      const newPosition = {
        tsym: order.tsym,
        exch: order.exch,
        prd: order.prd,
        netqty: order.trantype === 'B' ? order.qty : (-parseInt(order.qty)).toString(),
        daybuyqty: order.trantype === 'B' ? order.qty : '0',
        daysellqty: order.trantype === 'S' ? order.qty : '0',
        ltp: order.averagePrice.toString()
        // Add other necessary fields
      }
      paperTradingPositionBook.value.push(newPosition)
    }
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
  const updateTradingSymbol = (order) => {
    const strikes = order.optionType === 'CALL' ? callStrikes.value : putStrikes.value
    const newStrike = strikes.find((strike) => strike.strikePrice === order.strikePrice)
    if (newStrike) {
      order.tradingSymbol = newStrike.tradingSymbol
    } else {
      // If no matching strike is found, construct the new trading symbol
      const regex = /^(\w+)(\d{2})([A-Z]{3})(\d{2})([CP])(\d+)$/
      const match = order.tradingSymbol.match(regex)

      if (match) {
        const [, index, year, month, date, optionType] = match
        order.tradingSymbol = `${index}${year}${month}${date}${optionType}${order.strikePrice}`
      }
    }

    // Update the formatted display of the trading symbol
    order.formattedTradingSymbol = formatTradingSymbol(order.tradingSymbol)
  }
  const closeAllPositions = async () => {
    try {
      let positionsClosed = false

      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const sortedPositions = [...flatTradePositionBook.value].sort(
          (a, b) => Number(b.netqty) - Number(a.netqty)
        )
        for (const position of sortedPositions) {
          const netqty = Number(position.netqty)
          if (netqty !== 0) {
            const transactionType = netqty > 0 ? 'S' : 'B'
            const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
            await placeOrderForPosition(transactionType, optionType, position)
            positionsClosed = true
          }
        }
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const sortedPositions = [...shoonyaPositionBook.value].sort(
          (a, b) => Number(b.netqty) - Number(a.netqty)
        )
        for (const position of sortedPositions) {
          const netqty = Number(position.netqty)
          if (netqty !== 0) {
            const transactionType = netqty > 0 ? 'S' : 'B'
            const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
            await placeOrderForPosition(transactionType, optionType, position)
            positionsClosed = true
          }
        }
      }

      // Add a delay before fetching updated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both orders and positions
      await updateOrdersAndPositions()

      // Update fund limits
      await updateFundLimits()

      if (positionsClosed) {
        toastMessage.value = `All ${selectedBroker.value?.brokerName} positions closed successfully`
      } else {
        toastMessage.value = `No positions to close for ${selectedBroker.value?.brokerName}`
      }
      showToast.value = true
    } catch (error) {
      console.error('Error closing positions:', error)
      toastMessage.value = 'Failed to close all positions'
      showToast.value = true
    }
  }
  const closeSelectedPositions = async () => {
    try {
      let positionsClosed = false

      if (selectedBroker.value?.brokerName === 'Shoonya') {
        // Create a copy of the selected positions to iterate over
        const positionsToClose = [...selectedShoonyaPositionsSet.value]

        for (const tsym of positionsToClose) {
          const position = shoonyaPositionBook.value.find((p) => p.tsym === tsym)
          const netqty = Number(position.netqty)
          if (netqty !== 0) {
            const transactionType = netqty > 0 ? 'S' : 'B'
            const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
            await placeOrderForPosition(transactionType, optionType, position)
            positionsClosed = true

            // Remove the closed position from the selected positions
            selectedShoonyaPositionsSet.value.delete(tsym)
          }
        }
      } else if (selectedBroker.value?.brokerName === 'Flattrade') {
        // Create a copy of the selected positions to iterate over
        const positionsToClose = [...selectedFlattradePositionsSet.value]

        for (const tsym of positionsToClose) {
          const position = flatTradePositionBook.value.find((p) => p.tsym === tsym)
          const netqty = Number(position.netqty)
          if (netqty !== 0) {
            const transactionType = netqty > 0 ? 'S' : 'B'
            const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
            await placeOrderForPosition(transactionType, optionType, position)
            positionsClosed = true

            // Remove the closed position from the selected positions
            selectedFlattradePositionsSet.value.delete(tsym)
          }
        }
      }

      // Add a delay before fetching updated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update both orders and positions
      await updateOrdersAndPositions()

      // Update fund limits
      await updateFundLimits()

      if (positionsClosed) {
        toastMessage.value = `Selected positions closed successfully`
      } else {
        toastMessage.value = `No positions to close`
      }
      showToast.value = true
    } catch (error) {
      console.error('Error closing selected positions:', error)
      toastMessage.value = 'Failed to close selected positions'
      showToast.value = true
    }
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
  const cancelOrder = async (order) => {
    const orderId = order.norenordno
    const orderStatus = order.status

    console.log(`Attempting to cancel order ${orderId} with status ${orderStatus}`)
    // console.log(`Broker: ${selectedBroker.value?.brokerName}`);

    if (orderStatus !== 'OPEN') {
      console.log(`Order ${orderId} is not in a cancellable state and cannot be canceled.`)
      return
    }

    try {
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value
        const clientId = selectedBroker.value.clientId
        console.log(`Sending request to cancel Flattrade order ${orderId}`)
        await axios.post(
          `${BASE_URL}/flattrade/cancelOrder`,
          {
            norenordno: orderId,
            uid: clientId
          },
          {
            params: {
              FLATTRADE_API_TOKEN: jKey
            }
          }
        )
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value
        const clientId = selectedBroker.value.clientId
        console.log(`Sending request to cancel Shoonya order ${orderId}`)
        await axios.post(
          `${BASE_URL}/shoonya/cancelOrder`,
          {
            norenordno: orderId,
            uid: clientId
          },
          {
            params: {
              SHOONYA_API_TOKEN: jKey
            }
          }
        )
      }
      console.log(`Order ${orderId} canceled successfully.`)
      // Update fund limits
      await updateFundLimits()
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error)
      toastMessage.value = 'Failed to cancel order'
      showToast.value = true
      throw error // Rethrow to handle in cancelPendingOrders
    }
  }
  const cancelPendingOrders = async () => {
    // Fetch orders based on the selected broker
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      await fetchFlattradeOrdersTradesBook()
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      await fetchShoonyaOrdersTradesBook()
    }

    let pendingOrders
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      pendingOrders = flatOrderBook.value.filter((order) => order.status === 'OPEN')
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      pendingOrders = shoonyaOrderBook.value.filter((order) => order.status === 'OPEN')
    } else {
      console.error('Unknown broker')
      return
    }

    const cancelPromises = pendingOrders.map((order) => cancelOrder(order))
    console.log(`Canceling pending orders for broker: ${selectedBroker.value?.brokerName}`) // placed here to prevent delay and debugging if required
    console.log(`Pending orders:`, pendingOrders) // placed here to prevent delay and debugging if required

    try {
      await Promise.all(cancelPromises)
      toastMessage.value = 'Pending orders canceled successfully'
      showToast.value = true

      // Refresh the orders list based on the selected broker
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        await fetchFlattradeOrdersTradesBook()
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        await fetchShoonyaOrdersTradesBook()
      }
    } catch (error) {
      console.error('Failed to cancel orders:', error)
      toastMessage.value = 'Failed to cancel some orders'
      showToast.value = true
    }
  }
  const formatPrice = (price) => {
    if (price == null || isNaN(price)) {
      return '-'
    }
    const numPrice = Number(price)
    return numPrice.toFixed(2)
  }
  const getSymbol = (position) => {
    return position.tsym || position.tradingSymbol || ''
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
  const cycleClockEmoji = () => {
    const currentHour = new Date().getHours()
    let index = currentHour % clockEmojis.length
    let cycles = 0

    const interval = setInterval(() => {
      currentClockEmoji.value = clockEmojis[index]
      index = (index + 1) % clockEmojis.length

      if (index === currentHour % clockEmojis.length) {
        cycles += 1
      }

      if (cycles === 1 && index === currentHour % clockEmojis.length) {
        // Complete one full cycle
        clearInterval(interval)
        currentClockEmoji.value = clockEmojis[currentHour % clockEmojis.length] // Ensure it ends at the current hour
      }
    }, 100) // Adjust the interval time for desired speed
  }
  const setFlattradeCredentials = async () => {
    try {
      if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
        toastMessage.value = 'Realtime LTP data only available for Flattrade'
        showToast.value = true
        return
      }

      // Check if the broker status is 'Connected'
      if (brokerStatus.value !== 'Connected') {
        console.error('Flattrade broker is not connected')
        toastMessage.value = 'Flattrade broker is not connected'
        showToast.value = true
        return
      }

      const clientId = selectedBroker.value.clientId
      const apiToken = localStorage.getItem('FLATTRADE_API_TOKEN')

      if (!clientId || !apiToken) {
        console.error('Flattrade client ID or API token is missing')
        toastMessage.value = 'Flattrade credentials are missing'
        showToast.value = true
        return
      }

      const response = await axios.post(`${BASE_URL}/flattrade/setCredentials`, {
        usersession: apiToken,
        userid: clientId
      })
      // console.log('Credentials set successfully:', response.data);
      // toastMessage.value = 'Flattrade changes set successfully';
      // showToast.value = true;
    } catch (error) {
      console.error('Error setting credentials :', error)
      toastMessage.value = 'Failed to set Flattrade credentials'
      showToast.value = true
    }
  }
  const setShoonyaCredentials = async () => {
    try {
      if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
        toastMessage.value = 'Realtime LTP data only available for Shoonya'
        showToast.value = true
        return
      }

      // Check if the broker status is 'Connected'
      if (brokerStatus.value !== 'Connected') {
        console.error('Flattrade broker is not connected')
        toastMessage.value = 'Flattrade broker is not connected'
        showToast.value = true
        return
      }

      const clientId = selectedBroker.value.clientId
      const apiToken = localStorage.getItem('SHOONYA_API_TOKEN')

      if (!clientId || !apiToken) {
        console.error('Shoonya client ID or API token is missing')
        toastMessage.value = 'Shoonya credentials are missing'
        showToast.value = true
        return
      }

      const response = await axios.post(`${BASE_URL}/shoonya/setCredentials`, {
        usersession: apiToken,
        userid: clientId
      })
      // console.log('Credentials set successfully:', response.data);
      // toastMessage.value = 'Shoonya changes set successfully';
      // showToast.value = true;
    } catch (error) {
      console.error('Error setting credentials: ', error)
      toastMessage.value = 'Failed to set Shoonya credentials'
      showToast.value = true
    }
  }
  const setPaperTradingCredentials = async () => {
    try {
      if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'PaperTrading') {
        toastMessage.value = 'PaperTrading broker is not selected'
        showToast.value = true
        return
      }

      // Check if the broker status is 'Connected'
      if (brokerStatus.value !== 'Connected') {
        console.error('PaperTrading broker is not connected')
        toastMessage.value = 'PaperTrading broker is not connected'
        showToast.value = true
        return
      }

      const clientId = selectedBroker.value.clientId
      const apiKey = selectedBroker.value.apiKey

      if (!clientId || !apiKey) {
        console.error('PaperTrading client ID or API key is missing')
        toastMessage.value = 'PaperTrading credentials are missing'
        showToast.value = true
        return
      }

      // Get the selected broker for paper trading
      const selectedPaperBroker = localStorage.getItem('selectedBrokerForPaper')
      if (!selectedPaperBroker) {
        console.error('No broker selected for paper trading')
        toastMessage.value = 'No broker selected for paper trading'
        showToast.value = true
        return
      }

      // Set credentials based on the selected broker
      if (selectedPaperBroker.brokerName === 'Flattrade') {
        await setFlattradeCredentials()
      } else if (selectedPaperBroker.brokerName === 'Shoonya') {
        await setShoonyaCredentials()
      }
      toastMessage.value = 'PaperTrading credentials set successfully'
      showToast.value = true
    } catch (error) {
      console.error('Error setting PaperTrading credentials:', error)
      toastMessage.value = 'Failed to set PaperTrading credentials'
      showToast.value = true
    }
  }
  const connectWebSocket = () => {
    let websocketUrl

    if (selectedBroker.value?.brokerName === 'Flattrade' && brokerStatus.value === 'Connected') {
      websocketUrl = 'ws://localhost:8765'
    } else if (
      selectedBroker.value?.brokerName === 'Shoonya' &&
      brokerStatus.value === 'Connected'
    ) {
      websocketUrl = 'ws://localhost:8766'
    } else if (
      selectedBroker.value?.brokerName === 'PaperTrading' &&
      brokerStatus.value === 'Connected'
    ) {
      const selectedPaperBroker = JSON.parse(localStorage.getItem('selectedBrokerForPaper') || '{}')
      if (selectedPaperBroker.brokerName === 'Flattrade') {
        websocketUrl = 'ws://localhost:8765'
      } else if (selectedPaperBroker.brokerName === 'Shoonya') {
        websocketUrl = 'ws://localhost:8766'
      } else {
        console.error('Invalid broker selected for paper trading')
        return
      }
    }

    console.log(`Connecting to WebSocket at ${websocketUrl}`)
    socket.value = new WebSocket(websocketUrl)

    socket.value.onmessage = handleWebSocketMessage
    socket.value.onerror = handleWebSocketError
    socket.value.onopen = handleWebSocketOpen
    socket.value.onclose = handleWebSocketClose
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
  const currentSubscriptions = ref({
    masterSymbol: null,
    callOption: null,
    putOption: null
  })
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
  const subscribeToOptions = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const symbolsToSubscribe = []
      const exchangeSegment = getExchangeSegment()

      // Add subscriptions for Call and Put options
      if (
        defaultCallSecurityId.value &&
        defaultCallSecurityId.value !== 'N/A' &&
        defaultCallSecurityId.value !== currentSubscriptions.value.callOption
      ) {
        symbolsToSubscribe.push(`${exchangeSegment}|${defaultCallSecurityId.value}`)
      }
      if (
        defaultPutSecurityId.value &&
        defaultPutSecurityId.value !== 'N/A' &&
        defaultPutSecurityId.value !== currentSubscriptions.value.putOption
      ) {
        symbolsToSubscribe.push(`${exchangeSegment}|${defaultPutSecurityId.value}`)
      }

      if (symbolsToSubscribe.length > 0) {
        const data = {
          action: 'subscribe',
          symbols: symbolsToSubscribe
        }
        socket.value.send(JSON.stringify(data))
        currentSubscriptions.value.callOption = defaultCallSecurityId.value
        currentSubscriptions.value.putOption = defaultPutSecurityId.value
        getOrderMargin()
      }

      if (additionalSymbols.value) {
        additionalStrikes.value.forEach((strike) => {
          const callStrike = callStrikes.value.find((s) => s.strikePrice === strike)
          const putStrike = putStrikes.value.find((s) => s.strikePrice === strike)

          if (callStrike) subscribeToLTP(callStrike.securityId, updateAdditionalStrikeLTP)
          if (putStrike) subscribeToLTP(putStrike.securityId, updateAdditionalStrikeLTP)
        })
      }
    }

    // Subscribe to position LTPs separately
    subscribeToPositionLTPs()
  }
  const updatePositionSecurityIds = () => {
    flatTradePositionBook.value.forEach((position) => {
      if (position.tsym && !positionSecurityIds.value[position.tsym]) {
        positionSecurityIds.value[position.tsym] = position.token
      }
    })
    // Add this block for Shoonya positions
    shoonyaPositionBook.value.forEach((position) => {
      if (position.tsym && !positionSecurityIds.value[position.tsym]) {
        positionSecurityIds.value[position.tsym] = position.token
      }
    })
  }
  const subscribeToPositionLTPs = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const symbolsToSubscribe = Object.entries(positionSecurityIds.value)
        .map(([tsym, token]) => {
          const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(
            (p) => p.tsym === tsym
          )

          if (!position) {
            // console.warn(`No position found for tsym: ${tsym}`);
            return null
          }

          const exchange = position.exch || position.exchangeSegment
          return `${exchange}|${token}`
        })
        .filter(Boolean)

      if (symbolsToSubscribe.length > 0) {
        const data = {
          action: 'subscribe',
          symbols: symbolsToSubscribe
        }
        // console.log('Sending position LTPs subscribe data:', data);
        socket.value.send(JSON.stringify(data))
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
  const subscribeToLTP = (securityId, callback) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      const exchangeSegment = getExchangeSegment()
      const symbolToSubscribe = `${exchangeSegment}|${securityId}`
      const data = {
        action: 'subscribe',
        symbols: [symbolToSubscribe]
      }
      socket.value.send(JSON.stringify(data))

      // Store the callback for this security ID
      ltpCallbacks.value[securityId] = callback
    }
  }
  const updateAdditionalStrikeLTP = (data) => {
    const callStrike = callStrikes.value.find((s) => s.securityId === data.tk)
    const putStrike = putStrikes.value.find((s) => s.securityId === data.tk)

    if (callStrike) {
      additionalStrikeLTPs.value.call[callStrike.strikePrice] = data.lp
    } else if (putStrike) {
      additionalStrikeLTPs.value.put[putStrike.strikePrice] = data.lp
    }
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
  // Helper function to get the correct price for the selected master symbol
  const getMasterSymbolPrice = () => {
    switch (selectedMasterSymbol.value) {
      case 'NIFTY':
        return parseFloat(niftyPrice.value)
      case 'BANKNIFTY':
        return parseFloat(bankNiftyPrice.value)
      case 'FINNIFTY':
        return parseFloat(finniftyPrice.value)
      case 'MIDCPNIFTY':
        return parseFloat(midcpniftyPrice.value)
      case 'SENSEX':
        return parseFloat(sensexPrice.value)
      case 'BANKEX':
        return parseFloat(bankexPrice.value)
      default:
        return 0
    }
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
  const setStoploss = (position, type) => {
    if (!enableStoploss.value) {
      console.log('Stoploss is disabled.')
      return
    }
    const quantity = Math.abs(Number(position.netQty || position.netqty))

    if (quantity === 0) {
      console.log(`Quantity is zero for ${position.tsym}, no stoploss will be set.`)
      return
    }

    const ltp = parseFloat(positionLTPs.value[position.tsym])
    if (isNaN(ltp)) {
      console.error(`Invalid LTP for ${position.tsym}: ${positionLTPs.value[position.tsym]}`)
      return
    }

    const stoplossValueNum = parseFloat(stoplossValue.value)
    if (isNaN(stoplossValueNum)) {
      console.error(`Invalid stoploss value: ${stoplossValue.value}`)
      return
    }

    const isLongPosition = position.netqty > 0
    let stoplossPrice

    try {
      switch (type) {
        case 'trailing':
          stoplossPrice = isLongPosition ? ltp - stoplossValueNum : ltp + stoplossValueNum
          trailingStoplosses.value[position.tsym] = parseFloat(stoplossPrice.toFixed(2))
          stoplosses.value[position.tsym] = null
          console.log(`TSL set for ${position.tsym}: ${stoplossPrice.toFixed(2)}`)
          break
        case 'static':
          stoplossPrice = isLongPosition ? ltp - stoplossValueNum : ltp + stoplossValueNum
          stoplosses.value[position.tsym] = parseFloat(stoplossPrice.toFixed(2))
          trailingStoplosses.value[position.tsym] = null
          console.log(`SL set for ${position.tsym}: ${stoplossPrice.toFixed(2)}`)
          break
        case 'convert_to_tsl':
          const existingSL = stoplosses.value[position.tsym]
          if (existingSL !== null) {
            trailingStoplosses.value[position.tsym] = existingSL
            stoplosses.value[position.tsym] = null
            console.log(`Converted SL to TSL for ${position.tsym}: ${existingSL.toFixed(2)}`)
          } else {
            console.error(`No existing SL to convert for ${position.tsym}`)
            return
          }
          break
        case 'convert_to_sl':
          const existingTSL = trailingStoplosses.value[position.tsym]
          if (existingTSL !== null) {
            stoplosses.value[position.tsym] = existingTSL
            trailingStoplosses.value[position.tsym] = null
            console.log(`Converted TSL to SL for ${position.tsym}: ${existingTSL.toFixed(2)}`)
          } else {
            console.error(`No existing TSL to convert for ${position.tsym}`)
            return
          }
          break
        default:
          console.error(`Unknown stoploss type: ${type}`)
          return
      }
      tslHitPositions.delete(position.tsym)
    } catch (error) {
      console.error(`Error setting ${type} stoploss for ${position.tsym}:`, error)
    }
  }
  const removeStoploss = (position) => {
    stoplosses.value[position.tsym] = null
    trailingStoplosses.value[position.tsym] = null
    tslHitPositions.delete(position.tsym)
  }
  const increaseStoploss = (position) => {
    if (stoplosses.value[position.tsym] !== null) {
      stoplosses.value[position.tsym] = Number((stoplosses.value[position.tsym] + 0.5).toFixed(2))
    }
  }

  const decreaseStoploss = (position) => {
    if (stoplosses.value[position.tsym] !== null) {
      stoplosses.value[position.tsym] = Number((stoplosses.value[position.tsym] - 0.5).toFixed(2))
    }
  }
  const setTarget = (position) => {
    if (!enableTarget.value) {
      console.log('Target is disabled.')
      return
    }
    const quantity = Math.abs(Number(position.netQty || position.netqty))

    if (quantity === 0) {
      console.log(`Quantity is zero for ${position.tsym}, no target will be set.`)
      return
    }

    if (enableTarget.value && targetValue.value > 0) {
      const ltp = positionLTPs.value[position.tsym]

      // Set target above the LTP for all positions, rounded to 2 decimal places
      targets.value[position.tsym] = Number(
        (parseFloat(ltp) + parseFloat(targetValue.value)).toFixed(2)
      )

      // console.log(`Target set for ${position.tsym}: LTP = ${ltp}, TargetValue = ${targetValue.value}, Target = ${targets.value[position.tsym]}`);
    } else {
      // If target is not enabled or targetValue is not set, remove any existing target
      targets.value[position.tsym] = null
      // console.log(`Target removed for ${position.tsym}`);
    }
  }
  const removeTarget = (position) => {
    targets.value[position.tsym] = null
  }
  const increaseTarget = (position) => {
    if (targets.value[position.tsym] !== null) {
      targets.value[position.tsym] += 0.5 // Adjust increment value as needed
    }
  }
  const decreaseTarget = (position) => {
    if (targets.value[position.tsym] !== null) {
      targets.value[position.tsym] -= 0.5 // Adjust decrement value as needed
    }
  }

  const checkTargets = (newLTPs) => {
    if (!enableTarget.value) {
      // console.log('Target is disabled.');
      return
    }
    // console.log('Checking targets...');
    const validTargets = Object.entries(targets.value).filter(
      ([tsym, target]) => target !== null && target !== undefined
    )

    if (validTargets.length === 0) {
      // console.log('No valid targets set. Skipping check.');
      return
    }

    for (const [tsym, target] of validTargets) {
      const currentLTP = positionLTPs.value[tsym]
      const position = [
        ...flatTradePositionBook.value,
        ...shoonyaPositionBook.value,
        ...paperTradingPositionBook.value
      ].find((p) => p.tsym === tsym)

      // console.log(`Checking target for ${tsym}: Current LTP = ${currentLTP}, Target = ${target}`);
      if (position && currentLTP) {
        const isLongPosition = position.netqty > 0
        if ((isLongPosition && currentLTP >= target) || (!isLongPosition && currentLTP <= target)) {
          console.log(`Target reached for ${tsym}. Placing order to close position.`)
          const transactionType = isLongPosition ? 'S' : 'B'
          placeOrderForPosition(
            transactionType,
            position.tsym.includes('C') ? 'CALL' : 'PUT',
            position
          )
          removeTarget(position)
          toastMessage.value = 'Target hit for ' + tsym
          showToast.value = true
        }
      }
    }
  }
  const checkStoplosses = () => {
    if (!enableStoploss.value) {
      // console.log('Stoploss is disabled.');
      return
    }

    const stoplossValueNum = parseFloat(stoplossValue.value)
    if (isNaN(stoplossValueNum)) {
      console.error(`Invalid stoploss value: ${stoplossValue.value}`)
      return
    }

    // Check static stoplosses
    for (const [tsym, sl] of Object.entries(stoplosses.value)) {
      if (sl !== null && positionLTPs.value[tsym] !== undefined) {
        const position = [
          ...flatTradePositionBook.value,
          ...shoonyaPositionBook.value,
          ...paperTradingPositionBook.value
        ].find((p) => p.tsym === tsym)
        if (position) {
          const isLongPosition = position.netqty > 0
          const currentLTP = parseFloat(positionLTPs.value[tsym])
          if (isNaN(currentLTP)) {
            console.error(`Invalid LTP for ${tsym}: ${positionLTPs.value[tsym]}`)
            continue
          }
          if ((isLongPosition && currentLTP <= sl) || (!isLongPosition && currentLTP >= sl)) {
            console.log(`Static SL hit for ${tsym}: LTP ${currentLTP}, SL ${sl}`)
            placeOrderForPosition(
              isLongPosition ? 'S' : 'B',
              position.tsym.includes('C') ? 'CALL' : 'PUT',
              position
            )
            removeStoploss(position)
            toastMessage.value = 'Stoploss hit for ' + tsym
            showToast.value = true
          }
        }
      }
    }

    // Check trailing stoplosses
    for (const [tsym, tsl] of Object.entries(trailingStoplosses.value)) {
      if (tsl !== null && positionLTPs.value[tsym] !== undefined) {
        const position = [
          ...flatTradePositionBook.value,
          ...shoonyaPositionBook.value,
          ...paperTradingPositionBook.value
        ].find((p) => p.tsym === tsym)
        if (position) {
          const isLongPosition = position.netqty > 0
          const currentLTP = parseFloat(positionLTPs.value[tsym])
          if (isNaN(currentLTP)) {
            console.error(`Invalid LTP for ${tsym}: ${positionLTPs.value[tsym]}`)
            continue
          }

          if (isLongPosition) {
            if (currentLTP > tsl + stoplossValueNum) {
              // Update TSL for long positions
              trailingStoplosses.value[tsym] = parseFloat(
                (currentLTP - stoplossValueNum).toFixed(2)
              )
            } else if (currentLTP <= tsl && !tslHitPositions.has(tsym)) {
              // Hit TSL for long positions
              console.log(`TSL hit for ${tsym}: LTP ${currentLTP}, TSL ${tsl}`)
              placeOrderForPosition('S', position.tsym.includes('C') ? 'CALL' : 'PUT', position)
              removeStoploss(position)
              toastMessage.value = 'Trailing Stoploss hit for ' + tsym
              showToast.value = true
              tslHitPositions.add(tsym) // Mark TSL as hit
            }
          } else {
            if (currentLTP < tsl - stoplossValueNum) {
              // Update TSL for short positions
              trailingStoplosses.value[tsym] = parseFloat(
                (currentLTP + stoplossValueNum).toFixed(2)
              )
            } else if (currentLTP >= tsl && !tslHitPositions.has(tsym)) {
              // Hit TSL for short positions
              console.log(`TSL hit for ${tsym}: LTP ${currentLTP}, TSL ${tsl}`)
              placeOrderForPosition('B', position.tsym.includes('C') ? 'CALL' : 'PUT', position)
              removeStoploss(position)
              toastMessage.value = 'Trailing Stoploss hit for ' + tsym
              showToast.value = true
              tslHitPositions.add(tsym) // Mark TSL as hit
            }
          }
        }
      }
    }
  }
  const checkStoplossesAndTargets = () => {
    checkStoplosses()
    checkTargets()
  }

  const fetchPaperTradingPositions = async () => {
    console.log('Fetching paper trading positions...')
    const positions = JSON.parse(localStorage.getItem('paperTradingPositions') || '[]')
    console.log('Fetched paper trading positions:', positions)
    paperTradingPositionBook.value = positions || [] // Ensure it's always an array
    console.log('Updated paperTradingPositionBook:', paperTradingPositionBook.value)
    updatePositionSecurityIds()
    subscribeToPositionLTPs()
    subscribeToOptions()
  }

  const fetchPaperTradingOrdersTradesBook = async () => {
    const orders = JSON.parse(localStorage.getItem('paperTradingOrders') || '[]')
    const trades = JSON.parse(localStorage.getItem('paperTradingTrades') || '[]')
    paperTradingOrderBook.value = orders
    paperTradingTradeBook.value = trades
  }
  const savePaperTradingData = () => {
    localStorage.setItem('paperTradingPositions', JSON.stringify(paperTradingPositionBook.value))
    localStorage.setItem('paperTradingOrders', JSON.stringify(paperTradingOrderBook.value))
    localStorage.setItem('paperTradingTrades', JSON.stringify(paperTradingTradeBook.value))
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
  // When saving the selected broker for paper trading
  const saveSelectedBrokerForPaper = () => {
    if (selectedBrokerForPaper.value) {
      localStorage.setItem(
        'selectedBrokerForPaper',
        JSON.stringify({
          brokerName: selectedBrokerForPaper.value.brokerName,
          clientId: selectedBrokerForPaper.value.clientId
        })
      )
      toastMessage.value = 'Selected broker for paper trading saved'
      showToast.value = true
    } else {
      toastMessage.value = 'Please select a broker for paper trading'
      showToast.value = true
    }
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
  function ManageBrokerMaskClientId(brokerClientId) {
    if (!brokerClientId) return brokerClientId // Ensure brokerClientId is defined and not a placeholder

    const length = brokerClientId.length
    if (length <= 2) return brokerClientId // If the length is 2 or less, return as is

    const maskLength = Math.max(1, Math.floor(length / 2)) // Mask at least 1 character, up to half the length
    const startUnmaskedLength = Math.ceil((length - maskLength) / 2)
    const endUnmaskedLength = length - startUnmaskedLength - maskLength

    const firstPart = brokerClientId.slice(0, startUnmaskedLength)
    const lastPart = brokerClientId.slice(-endUnmaskedLength)
    const middleMask = '*'.repeat(maskLength) // Mask middle portion dynamically

    return `${firstPart}${middleMask}${lastPart}`
  }

  const getStatus = (broker) => {
    if (!broker || !broker.brokerName) {
      return { status: 'Unknown', statusClass: 'bg-secondary' }
    }

    const status = getBrokerStatus(broker.brokerName)
    let statusText = 'Activated'
    let statusClass = 'bg-success'

    if (status === 'Token missing') {
      statusText = `Token missing, Click ${broker.brokerName === 'Shoonya' ? 'Login' : 'generate'}`
      statusClass = 'bg-warning text-dark'
    } else if (status === 'expired') {
      statusText = `Token Expired, Click ${broker.brokerName === 'Shoonya' ? 'Login' : 'generate'}`
      statusClass = 'bg-warning text-dark'
    }

    return { status: statusText, statusClass }
  }

  function maskTokenSecret(apiSecret) {
    if (!apiSecret || apiSecret.length < 10) return apiSecret // Ensure there are enough characters to mask and not a placeholder

    const start = apiSecret.slice(0, 3)
    const end = apiSecret.slice(-3)
    return `${start}******${end}`
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

      const response = await axios.post('/shoonyaApi/NorenWClientTP/QuickAuth', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

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

  const deleteBroker = (broker) => {
    // Remove broker details from localStorage
    localStorage.removeItem(`broker_${broker.brokerName}`)

    // Remove API token from localStorage if it exists
    if (broker.brokerName === 'Flattrade') {
      localStorage.removeItem('FLATTRADE_API_TOKEN')
      FLATTRADE_API_TOKEN.value = ''
      FLATTRADE_API_KEY.value = ''
      FLATTRADE_API_SECRET.value = ''
      FLATTRADE_CLIENT_ID.value = ''
    } else if (broker.brokerName === 'Shoonya') {
      localStorage.removeItem('SHOONYA_API_TOKEN')
      SHOONYA_API_TOKEN.value = ''
      SHOONYA_API_KEY.value = ''
      SHOONYA_CLIENT_ID.value = ''
    } else if (broker.brokerName === 'PaperTrading') {
      localStorage.removeItem('PAPERTRADING_API_TOKEN')
      PAPERTRADING_API_KEY.value = ''
      PAPERTRADING_CLIENT_ID.value = ''
    }

    // Update the brokers computed property
    // This will automatically update the table
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
    },
    PaperTrading: {
      positions: 'fetchPaperTradingPositions',
      trades: 'fetchPaperTradingOrdersTradesBook'
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
  const formatTradingSymbol = (symbol, excludeStrikePrice = false) => {
    if (!symbol) return ''

    const regex = /^(\w+)(\d{2})([A-Z]{3})(\d{2})([CP])(\d+)$/
    const match = symbol.match(regex)

    if (match) {
      const [, index, year, month, date, optionType, strikePrice] = match
      return `${index} ${date}${month}${year} ${optionType}${excludeStrikePrice ? '' : ' ' + strikePrice}`
    }

    return symbol
  }
  // ... (add all other methods here)

  // Watchers
  // Watch for changes in killSwitchRemainingTime
  watch(killSwitchRemainingTime, (newValue) => {
    if (newValue === '' && killSwitchActive.value) {
      toggleKillSwitch()
    }
  })
  // Watch for changes in remainingTimeInMs
  watch(remainingTimeInMs, (newValue) => {
    if (newValue === 0 && killSwitchActive.value) {
      toggleKillSwitch()
    }
  })
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
        if (selectedBroker.value?.brokerName === 'PaperTrading') {
          setPaperTradingCredentials()
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
          const position = [
            ...flatTradePositionBook.value,
            ...shoonyaPositionBook.value,
            ...paperTradingPositionBook.value
          ].find((p) => (p.tsym || p.tradingSymbol) === tsym)
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
  // Watch for changes in selectedBrokerForPaper and update localStorage
  watch(selectedBrokerForPaper, (newBroker) => {
    if (newBroker) {
      localStorage.setItem('selectedBrokerForPaper', JSON.stringify(newBroker))
      statusMessage.value = 'Selected broker for paper trading saved'
      setTimeout(() => {
        statusMessage.value = ''
      }, 3000)
    } else {
      localStorage.removeItem('selectedBrokerForPaper')
    }
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
        const res = await axios.post('/flattradeApi/trade/apitoken', payload)
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
  watch(paperTradingPositionBook, (newValue) => {
    console.log('paperTradingPositionBook changed:', newValue)
  })
  // ... (add all other watchers here)

  return {
    // Methods
    updateToastVisibility,
    setActiveTab,
    toggleKillSwitch,
    updateSelectedBroker,
    setFlattradeCredentials,
    setShoonyaCredentials,
    setPaperTradingCredentials,
    updateExchangeSymbols,
    setDefaultExchangeAndMasterSymbol,
    fetchTradingData,
    setDefaultExpiry,
    updateStrikesForExpiry,
    synchronizeCallStrikes,
    synchronizePutStrikes,
    updateAvailableQuantities,
    updateSelectedQuantity,
    saveUserChoice,
    saveLots,
    saveOffsets,
    saveExpiryOffset,
    updateSymbolData,
    fetchFundLimit,
    fetchFlattradePositions,
    fetchShoonyaPositions,
    fetchFlattradeOrdersTradesBook,
    fetchShoonyaOrdersTradesBook,
    fetchPaperTradingPositions,
    fetchPaperTradingOrdersTradesBook,
    handleHotKeys,
    placeOrder,
    placeOrderForPosition,
    closeAllPositions,
    calculateUnrealizedProfit,
    getProductTypeValue,
    getExchangeSegment,
    connectWebSocket,
    subscribeToMasterSymbol,
    subscribeToOptions,
    updateSubscriptions,
    updatePositionSecurityIds,
    checkOvertradeProtection,
    subscribeToLTP,
    updateAdditionalStrikeLTP,
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
    setStoploss,
    removeStoploss,
    increaseStoploss,
    decreaseStoploss,
    setTarget,
    removeTarget,
    increaseTarget,
    decreaseTarget,
    checkTargets,
    checkStoplosses,
    checkStoplossesAndTargets,
    initKillSwitch,
    formatDate,
    loadLots,
    handleOrderClick,
    formatTime,
    loadStrategy,
    placeBasketOrder,
    toggleOvertradeProtection,
    toggleExperimentalFeatures,
    setOrderDetails,
    cancelPendingOrders,
    handleKillSwitchClick,
    closeSelectedPositions,
    updateTradingSymbol,
    convertToComparableDate,
    resetOrderTypeIfNeeded,
    findNewPosition,
    setStrategyType,
    updateBasketOrderQuantity,
    removeFromBasket,
    placeBasket,
    placeAllBasketOrders,
    setReverseMode,
    reversePositions,
    formatPrice,
    selectedBrokerToDelete,
    copyToClipboard,
    saveSelectedBrokerForPaper,
    generateToken,
    getStatus,
    maskTokenSecret,
    handleShoonyaLogin,
    deleteBroker,
    ManageBrokerMaskClientId,
    formatTradingSymbol,
    setActiveFetchFunctionAndFetch,

    // Computed properties
    brokers,
    brokerStatus,
    isFormDisabled,
    remainingTimeInMs,
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
    putOpenMarkerPosition,
    additionalStrikes,

    // Reactive variables (from globalState)
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
    paperTradingPositionBook,
    fundLimits,
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
    allSymbolsData,
    selectedOrderType,
    previousOrderType,
    API_TOKEN,
    FLATTRADE_API_KEY,
    FLATTRADE_API_SECRET,
    FLATTRADE_CLIENT_ID,
    FLATTRADE_API_TOKEN,
    SHOONYA_API_KEY,
    SHOONYA_CLIENT_ID,
    SHOONYA_API_TOKEN,
    PAPERTRADING_API_KEY,
    PAPERTRADING_CLIENT_ID,
    selectedBrokerForPaper,
    flattradeReqCode,
    shoonyaBrokerUserId,
    shoonyaBrokerPassword,
    shoonyaOneTimePassword,
    errorMessage,
    statusMessage,
    userTriggeredTokenGeneration,
    saveSelectedBrokerForPaper,
    selectedBrokerToDelete,
    stickyMTM,
    savedStickyMTM
  }
}
