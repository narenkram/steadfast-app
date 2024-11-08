import { ref, reactive } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export const marketExchanges = ref(['NSE', 'BSE'])
export const selectedMarketExchange = ref('NSE')
export const BASE_URL = import.meta.env.VITE_BASE_URL
export const showLTPRangeBar = ref(false)
export const showToast = ref(false)
export const toastMessage = ref('')
export const activeTab = ref('positions')
export const killSwitchActive = ref(localStorage.getItem('KillSwitchStatus') === 'true')
export const overtradeProtection = ref(localStorage.getItem('OvertradeProtection') === 'true')
export const activationTime = ref(parseInt(localStorage.getItem('KillSwitchActivationTime') || '0'))
export const currentTime = ref(Date.now())
export const enableHotKeys = ref(localStorage.getItem('EnableHotKeys') !== 'false')

// Broker Status
export const tokenStatus = reactive({
  Flattrade: 'unknown',
  Shoonya: 'unknown'
})

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
export const selectedProductType = ref(localStorage.getItem('selectedProductType') || '')
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
export const ltpCallbacks = ref({})
export const customStrikePrice = ref('')
export const notificationSound = ref(localStorage.getItem('notificationSound') !== 'false')
export const riskClosingCountdown = ref(30)
export const totalRiskTargetToggle = ref(
  JSON.parse(localStorage.getItem('totalRiskTargetToggle') || 'false')
)
export const totalRiskTargetType = ref(localStorage.getItem('totalRiskTargetType') || 'percentage')
export const totalRiskAmount = ref(Number(localStorage.getItem('totalRiskAmount')) || 1500)
export const totalRiskPercentage = ref(Number(localStorage.getItem('totalRiskPercentage')) || 1.5)
export const totalTargetAmount = ref(Number(localStorage.getItem('totalTargetAmount')) || 3000)
export const totalTargetPercentage = ref(Number(localStorage.getItem('totalTargetPercentage')) || 3)
export const closePositionsRisk = ref(
  JSON.parse(localStorage.getItem('closePositionsRisk') || 'false')
)
export const closePositionsTarget = ref(
  JSON.parse(localStorage.getItem('closePositionsTarget') || 'false')
)
export const riskAction = ref(localStorage.getItem('riskAction') || 'close')
export const targetAction = ref(localStorage.getItem('targetAction') || 'close')

export const stoplosses = useLocalStorage('stoplosses', {})
export const targets = useLocalStorage('targets', {})
export const trailingStoplosses = useLocalStorage('trailingStoplosses', {})

export const enableStoploss = useLocalStorage('enableStoploss', false)
export const stoplossValue = useLocalStorage('stoplossValue', 10)
export const enableTarget = useLocalStorage('enableTarget', false)
export const targetValue = useLocalStorage('targetValue', 50)
export const tslHitPositions = new Set()

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

export const API_TOKEN = ref('') // Not used right now
export const FLATTRADE_API_KEY = ref('')
export const FLATTRADE_API_SECRET = ref('')
export const FLATTRADE_CLIENT_ID = ref('')
export const FLATTRADE_API_TOKEN = ref('')
export const SHOONYA_API_KEY = ref('')
export const SHOONYA_CLIENT_ID = ref('')
export const SHOONYA_API_TOKEN = ref('')
export const flattradeReqCode = ref('')
export const shoonyaBrokerUserId = ref('')
export const shoonyaBrokerPassword = ref('')
export const shoonyaOneTimePassword = ref('')
export const errorMessage = ref('')
export const statusMessage = ref('')
export const userTriggeredTokenGeneration = ref(false) // Flag to track user-triggered token generation
export const selectedBrokerToDelete = ref(null) // Store the broker to be deleted
export const savedStickyMTM = localStorage.getItem('stickyMTM')
export const stickyMTM = ref(savedStickyMTM ? JSON.parse(savedStickyMTM) : false)
export const userId = localStorage.getItem('userId')
export const selectedOrderType = ref('MKT')
export const currentSubscriptions = ref({
  masterSymbol: null,
  callOption: null,
  putOption: null
})
export const supportedBrokers = ['Flattrade', 'Shoonya']
export const MAX_RECONNECT_ATTEMPTS = 5
export const INITIAL_RECONNECT_DELAY = 1000
export const reconnectAttempts = ref(0)
export const reconnectTimeout = ref(null)
export const wsConnectionState = ref('disconnected')
export const messageQueue = ref([])
