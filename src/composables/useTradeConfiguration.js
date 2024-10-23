import { ref, computed } from 'vue'

import {
  selectedBroker,
  selectedExchange,
  lotsPerSymbol,
  selectedMasterSymbol
} from '@/stores/globalStore'

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
