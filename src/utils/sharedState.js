import { reactive, ref } from 'vue'

// Broker-related state
export const tokenStatus = reactive({
  Flattrade: 'unknown',
  Dhan: 'unknown',
  Shoonya: 'unknown'
})
export const brokers = ['Flattrade', 'Shoonya', 'Dhan']

// Toast-related state
export const showToast = ref(false)
export const toastMessage = ref('')

// Toast-related functions
export const updateToastVisibility = (value) => {
  showToast.value = value
}

// Kill Switch state
export const killSwitchActive = ref(localStorage.getItem('KillSwitchStatus') === 'true')
export const activationTime = ref(parseInt(localStorage.getItem('KillSwitchActivationTime') || '0'))

// HotKeys state
export const enableHotKeys = ref(localStorage.getItem('EnableHotKeys') !== 'false')

// Trade settings state
export const tradeSettings = reactive({
  enableStoploss: JSON.parse(localStorage.getItem('enableStoploss') || 'true'),
  stoplossValue: Number(localStorage.getItem('stoplossValue') || '20'),
  enableTarget: JSON.parse(localStorage.getItem('enableTarget') || 'true'),
  targetValue: Number(localStorage.getItem('targetValue') || '30'),
  stoplossStep: 1,
  targetStep: 1,
})

// Position-related state
export const positionStoplosses = ref({})
export const positionTargets = ref({})
export const positionStoplossesPrice = ref({})
export const positionTargetsPrice = ref({})
export const positionLTPs = ref({})

// Save trade settings
export const saveTradeSettings = () => {
  localStorage.setItem('enableStoploss', JSON.stringify(tradeSettings.enableStoploss))
  localStorage.setItem('stoplossValue', tradeSettings.stoplossValue.toString())
  localStorage.setItem('enableTarget', JSON.stringify(tradeSettings.enableTarget))
  localStorage.setItem('targetValue', tradeSettings.targetValue.toString())
}

// Order book state
export const dhanOrders = ref([])
export const flatOrderBook = ref([])
export const flatTradeBook = ref([])
export const shoonyaOrderBook = ref([])
export const shoonyaTradeBook = ref([])

// Position book state
export const flatTradePositionBook = ref([])
export const shoonyaPositionBook = ref([])
export const dhanPositionBook = ref([])