<template src="./TradeView.html"></template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, reactive } from 'vue';
import { checkAllTokens, getBrokerStatus, tokenStatus } from '@/utils/brokerTokenValidator';
import axios from 'axios';
import ToastAlert from '../components/ToastAlert.vue';
import qs from 'qs';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '@vueuse/core'; // Optional: for easier localStorage management



// Reactive Variables
const BASE_URL = 'http://localhost:3000';
const showLTPRangeBar = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const activeTab = ref('positions');
const killSwitchActive = ref(localStorage.getItem('KillSwitchStatus') === 'true');
const overtradeProtection = ref(localStorage.getItem('OvertradeProtection') === 'true');
const experimentalFeatures = ref(JSON.parse(localStorage.getItem('ExperimentalFeatures') || 'false'));
const activationTime = ref(parseInt(localStorage.getItem('KillSwitchActivationTime') || '0'));
const currentTime = ref(Date.now());
const enableHotKeys = ref(localStorage.getItem('EnableHotKeys') !== 'false');
const selectedBroker = ref(null);
const selectedBrokerName = ref('');
const selectedExchange = ref({});
const selectedMasterSymbol = ref('');
const selectedQuantity = ref(0);
const selectedExpiry = ref(null);
const selectedCallStrike = ref({});
const selectedPutStrike = ref({});
const callStrikeOffset = ref(localStorage.getItem('callStrikeOffset') || '0');
const putStrikeOffset = ref(localStorage.getItem('putStrikeOffset') || '0');
const expiryOffset = ref(localStorage.getItem('expiryOffset') || '0');
const exchangeSymbols = ref({});
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
const dataFetched = ref(false);
const lotsPerSymbol = ref({});
const flatOrderBook = ref([]);
const flatTradeBook = ref([]);
const token = ref('');
const shoonyaOrderBook = ref([]);
const shoonyaTradeBook = ref([]);
const flatTradePositionBook = ref([]);
const shoonyaPositionBook = ref([]);
const fundLimits = ref({});
const showBrokerClientId = ref(false);
const quantities = ref({
  NIFTY: { lotSize: 25, maxLots: 360, freezeLimit: 72 },
  BANKNIFTY: { lotSize: 15, maxLots: 300, freezeLimit: 60 },
  FINNIFTY: { lotSize: 25, maxLots: 360, freezeLimit: 72 },
  MIDCPNIFTY: { lotSize: 50, maxLots: 280, freezeLimit: 56 },
  SENSEX: { lotSize: 10, maxLots: 500, freezeLimit: 100 },
  BANKEX: { lotSize: 15, maxLots: 300, freezeLimit: 60 },
});
const availableQuantities = ref([]);

const selectedStrike = ref({});
const selectedProductType = ref('');
const limitPrice = ref(null);
const modalTransactionType = ref('');
const modalOptionType = ref('');
const selectedShoonyaPositionsSet = ref(new Set());
const selectedFlattradePositionsSet = ref(new Set());
const positionsInExecution = ref({});
const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
const currentClockEmoji = ref(clockEmojis[new Date().getHours() % clockEmojis.length]);
const socket = ref(null);
const latestCallLTP = ref('N/A');
const latestPutLTP = ref('N/A');
const defaultCallSecurityId = ref(null);
const defaultPutSecurityId = ref(null);
const positionLTPs = ref({});
const positionSecurityIds = ref({});
let timer;
let positionCheckInterval;
const totalRiskType = ref(null);
const totalRiskTypeToggle = ref(false);
const activeFetchFunction = ref(null);
const masterOpenPrice = ref(localStorage.getItem('masterOpenPrice') || null);
const masterHighPrice = ref(localStorage.getItem('masterHighPrice') || null);
const masterLowPrice = ref(localStorage.getItem('masterLowPrice') || null);
const masterClosePrice = ref(localStorage.getItem('masterClosePrice') || null);
const callOpenPrice = ref(localStorage.getItem('callOpenPrice') || null);
const callHighPrice = ref(localStorage.getItem('callHighPrice') || null);
const callLowPrice = ref(localStorage.getItem('callLowPrice') || null);
const callClosePrice = ref(localStorage.getItem('callClosePrice') || null);
const putOpenPrice = ref(localStorage.getItem('putOpenPrice') || null);
const putHighPrice = ref(localStorage.getItem('putHighPrice') || null);
const putLowPrice = ref(localStorage.getItem('putLowPrice') || null);
const putClosePrice = ref(localStorage.getItem('putClosePrice') || null);
const showOHLCValues = ref(false);
const showStrikeDetails = ref(false);
const reverseMode = ref('all');
const showBasketOrderModal = ref(false);
const additionalSymbols = ref(JSON.parse(localStorage.getItem('additionalSymbols') || 'false'));
const additionalStrikeLTPs = ref({
  call: {},
  put: {}
});
const ltpCallbacks = ref({});
const customStrikePrice = ref('');
const notificationSound = ref(localStorage.getItem('notificationSound') !== 'false');
const selectedSound = ref(localStorage.getItem('selectedSound'));
const riskClosingCountdown = ref(30);
const totalRiskTargetToggle = ref(JSON.parse(localStorage.getItem('totalRiskTargetToggle') || 'false'));
const totalRiskTargetType = ref(localStorage.getItem('totalRiskTargetType') || 'percentage');
const totalRiskAmount = ref(Number(localStorage.getItem('totalRiskAmount')) || 1500);
const totalRiskPercentage = ref(Number(localStorage.getItem('totalRiskPercentage')) || 1.5);
const totalTargetAmount = ref(Number(localStorage.getItem('totalTargetAmount')) || 3000);
const totalTargetPercentage = ref(Number(localStorage.getItem('totalTargetPercentage')) || 3);
const savedBaskets = ref([]);
const basketName = ref('');
const editingBasketId = ref(null);
const basketOrders = ref([]);
const closePositionsRisk = ref(JSON.parse(localStorage.getItem('closePositionsRisk') || 'false'));
const closePositionsTarget = ref(JSON.parse(localStorage.getItem('closePositionsTarget') || 'false'));
const strategyType = ref('Bullish');
const strategies = ref([
  { id: 1, name: 'Short Straddle', type: 'Neutral', image: '/strategies/short-straddle.svg' },
  { id: 2, name: 'Iron Butterfly', type: 'Neutral', image: '/strategies/iron-butterfly.svg' },
  { id: 3, name: 'Short Strangle', type: 'Neutral', image: '/strategies/short-strangle.svg' },
  { id: 4, name: 'Short Iron Condor', type: 'Neutral', image: '/strategies/short-iron-condor.svg' },
  { id: 5, name: 'Batman', type: 'Neutral', image: '/strategies/batman.svg' },
  { id: 6, name: 'Double Plateau', type: 'Neutral', image: '/strategies/double-plateau.svg' },
  { id: 7, name: 'Jade Lizard', type: 'Neutral', image: '/strategies/jade-lizard.svg' },
  { id: 8, name: 'Reverse Jade Lizard', type: 'Neutral', image: '/strategies/jade-reverse-lizard.svg' },
  { id: 9, name: 'Buy Put', type: 'Bearish', image: '/strategies/buy-put.svg' },
  { id: 10, name: 'Sell Call', type: 'Bearish', image: '/strategies/sell-call.svg' },
  { id: 11, name: 'Bear Call Spread', type: 'Bearish', image: '/strategies/bear-call-spread.svg' },
  { id: 12, name: 'Bear Put Spread', type: 'Bearish', image: '/strategies/bear-put-spread.svg' },
  { id: 13, name: 'Put Ratio Back Spread', type: 'Bearish', image: '/strategies/put-ratio-back-spread.svg' },
  { id: 14, name: 'Long Calendar with Puts', type: 'Bearish', image: '/strategies/long-calendar-with-puts.svg' },
  { id: 15, name: 'Bear Condor', type: 'Bearish', image: '/strategies/bear-condor.svg' },
  { id: 16, name: 'Bear Butterfly', type: 'Bearish', image: '/strategies/bear-butterfly.svg' },
  { id: 17, name: 'Buy Call', type: 'Bullish', image: '/strategies/buy-call.svg' },
  { id: 18, name: 'Sell Put', type: 'Bullish', image: '/strategies/sell-put.svg' },
  { id: 19, name: 'Bull Call Spread', type: 'Bullish', image: '/strategies/bull-call-spread.svg' },
  { id: 20, name: 'Bull Put Spread', type: 'Bullish', image: '/strategies/bull-put-spread.svg' },
  { id: 21, name: 'Call Ratio Back Spread', type: 'Bullish', image: '/strategies/call-ratio-back-spread.svg' },
  { id: 22, name: 'Long Calendar with Calls', type: 'Bullish', image: '/strategies/long-calendar-with-calls.svg' },
  { id: 23, name: 'Bull Condor', type: 'Bullish', image: '/strategies/bull-condor.svg' },
  { id: 24, name: 'Bull Butterfly', type: 'Bullish', image: '/strategies/bull-butterfly.svg' },
  { id: 25, name: 'Call Ratio Spread', type: 'Others', image: '/strategies/call-ratio-spread.svg' },
  { id: 26, name: 'Put Ratio Spread', type: 'Others', image: '/strategies/put-ratio-spread.svg' },
  { id: 27, name: 'Long Straddle', type: 'Others', image: '/strategies/long-straddle.svg' },
  { id: 28, name: 'Long Iron Butterfly', type: 'Others', image: '/strategies/long-iron-butterfly.svg' },
  { id: 29, name: 'Long Strangle', type: 'Others', image: '/strategies/long-strangle.svg' },
  { id: 30, name: 'Long Iron Condor', type: 'Others', image: '/strategies/long-iron-condor.svg' },
  { id: 31, name: 'Strip', type: 'Others', image: '/strategies/strip.svg' },
  { id: 32, name: 'Strap', type: 'Others', image: '/strategies/strap.svg' },

]);
const riskAction = ref(localStorage.getItem('riskAction') || 'close');
const targetAction = ref(localStorage.getItem('targetAction') || 'close');
const orderMargin = reactive({
  call: null,
  put: null
});
const limitOffset = ref(0);
const stoplosses = useLocalStorage('stoplosses', {});
const targets = useLocalStorage('targets', {});
const trailingStoplosses = useLocalStorage('trailingStoplosses', {});

const enableStoploss = useLocalStorage('enableStoploss', false);
const stoplossValue = useLocalStorage('stoplossValue', 10);
const enableTarget = useLocalStorage('enableTarget', false);
const targetValue = useLocalStorage('targetValue', 50);
const tslHitPositions = new Set();








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
    const availableFunds = cash === 0 ? payin : cash;

    const balance = Math.floor(availableFunds - marginUsed);
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
const symbolData = reactive({
  NIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26000', expiryDay: 4 }, // Thursday
  BANKNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26009', expiryDay: 3 }, // Wednesday
  FINNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26037', expiryDay: 2 }, // Tuesday
  MIDCPNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26074', expiryDay: 1 }, // Monday
  SENSEX: { exchangeCode: 'BSE', exchangeSecurityId: '1', expiryDay: 5 }, // Friday
  BANKEX: { exchangeCode: 'BSE', exchangeSecurityId: '12', expiryDay: null }, // No specific expiry day
});
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
  let response;
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    // response = await fetch(`${BASE_URL}/flattradeSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    response = await fetch(`${BASE_URL}/shoonyaSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    // console.log('Flattrade Symbols:', response);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    response = await fetch(`${BASE_URL}/shoonyaSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    // console.log('Shoonya Symbols:', response);
  } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
    response = await fetch(`${BASE_URL}/shoonyaSymbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${selectedMasterSymbol.value}`);
    // console.log('Paper Trading Symbols:', response);
  }
  else {
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
  // console.log('Updating strikes for expiry:', expiryDate);

  let filteredCallStrikes, filteredPutStrikes;

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    filteredCallStrikes = callStrikes.value.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = putStrikes.value.filter(strike => strike.expiryDate === expiryDate);
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    filteredCallStrikes = callStrikes.value.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = putStrikes.value.filter(strike => strike.expiryDate === expiryDate);
  } else if (selectedBroker.value?.brokerName === 'PaperTrading') {
    filteredCallStrikes = callStrikes.value.filter(strike => strike.expiryDate === expiryDate);
    filteredPutStrikes = putStrikes.value.filter(strike => strike.expiryDate === expiryDate);
  }

  // console.log('Filtered Call Strikes:', filteredCallStrikes);
  // console.log('Filtered Put Strikes:', filteredPutStrikes);

  // Change this condition to include forceUpdate
  if (forceUpdate || !selectedCallStrike.value.securityId || !selectedPutStrike.value.securityId || selectedCallStrike.value.expiryDate !== expiryDate) {
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
      const nearestStrikeIndex = filteredCallStrikes.findIndex(strike =>
        Math.abs(strike.strikePrice - currentPrice) === Math.min(...filteredCallStrikes.map(s => Math.abs(s.strikePrice - currentPrice)))
      );

      // Reverse the logic for call and put offsets
      const callOffsetIndex = nearestStrikeIndex - parseInt(callStrikeOffset.value);
      const putOffsetIndex = nearestStrikeIndex + parseInt(putStrikeOffset.value);

      selectedCallStrike.value = filteredCallStrikes[callOffsetIndex] || {};
      selectedPutStrike.value = filteredPutStrikes[putOffsetIndex] || {};
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
    const response = await axios.get(`${BASE_URL}/flattradeGetOrdersAndTrades`, {
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
    const response = await axios.get(`${BASE_URL}/shoonyaGetOrdersAndTrades`, {
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
      response = await axios.post(`${BASE_URL}/flattradeFundLimit`, null, {
        params: {
          FLATTRADE_API_TOKEN,
          FLATTRADE_CLIENT_ID: selectedBroker.value.clientId
        }
      });
      fundLimits.value = {
        cash: response.data.cash,
        marginused: response.data.marginused,
      };
    }
    else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
      if (!SHOONYA_API_TOKEN) {
        throw new Error('Shoonya API Token is missing');
      }
      response = await axios.post(`${BASE_URL}/shoonyaFundLimit`, null, {
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
        endpoint = `${BASE_URL}/flattradeGetOrderMargin`;
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
        endpoint = `${BASE_URL}/shoonyaGetOrderMargin`;
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
        console.log(`Order margin for ${type}:`, response.data);
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
    toastMessage.value = 'Failed to get order margin';
    showToast.value = true;
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
        response = await axios.post(`${BASE_URL}/flattradePlaceOrder`, payload, {
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
        response = await axios.post(`${BASE_URL}/shoonyaPlaceOrder`, payload, {
          headers: {
            'Authorization': `Bearer ${SHOONYA_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }

      console.log(`Placed order for ${lotsToPlace} lots (${quantityToPlace} quantity)`);
      console.log("Order placed successfully:", response.data);
      remainingLots -= lotsToPlace;
      placedLots += lotsToPlace;
    }

    console.log(`All orders placed successfully. Total: ${placedLots} lots (${fullOrderQuantity} quantity)`);
    toastMessage.value = `Order(s) placed successfully for ${placedLots} lots`;
    showToast.value = true;

    // Set target automatically if enabled
    if (enableTarget.value) {
      const newPosition = {
        tsym: selectedStrike.tradingSymbol,
        netqty: transactionType === 'B' ? fullOrderQuantity : -fullOrderQuantity,
        // Add any other necessary properties for the new position
      };
      await setTarget(newPosition);
    }

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits();

  } catch (error) {
    console.error("Error placing order:", error);
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
        response = await axios.post(`${BASE_URL}/flattradePlaceOrder`, payload, {
          headers: {
            'Authorization': `Bearer ${FLATTRADE_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      }
      else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN');
        const payload = qs.stringify(orderData);
        response = await axios.post(`${BASE_URL}/shoonyaPlaceOrder`, payload, {
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

    // Remove stoploss and target when closing the position
    removeStoploss(position);
    removeTarget(position);

    // Add a delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update both orders and positions
    await updateOrdersAndPositions();

    // Update fund limits
    await updateFundLimits();

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
      response = await axios.post(`${BASE_URL}/flattradePlaceOrder`, payload, {
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
      response = await axios.post(`${BASE_URL}/shoonyaPlaceOrder`, payload, {
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
      await axios.post(`${BASE_URL}/flattradeCancelOrder`, {
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
      await axios.post(`${BASE_URL}/shoonyaCancelOrder`, {
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

    const response = await axios.post(`${BASE_URL}/api/set-flattrade-credentials`, {
      usersession: apiToken,
      userid: clientId
    });
    // console.log('Credentials set successfully:', response.data);
    toastMessage.value = 'Flattrade changes set successfully';
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

    const response = await axios.post(`${BASE_URL}/api/set-shoonya-credentials`, {
      usersession: apiToken,
      userid: clientId
    });
    // console.log('Credentials set successfully:', response.data);
    toastMessage.value = 'Shoonya changes set successfully';
    showToast.value = true;
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
const checkAndShowAdaptabilityGuide = () => {
  const lastShownDate = localStorage.getItem('adaptabilityGuideLastShown');
  const today = new Date().toDateString();

  if (lastShownDate !== today) {
    // Trigger the modal
    const showButton = document.getElementById('showAdaptabilityGuideBtn');
    if (showButton) {
      showButton.click();
    }

    // Update the last shown date
    localStorage.setItem('adaptabilityGuideLastShown', today);
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

  const ltp = positionLTPs.value[position.tsym];
  if (!ltp) {
    console.log(`No LTP available for ${position.tsym}, cannot set stoploss.`);
    return;
  }

  const isLongPosition = position.netqty > 0;
  if (type === 'trailing') {
    trailingStoplosses.value[position.tsym] = parseFloat(
      (isLongPosition ? ltp - stoplossValue.value : ltp + stoplossValue.value).toFixed(2)
    );
    stoplosses.value[position.tsym] = null;
  } else {
    stoplosses.value[position.tsym] = parseFloat(
      (isLongPosition ? ltp - stoplossValue.value : ltp + stoplossValue.value).toFixed(2)
    );
    trailingStoplosses.value[position.tsym] = null;
  }
  tslHitPositions.delete(position.tsym); // Reset TSL hit tracking
  console.log(`${type === 'trailing' ? 'TSL' : 'SL'} set for ${position.tsym}: ${isLongPosition ? trailingStoplosses.value[position.tsym] : stoplosses.value[position.tsym]}`);
};
const removeStoploss = (position) => {
  stoplosses.value[position.tsym] = null;
  trailingStoplosses.value[position.tsym] = null;
  tslHitPositions.delete(position.tsym);
};
const increaseStoploss = (position) => {
  if (stoplosses.value[position.tsym] !== null) {
    stoplosses.value[position.tsym] += 1; // Adjust increment value as needed
  }
};
const decreaseStoploss = (position) => {
  if (stoplosses.value[position.tsym] !== null) {
    stoplosses.value[position.tsym] -= 1; // Adjust decrement value as needed
  }
};
const setTarget = async (position) => {
  if (!enableTarget.value) {
    console.log('Target is disabled.');
    return;
  }

  const quantity = Math.abs(Number(position.netQty || position.netqty));

  if (quantity === 0) {
    console.log(`Quantity is zero for ${position.tsym}, no target will be set.`);
    return;
  }

  // Wait for the LTP to be available
  let retries = 0;
  while (!positionLTPs.value[position.tsym] && retries < 10) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries++;
  }

  const ltp = positionLTPs.value[position.tsym];
  if (!ltp) {
    console.log(`No LTP available for ${position.tsym}, cannot set target.`);
    return;
  }

  if (enableTarget.value && targetValue.value > 0) {
    const isLongPosition = position.netqty > 0;
    targets.value[position.tsym] = parseFloat(
      (isLongPosition ? parseFloat(ltp) + parseFloat(targetValue.value) : parseFloat(ltp) - parseFloat(targetValue.value)).toFixed(2)
    );

    console.log(`Target set for ${position.tsym}: LTP = ${ltp}, TargetValue = ${targetValue.value}, Target = ${targets.value[position.tsym]}`);
  } else {
    targets.value[position.tsym] = null;
    console.log(`Target removed for ${position.tsym}`);
  }
};
const removeTarget = (position) => {
  targets.value[position.tsym] = null;
};
const increaseTarget = (position) => {
  if (targets.value[position.tsym] !== null) {
    targets.value[position.tsym] += 1; // Adjust increment value as needed
  }
};
const decreaseTarget = (position) => {
  if (targets.value[position.tsym] !== null) {
    targets.value[position.tsym] -= 1; // Adjust decrement value as needed
  }
};

const checkTargets = (newLTPs) => {
  if (!enableTarget.value) {
    console.log('Target is disabled.');
    return;
  }
  console.log('Checking targets...');
  const validTargets = Object.entries(targets.value).filter(([tsym, target]) => target !== null && target !== undefined);

  if (validTargets.length === 0) {
    console.log('No valid targets set. Skipping check.');
    return;
  }

  for (const [tsym, target] of validTargets) {
    const currentLTP = newLTPs[tsym];
    console.log(`Checking target for ${tsym}: Current LTP = ${currentLTP}, Target = ${target}`);
    if (currentLTP >= target) {
      const position = flatTradePositionBook.value.find(p => p.tsym === tsym);
      if (position) {
        console.log(`Target reached for ${tsym}. Placing sell order.`);
        placeOrderForPosition('S', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
        removeTarget(position);
        toastMessage.value = 'Target hit for ' + tsym;
        showToast.value = true;
      } else {
        console.log(`No position found for ${tsym}`);
      }
    }
  }
};
const checkStoplosses = (newLTPs) => {
  if (!enableStoploss.value) {
    console.log('Stoploss is disabled.');
    return;
  }

  for (const [tsym, sl] of Object.entries(stoplosses.value)) {
    const newLTP = parseFloat(newLTPs[tsym]);
    if (isNaN(newLTP) || isNaN(sl)) {
      console.warn(`Invalid LTP or stoploss for ${tsym}. LTP: ${newLTPs[tsym]}, SL: ${sl}`);
      continue;
    }

    const position = flatTradePositionBook.value.find(p => p.tsym === tsym);
    if (!position || Math.abs(Number(position.netQty || position.netqty)) === 0) {
      console.log(`No active position for ${tsym}, removing stoploss.`);
      removeStoploss({ tsym });
      continue;
    }

    const isLongPosition = position.netqty > 0;
    if ((isLongPosition && newLTP <= sl) || (!isLongPosition && newLTP >= sl)) {
      console.log(`Stoploss hit for ${tsym}. Closing position.`);
      placeOrderForPosition(isLongPosition ? 'S' : 'B', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
      removeStoploss(position);
      toastMessage.value = 'Stoploss hit for ' + tsym;
      showToast.value = true;
    }
  }

  for (const [tsym, tsl] of Object.entries(trailingStoplosses.value)) {
    const position = flatTradePositionBook.value.find(p => p.tsym === tsym);
    if (!position || Math.abs(Number(position.netQty || position.netqty)) === 0) {
      console.log(`No active position for ${tsym}, removing trailing stoploss.`);
      removeStoploss({ tsym });
      continue;
    }

    const isLongPosition = position.netqty > 0;
    const newLTP = parseFloat(newLTPs[tsym]);
    const stopLossValue = parseFloat(stoplossValue.value);

    if (isNaN(newLTP) || isNaN(tsl) || isNaN(stopLossValue)) {
      console.warn(`Invalid LTP, TSL, or stoploss value for ${tsym}. LTP: ${newLTPs[tsym]}, TSL: ${tsl}, SL Value: ${stoplossValue.value}`);
      continue;
    }

    if (isLongPosition) {
      if (newLTP > tsl + stopLossValue) {
        // Update TSL for long positions
        trailingStoplosses.value[tsym] = parseFloat((newLTP - stopLossValue).toFixed(2));
        console.log(`TSL updated for ${tsym}: ${trailingStoplosses.value[tsym]}`);
      } else if (newLTP <= tsl && !tslHitPositions.has(tsym)) {
        // Hit TSL for long positions
        console.log(`Trailing Stoploss hit for ${tsym}. Closing position.`);
        placeOrderForPosition('S', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
        removeStoploss(position);
        toastMessage.value = 'Trailing Stoploss hit for ' + tsym;
        showToast.value = true;
        tslHitPositions.add(tsym); // Mark TSL as hit
      }
    } else {
      if (newLTP < tsl - stopLossValue) {
        // Update TSL for short positions
        trailingStoplosses.value[tsym] = parseFloat((newLTP + stopLossValue).toFixed(2));
        console.log(`TSL updated for ${tsym}: ${trailingStoplosses.value[tsym]}`);
      } else if (newLTP >= tsl && !tslHitPositions.has(tsym)) {
        // Hit TSL for short positions
        console.log(`Trailing Stoploss hit for ${tsym}. Closing position.`);
        placeOrderForPosition('B', position.tsym.includes('C') ? 'CALL' : 'PUT', position);
        removeStoploss(position);
        toastMessage.value = 'Trailing Stoploss hit for ' + tsym;
        showToast.value = true;
        tslHitPositions.add(tsym); // Mark TSL as hit
      }
    }
  }
};
const checkStoplossesAndTargets = (newLTPs) => {
  checkStoplosses(newLTPs);
  checkTargets(newLTPs);
};






// Lifecycle hooks
onMounted(async () => {
  checkAndShowAdaptabilityGuide();
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
      if (selectedBroker.value?.brokerName === 'PaperTrading') {
        setPaperTradingCredentials();
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
      console.log(`LTP changed for ${tsym}: ${oldLTPs[tsym]} -> ${ltp}`);
      const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value]
        .find(p => (p.tsym || p.tradingSymbol) === tsym);
      if (position) {
        console.log(`Found position for ${tsym}:`, position);
      } else {
        console.log(`No position found for ${tsym}`);
      }
    }
  });
  checkStoplossesAndTargets(newLTPs);
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
  console.log('Master Symbol:', selectedMasterSymbol.value);
  console.log('Low:', masterLowPrice.value);
  console.log('High:', masterHighPrice.value);
  console.log('LTP:', getMasterSymbolPrice());
  console.log('Range Width:', ltpRangeWidth.value);
  console.log('Marker Position:', ltpMarkerPosition.value);
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
