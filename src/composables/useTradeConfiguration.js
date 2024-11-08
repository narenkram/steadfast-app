import { ref, computed } from 'vue'

import {
  marketExchanges,
  selectedMarketExchange,
  selectedBroker,
  selectedExchange,
  lotsPerSymbol,
  selectedMasterSymbol,
  selectedQuantity,
  availableQuantities,
  quantities,
  allSymbolsData,
  callStrikes,
  putStrikes,
  selectedCallStrike,
  selectedPutStrike,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  synchronizeOnLoad,
  defaultCallSecurityId,
  defaultPutSecurityId,
  callStrikeOffset,
  putStrikeOffset
} from '@/stores/globalStore'

// WebSocket Composables
import { subscribeToOptions } from '@/composables/useWebSocket'

export const getMarketExchange = () => {
  return selectedMarketExchange.value
}

export const saveMarketExchange = () => {
  localStorage.setItem('selectedMarketExchange', selectedMarketExchange.value)
}

export const loadMarketExchange = () => {
  const savedExchange = localStorage.getItem('selectedMarketExchange')

  if (savedExchange && marketExchanges.value.includes(savedExchange)) {
    selectedMarketExchange.value = savedExchange
  } else {
    // Set default to NSE if no valid saved preference
    selectedMarketExchange.value = 'NSE'
    saveMarketExchange() // Save the default
  }
}

export const handleMarketExchangeChange = async () => {
  saveMarketExchange()
  await fetchTradingData()
}
export const getExchangeSegment = () => {
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
  } else {
    throw new Error('Unsupported broker')
  }
}

export const selectedLots = computed({
  get: () => lotsPerSymbol.value[selectedMasterSymbol.value] || 1,
  set: (value) => {
    lotsPerSymbol.value[selectedMasterSymbol.value] = value
    saveLots()
  }
})

export const getProductTypeValue = (productType) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return productType === 'Intraday' ? 'I' : 'M'
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return productType === 'Intraday' ? 'I' : 'M'
  }
  return productType
}

export const getTransactionType = (type) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return type === 'BUY' ? 'B' : 'S'
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return type === 'BUY' ? 'B' : 'S'
  }
  return type
}

export const productTypes = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return ['Intraday', 'Margin']
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return ['Intraday', 'Margin']
  }
  return []
})

export const updateAvailableQuantities = () => {
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

export const orderTypes = computed(() => {
  if (
    selectedBroker.value?.brokerName === 'Flattrade' ||
    selectedBroker.value?.brokerName === 'Shoonya'
  ) {
    return ['MKT', 'LMT', 'LMT_LTP']
  }
  return []
})
export const displayOrderTypes = computed(() => {
  return orderTypes.value.map((type) => {
    switch (type) {
      case 'MKT':
        return 'Market'
      case 'LMT':
        return 'Limit'
      case 'LMT_LTP':
        return 'Limit at LTP'
      default:
        return type
    }
  })
})
export const saveLots = () => {
  localStorage.setItem('lotsPerSymbol', JSON.stringify(lotsPerSymbol.value))
}
export const loadLots = () => {
  const savedLots = localStorage.getItem('lotsPerSymbol')
  if (savedLots) {
    lotsPerSymbol.value = JSON.parse(savedLots)
  }
}
export const updateSelectedQuantity = () => {
  const instrument = quantities.value[selectedMasterSymbol.value]
  if (instrument) {
    const maxLots = instrument.maxLots // Use maxLots from the instrument
    const lots = Math.min(Math.max(1, selectedLots.value), maxLots)
    lotsPerSymbol.value[selectedMasterSymbol.value] = lots
    selectedQuantity.value = lots * instrument.lotSize
    saveLots()
  }
}
export const updateStrikesForExpiry = (expiryDate, forceUpdate = false) => {
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
export const synchronizeStrikes = () => {
  synchronizeCallStrikes()
  synchronizePutStrikes()
  updateSecurityIds()
  subscribeToOptions()
}
export const synchronizeCallStrikes = () => {
  if (selectedPutStrike.value && selectedPutStrike.value.strikePrice) {
    const matchingCallStrike = callStrikes.value.find(
      (strike) => strike.strikePrice === selectedPutStrike.value.strikePrice
    )
    if (matchingCallStrike) {
      selectedCallStrike.value = matchingCallStrike
    } else {
      selectedCallStrike.value = {}
    }
  }
  updateSecurityIds()
}

export const synchronizePutStrikes = () => {
  if (selectedCallStrike.value && selectedCallStrike.value.strikePrice) {
    const matchingPutStrike = putStrikes.value.find(
      (strike) => strike.strikePrice === selectedCallStrike.value.strikePrice
    )
    if (matchingPutStrike) {
      selectedPutStrike.value = matchingPutStrike
    } else {
      selectedPutStrike.value = {}
    }
  }
  updateSecurityIds()
}
export const updateSecurityIds = () => {
  // console.log('Updating Security IDs');
  defaultCallSecurityId.value = selectedCallStrike.value.securityId || 'N/A'
  defaultPutSecurityId.value = selectedPutStrike.value.securityId || 'N/A'
}
