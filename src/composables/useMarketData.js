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
  dataFetched,
  masterSymbols,
  selectedExchange
} from '@/stores/globalStore'

// Trade Configuration Composables
import { getExchangeSegment, updateStrikesForExpiry } from '@/composables/useTradeConfiguration'

export const fetchMasterSymbols = async () => {
  try {
    // Fetch NFO symbols
    const nfoResponse = await fetch(`${BASE_URL}/shoonya/masterSymbols?exchangeSymbol=NFO`)
    const nfoSymbols = await nfoResponse.json()
    masterSymbols.NFO = nfoSymbols

    // Fetch BFO symbols
    const bfoResponse = await fetch(`${BASE_URL}/shoonya/masterSymbols?exchangeSymbol=BFO`)
    const bfoSymbols = await bfoResponse.json()
    masterSymbols.BFO = bfoSymbols
  } catch (error) {
    console.error('Error fetching master symbols:', error)
    masterSymbols.NFO = []
    masterSymbols.BFO = []
  }
}

// Modify the fetchTradingData function
export const fetchTradingData = async () => {
  try {
    // Ensure master symbols are loaded
    if (!masterSymbols[selectedExchange.value]?.length) {
      await fetchMasterSymbols()
    }

    // Get the symbols for current exchange
    const symbols = masterSymbols[selectedExchange.value] || []

    for (const symbol of symbols) {
      try {
        let response
        if (
          selectedBroker.value?.brokerName === 'Flattrade' ||
          selectedBroker.value?.brokerName === 'Shoonya'
        ) {
          response = await fetch(
            `${BASE_URL}/shoonya/symbols?exchangeSymbol=${selectedExchange.value}&masterSymbol=${symbol}`
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
  } catch (error) {
    console.error('Error in fetchTradingData:', error)
  }
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
