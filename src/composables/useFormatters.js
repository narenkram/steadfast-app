import { ref } from 'vue'
import { dataFetched, selectedBroker } from '@/stores/globalStore'

// Trading Symbol Formatter
export const formatTradingSymbol = (symbol, excludeStrikePrice = false) => {
  if (!symbol) return ''

  const regex = /^(\w+)(\d{2})([A-Z]{3})(\d{2})([CP])(\d+)$/
  const match = symbol.match(regex)

  if (match) {
    const [, index, year, month, date, optionType, strikePrice] = match
    return `${index} ${date}${month}${year} ${optionType}${excludeStrikePrice ? '' : ' ' + strikePrice}`
  }

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
