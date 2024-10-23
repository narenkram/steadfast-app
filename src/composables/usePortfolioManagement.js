import { selectedBroker } from '@/stores/globalStore'

export const updateOrdersAndPositions = async () => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    await Promise.all([fetchFlattradeOrdersTradesBook(), fetchFlattradePositions()])
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    await Promise.all([fetchShoonyaOrdersTradesBook(), fetchShoonyaPositions()])
  }
}
