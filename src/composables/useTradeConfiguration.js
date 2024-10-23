import { selectedBroker, selectedExchange } from '@/stores/globalStore'

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
