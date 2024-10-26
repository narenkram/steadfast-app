import { ref } from 'vue'
import { dataFetched, selectedBroker } from '@/stores/globalStore'

// Broker Formatter
// Parse broker key
export const parseBrokerKey = (key) => {
  const [_, brokerName, ...clientIdParts] = key.split('_')
  const clientId = clientIdParts.join('_')
  return { brokerName, clientId }
}

// Get all brokers from localStorage
export const getAllBrokersFromLocalStorage = () => {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith('broker_'))
    .map((key) => {
      const { brokerName, clientId } = parseBrokerKey(key)
      const brokerData = JSON.parse(localStorage.getItem(key))
      return { ...brokerData, brokerName, clientId }
    })
}

// Trading Symbol Formatter
export const formatTradingSymbol = (symbol, excludeStrikePrice = false) => {
  if (!symbol) return ''

  // Pattern 1: For symbols like NIFTY23DEC28C20000
  // Breakdown:
  // - (\w+)    : Index name (NIFTY)
  // - (\d{2})  : Year (23)
  // - ([A-Z]{3}): Month (DEC)
  // - (\d{2})  : Date (28)
  // - ([CP])   : Option type (C for Call, P for Put)
  // - (\d+)    : Strike price (20000)
  const pattern1 = /^(\w+)(\d{2})([A-Z]{3})(\d{2})([CP])(\d+)$/

  // Pattern 2: For symbols like SENSEX24O3181400CE or BANKEX24OCT60200CE
  // Breakdown:
  // - (\w+)      : Index name (SENSEX/BANKEX)
  // - (\d{2})    : Year (24)
  // - ([A-Z]{1,3}): Month (O or OCT)
  // - (\d{2})    : Date (18)
  // - (\d+)      : Strike price (1400)
  // - ([CP]E)    : Option type (CE for Call, PE for Put)
  const pattern2 = /^(\w+)(\d{2})([A-Z]{1,3})(\d{2})(\d+)([CP]E)$/

  // Try to match the symbol against both patterns
  const match1 = symbol.match(pattern1)
  const match2 = symbol.match(pattern2)

  // Handle Pattern 1 match
  if (match1) {
    // Destructure the matched groups
    const [, index, year, month, date, optionType, strikePrice] = match1

    // Convert single character option type to full word
    // C -> CALL, P -> PUT
    const formattedOptionType = optionType === 'C' ? 'CALL' : 'PUT'

    // Construct the formatted string
    // Example: "NIFTY 28DEC23 CALL 20000"
    return `${index} ${date}${month}${year} ${formattedOptionType}${excludeStrikePrice ? '' : ' ' + strikePrice}`
  }

  // Handle Pattern 2 match
  if (match2) {
    // Destructure the matched groups
    const [, index, year, month, date, strikePrice, optionType] = match2

    // Convert CE/PE to CALL/PUT
    const formattedOptionType = optionType === 'CE' ? 'CALL' : 'PUT'

    // Construct the formatted string
    // Example: "SENSEX 18O324 CALL 1400"
    return `${index} ${date}${month}${year} ${formattedOptionType}${excludeStrikePrice ? '' : ' ' + strikePrice}`
  }

  // If no patterns match, return the original symbol unchanged
  return symbol
}

// Price Formatter
export const formatPrice = (price) => {
  if (price == null || isNaN(price)) {
    return '-'
  }
  const numPrice = Number(price)
  return numPrice.toFixed(2)
}

// Client ID Masking
export const manageBrokerMaskClientId = (brokerClientId) => {
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

// Token/Secret Masking
export const maskTokenSecret = (apiSecret) => {
  if (!apiSecret || apiSecret.length < 10) return apiSecret // Ensure there are enough characters to mask and not a placeholder

  const start = apiSecret.slice(0, 3)
  const end = apiSecret.slice(-3)
  return `${start}******${end}`
}

// Date Formatter
export const formatDate = (dateString) => {
  if (!dataFetched.value || !dateString) {
    return '' // Return empty string if data hasn't been fetched or dateString is null
  }

  if (
    selectedBroker.value?.brokerName === 'Flattrade' ||
    selectedBroker.value?.brokerName === 'Shoonya'
  ) {
    return dateString
  }
  return dateString
}
