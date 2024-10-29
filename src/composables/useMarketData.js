import {
  BASE_URL,
  selectedMasterSymbol,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  socket,
  ltpCallbacks,
  callStrikes,
  putStrikes,
  allSymbolsData,
  selectedBroker,
  selectedExpiry,
  expiryDates,
  dataFetched
} from '@/stores/globalStore'

// Trade Configuration Composables
import { getExchangeSegment, updateStrikesForExpiry } from '@/composables/useTradeConfiguration'

export const fetchTradingData = async () => {
  const masterSymbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX']

  for (const symbol of masterSymbols) {
    try {
      let exchangeSymbol

      // Set the correct exchange symbol
      if (['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'].includes(symbol)) {
        exchangeSymbol = 'NFO'
      } else if (['SENSEX', 'BANKEX'].includes(symbol)) {
        exchangeSymbol = 'BFO'
      } else {
        throw new Error(`Unknown symbol: ${symbol}`)
      }

      let response
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        response = await fetch(
          `${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`
        )
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        response = await fetch(
          `${BASE_URL}/shoonya/symbols?exchangeSymbol=${exchangeSymbol}&masterSymbol=${symbol}`
        )
      } else {
        throw new Error('Unsupported broker')
      }

      const data = await response.json()

      allSymbolsData[symbol] = {
        expiryDates: data.expiryDates || [],
        callStrikes: Array.isArray(data.callStrikes)
          ? data.callStrikes
              .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
              .map((strike) => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }))
          : [],
        putStrikes: Array.isArray(data.putStrikes)
          ? data.putStrikes
              .sort((a, b) => parseInt(a.strikePrice) - parseInt(b.strikePrice))
              .map((strike) => ({ ...strike, strikePrice: parseInt(strike.strikePrice) }))
          : []
      }

      // Set initial price for each symbol
      const priceKey = `${symbol.toLowerCase()}Price`
      if (priceKey in window && window[priceKey].value === 'N/A') {
        window[priceKey].value = getInitialPrice(symbol)
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
      allSymbolsData[symbol] = { expiryDates: [], callStrikes: [], putStrikes: [] }
    }
  }

  // Update the reactive properties for the currently selected symbol
  updateSymbolData(selectedMasterSymbol.value)

  updateStrikesForExpiry(selectedExpiry.value)
  dataFetched.value = true

  // Cache the fetched data
  localStorage.setItem('cachedTradingData', JSON.stringify(allSymbolsData))
}

export const updateSymbolData = (symbol) => {
  if (allSymbolsData[symbol]) {
    expiryDates.value = allSymbolsData[symbol].expiryDates
    callStrikes.value = allSymbolsData[symbol].callStrikes
    putStrikes.value = allSymbolsData[symbol].putStrikes
  } else {
    console.error(`No data found for ${symbol}`)
  }
}
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
