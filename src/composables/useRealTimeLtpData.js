import {
  selectedMasterSymbol,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  socket,
  ltpCallbacks,
  additionalStrikeLTPs,
  callStrikes,
  putStrikes
} from '@/stores/globalStore'

// Trade Configuration Composables
import { getExchangeSegment } from '@/composables/useTradeConfiguration'

export const getMasterSymbolPrice = () => {
  switch (selectedMasterSymbol.value) {
    case 'NIFTY':
      return parseFloat(niftyPrice.value)
    case 'BANKNIFTY':
      return parseFloat(bankNiftyPrice.value)
    case 'FINNIFTY':
      return parseFloat(finniftyPrice.value)
    case 'MIDCPNIFTY':
      return parseFloat(midcpniftyPrice.value)
    case 'SENSEX':
      return parseFloat(sensexPrice.value)
    case 'BANKEX':
      return parseFloat(bankexPrice.value)
    default:
      return 0
  }
}
export const subscribeToLTP = (securityId, callback) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const exchangeSegment = getExchangeSegment()
    const symbolToSubscribe = `${exchangeSegment}|${securityId}`
    const data = {
      action: 'subscribe',
      symbols: [symbolToSubscribe]
    }
    socket.value.send(JSON.stringify(data))

    // Store the callback for this security ID
    ltpCallbacks.value[securityId] = callback
  }
}

export const updateAdditionalStrikeLTP = (data) => {
  const callStrike = callStrikes.value.find((s) => s.securityId === data.tk)
  const putStrike = putStrikes.value.find((s) => s.securityId === data.tk)

  if (callStrike) {
    additionalStrikeLTPs.value.call[callStrike.strikePrice] = data.lp
  } else if (putStrike) {
    additionalStrikeLTPs.value.put[putStrike.strikePrice] = data.lp
  }
}
