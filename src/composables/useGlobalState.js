import { ref, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const BASE_URL = 'http://localhost:3000'
export const showLTPRangeBar = ref(false)
export const showToast = ref(false)
export const toastMessage = ref('')
export const activeTab = ref('positions')
export const killSwitchActive = ref(localStorage.getItem('KillSwitchStatus') === 'true')
export const overtradeProtection = ref(localStorage.getItem('OvertradeProtection') === 'true')
export const experimentalFeatures = ref(
  JSON.parse(localStorage.getItem('ExperimentalFeatures') || 'false')
)
export const activationTime = ref(parseInt(localStorage.getItem('KillSwitchActivationTime') || '0'))
export const currentTime = ref(Date.now())
export const enableHotKeys = ref(localStorage.getItem('EnableHotKeys') !== 'false')
export const selectedBroker = ref(null)
export const selectedBrokerName = ref('')
export const selectedExchange = ref({})
export const selectedMasterSymbol = ref('')
export const selectedQuantity = ref(0)
export const selectedExpiry = ref(null)
export const selectedCallStrike = ref({})
export const selectedPutStrike = ref({})
export const callStrikeOffset = ref(localStorage.getItem('callStrikeOffset') || '0')
export const putStrikeOffset = ref(localStorage.getItem('putStrikeOffset') || '0')
export const expiryOffset = ref(localStorage.getItem('expiryOffset') || '0')
export const exchangeSymbols = ref({})
export const callStrikes = ref([])
export const putStrikes = ref([])
export const expiryDates = ref([])
export const synchronizeOnLoad = ref(true)
export const niftyPrice = ref('N/A')
export const bankNiftyPrice = ref('N/A')
export const finniftyPrice = ref('N/A')
export const midcpniftyPrice = ref('N/A')
export const sensexPrice = ref('N/A')
export const bankexPrice = ref('N/A')
export const dataFetched = ref(false)
export const lotsPerSymbol = ref({})
export const flatOrderBook = ref([])
export const flatTradeBook = ref([])
export const token = ref('')
export const shoonyaOrderBook = ref([])
export const shoonyaTradeBook = ref([])
export const flatTradePositionBook = ref([])
export const shoonyaPositionBook = ref([])
export const fundLimits = ref({})
export const showBrokerClientId = ref(false)
export const quantities = ref({
  NIFTY: { lotSize: 25, maxLots: 360, freezeLimit: 72 },
  BANKNIFTY: { lotSize: 15, maxLots: 300, freezeLimit: 60 },
  FINNIFTY: { lotSize: 25, maxLots: 360, freezeLimit: 72 },
  MIDCPNIFTY: { lotSize: 50, maxLots: 280, freezeLimit: 56 },
  SENSEX: { lotSize: 10, maxLots: 500, freezeLimit: 100 },
  BANKEX: { lotSize: 15, maxLots: 300, freezeLimit: 60 }
})
export const availableQuantities = ref([])
export const selectedStrike = ref({})
export const selectedProductType = ref('')
export const limitPrice = ref(null)
export const modalTransactionType = ref('')
export const modalOptionType = ref('')
export const selectedShoonyaPositionsSet = ref(new Set())
export const selectedFlattradePositionsSet = ref(new Set())
export const positionsInExecution = ref({})
export const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']
export const currentClockEmoji = ref(clockEmojis[new Date().getHours() % clockEmojis.length])
export const socket = ref(null)
export const latestCallLTP = ref('N/A')
export const latestPutLTP = ref('N/A')
export const defaultCallSecurityId = ref(null)
export const defaultPutSecurityId = ref(null)
export const positionLTPs = ref({})
export const positionSecurityIds = ref({})
export const totalRiskType = ref(null)
export const totalRiskTypeToggle = ref(false)
export const activeFetchFunction = ref(null)
export const masterOpenPrice = ref(localStorage.getItem('masterOpenPrice') || null)
export const masterHighPrice = ref(localStorage.getItem('masterHighPrice') || null)
export const masterLowPrice = ref(localStorage.getItem('masterLowPrice') || null)
export const masterClosePrice = ref(localStorage.getItem('masterClosePrice') || null)
export const callOpenPrice = ref(localStorage.getItem('callOpenPrice') || null)
export const callHighPrice = ref(localStorage.getItem('callHighPrice') || null)
export const callLowPrice = ref(localStorage.getItem('callLowPrice') || null)
export const callClosePrice = ref(localStorage.getItem('callClosePrice') || null)
export const putOpenPrice = ref(localStorage.getItem('putOpenPrice') || null)
export const putHighPrice = ref(localStorage.getItem('putHighPrice') || null)
export const putLowPrice = ref(localStorage.getItem('putLowPrice') || null)
export const putClosePrice = ref(localStorage.getItem('putClosePrice') || null)
export const showOHLCValues = ref(false)
export const showStrikeDetails = ref(false)
export const reverseMode = ref('all')
export const showBasketOrderModal = ref(false)
export const additionalSymbols = ref(
  JSON.parse(localStorage.getItem('additionalSymbols') || 'false')
)
export const marketDepth = ref(JSON.parse(localStorage.getItem('marketDepth') || 'false'))
export const additionalStrikeLTPs = ref({
  call: {},
  put: {}
})
export const ltpCallbacks = ref({})
export const customStrikePrice = ref('')
export const notificationSound = ref(localStorage.getItem('notificationSound') !== 'false')
export const selectedSound = ref(localStorage.getItem('selectedSound'))
export const riskClosingCountdown = ref(30)
export const totalRiskTargetToggle = ref(
  JSON.parse(localStorage.getItem('totalRiskTargetToggle') || 'false')
)
export const totalRiskTargetType = ref(localStorage.getItem('totalRiskTargetType') || 'percentage')
export const totalRiskAmount = ref(Number(localStorage.getItem('totalRiskAmount')) || 1500)
export const totalRiskPercentage = ref(Number(localStorage.getItem('totalRiskPercentage')) || 1.5)
export const totalTargetAmount = ref(Number(localStorage.getItem('totalTargetAmount')) || 3000)
export const totalTargetPercentage = ref(Number(localStorage.getItem('totalTargetPercentage')) || 3)
export const savedBaskets = ref([])
export const basketName = ref('')
export const editingBasketId = ref(null)
export const basketOrders = ref([])
export const closePositionsRisk = ref(
  JSON.parse(localStorage.getItem('closePositionsRisk') || 'false')
)
export const closePositionsTarget = ref(
  JSON.parse(localStorage.getItem('closePositionsTarget') || 'false')
)
export const strategyType = ref('Bullish')
export const strategies = ref([
  { id: 1, name: 'Short Straddle', type: 'Neutral', image: '/strategies/short-straddle.svg' },
  { id: 2, name: 'Iron Butterfly', type: 'Neutral', image: '/strategies/iron-butterfly.svg' },
  { id: 3, name: 'Short Strangle', type: 'Neutral', image: '/strategies/short-strangle.svg' },
  { id: 4, name: 'Short Iron Condor', type: 'Neutral', image: '/strategies/short-iron-condor.svg' },
  { id: 5, name: 'Batman', type: 'Neutral', image: '/strategies/batman.svg' },
  { id: 6, name: 'Double Plateau', type: 'Neutral', image: '/strategies/double-plateau.svg' },
  { id: 7, name: 'Jade Lizard', type: 'Neutral', image: '/strategies/jade-lizard.svg' },
  {
    id: 8,
    name: 'Reverse Jade Lizard',
    type: 'Neutral',
    image: '/strategies/jade-reverse-lizard.svg'
  },
  { id: 9, name: 'Buy Put', type: 'Bearish', image: '/strategies/buy-put.svg' },
  { id: 10, name: 'Sell Call', type: 'Bearish', image: '/strategies/sell-call.svg' },
  { id: 11, name: 'Bear Call Spread', type: 'Bearish', image: '/strategies/bear-call-spread.svg' },
  { id: 12, name: 'Bear Put Spread', type: 'Bearish', image: '/strategies/bear-put-spread.svg' },
  {
    id: 13,
    name: 'Put Ratio Back Spread',
    type: 'Bearish',
    image: '/strategies/put-ratio-back-spread.svg'
  },
  {
    id: 14,
    name: 'Long Calendar with Puts',
    type: 'Bearish',
    image: '/strategies/long-calendar-with-puts.svg'
  },
  { id: 15, name: 'Bear Condor', type: 'Bearish', image: '/strategies/bear-condor.svg' },
  { id: 16, name: 'Bear Butterfly', type: 'Bearish', image: '/strategies/bear-butterfly.svg' },
  { id: 17, name: 'Buy Call', type: 'Bullish', image: '/strategies/buy-call.svg' },
  { id: 18, name: 'Sell Put', type: 'Bullish', image: '/strategies/sell-put.svg' },
  { id: 19, name: 'Bull Call Spread', type: 'Bullish', image: '/strategies/bull-call-spread.svg' },
  { id: 20, name: 'Bull Put Spread', type: 'Bullish', image: '/strategies/bull-put-spread.svg' },
  {
    id: 21,
    name: 'Call Ratio Back Spread',
    type: 'Bullish',
    image: '/strategies/call-ratio-back-spread.svg'
  },
  {
    id: 22,
    name: 'Long Calendar with Calls',
    type: 'Bullish',
    image: '/strategies/long-calendar-with-calls.svg'
  },
  { id: 23, name: 'Bull Condor', type: 'Bullish', image: '/strategies/bull-condor.svg' },
  { id: 24, name: 'Bull Butterfly', type: 'Bullish', image: '/strategies/bull-butterfly.svg' },
  { id: 25, name: 'Call Ratio Spread', type: 'Others', image: '/strategies/call-ratio-spread.svg' },
  { id: 26, name: 'Put Ratio Spread', type: 'Others', image: '/strategies/put-ratio-spread.svg' },
  { id: 27, name: 'Long Straddle', type: 'Others', image: '/strategies/long-straddle.svg' },
  {
    id: 28,
    name: 'Long Iron Butterfly',
    type: 'Others',
    image: '/strategies/long-iron-butterfly.svg'
  },
  { id: 29, name: 'Long Strangle', type: 'Others', image: '/strategies/long-strangle.svg' },
  { id: 30, name: 'Long Iron Condor', type: 'Others', image: '/strategies/long-iron-condor.svg' },
  { id: 31, name: 'Strip', type: 'Others', image: '/strategies/strip.svg' },
  { id: 32, name: 'Strap', type: 'Others', image: '/strategies/strap.svg' }
])
export const riskAction = ref(localStorage.getItem('riskAction') || 'close')
export const targetAction = ref(localStorage.getItem('targetAction') || 'close')
export const orderMargin = reactive({
  call: null,
  put: null
})
export const limitOffset = ref(0)
export const stoplosses = useLocalStorage('stoplosses', {})
export const targets = useLocalStorage('targets', {})
export const trailingStoplosses = useLocalStorage('trailingStoplosses', {})

export const enableStoploss = useLocalStorage('enableStoploss', false)
export const stoplossValue = useLocalStorage('stoplossValue', 10)
export const enableTarget = useLocalStorage('enableTarget', false)
export const targetValue = useLocalStorage('targetValue', 50)
export const tslHitPositions = new Set()
export const callDepth = ref({
  bp1: null,
  bq1: null,
  sp1: null,
  sq1: null,
  bp2: null,
  bq2: null,
  sp2: null,
  sq2: null,
  bp3: null,
  bq3: null,
  sp3: null,
  sq3: null,
  bp4: null,
  bq4: null,
  sp4: null,
  sq4: null,
  bp5: null,
  bq5: null,
  sp5: null,
  sq5: null
})
export const putDepth = ref({
  bp1: null,
  bq1: null,
  sp1: null,
  sq1: null,
  bp2: null,
  bq2: null,
  sp2: null,
  sq2: null,
  bp3: null,
  bq3: null,
  sp3: null,
  sq3: null,
  bp4: null,
  bq4: null,
  sp4: null,
  sq4: null,
  bp5: null,
  bq5: null,
  sp5: null,
  sq5: null
})
export const symbolData = reactive({
  NIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26000', expiryDay: 4 }, // Thursday
  BANKNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26009', expiryDay: 3 }, // Wednesday
  FINNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26037', expiryDay: 2 }, // Tuesday
  MIDCPNIFTY: { exchangeCode: 'NSE', exchangeSecurityId: '26074', expiryDay: 1 }, // Monday
  SENSEX: { exchangeCode: 'BSE', exchangeSecurityId: '1', expiryDay: 5 }, // Friday
  BANKEX: { exchangeCode: 'BSE', exchangeSecurityId: '12', expiryDay: null } // No specific expiry day
})
export const allSymbolsData = reactive({
  NIFTY: { expiryDates: [], callStrikes: [], putStrikes: [] },
  BANKNIFTY: { expiryDates: [], callStrikes: [], putStrikes: [] },
  FINNIFTY: { expiryDates: [], callStrikes: [], putStrikes: [] },
  MIDCPNIFTY: { expiryDates: [], callStrikes: [], putStrikes: [] },
  SENSEX: { expiryDates: [], callStrikes: [], putStrikes: [] },
  BANKEX: { expiryDates: [], callStrikes: [], putStrikes: [] }
})