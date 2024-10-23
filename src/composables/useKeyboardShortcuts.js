import { enableHotKeys } from '@/stores/globalStore'
import {
  placeOrder,
  closeAllPositions,
  cancelPendingOrders
} from '@/composables/useOrderManagement'
import { getTransactionType } from '@/composables/useTradeConfiguration'

export const handleHotKeys = (event) => {
  if (!enableHotKeys.value) return

  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'F6':
    case 'F7':
      event.preventDefault() // Prevent default browser action
      break
  }

  switch (event.key) {
    case 'ArrowUp':
      placeOrder(getTransactionType('BUY'), 'CALL')
      break
    case 'ArrowDown':
      placeOrder(getTransactionType('BUY'), 'PUT')
      break
    case 'ArrowRight':
      placeOrder(getTransactionType('SELL'), 'PUT')
      break
    case 'ArrowLeft':
      placeOrder(getTransactionType('SELL'), 'CALL')
      break
    case 'F6':
      closeAllPositions()
      break
    case 'F7':
      cancelPendingOrders()
      break
  }
}
