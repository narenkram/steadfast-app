import {
  socket,
  selectedBroker,
  wsConnectionState,
  reconnectAttempts,
  messageQueue,
  selectedMasterSymbol,
  defaultCallSecurityId,
  defaultPutSecurityId,
  currentSubscriptions,
  exchangeSymbols,
  niftyPrice,
  bankNiftyPrice,
  finniftyPrice,
  midcpniftyPrice,
  sensexPrice,
  bankexPrice,
  latestCallLTP,
  latestPutLTP,
  positionSecurityIds,
  positionLTPs,
  masterOpenPrice,
  masterHighPrice,
  masterLowPrice,
  masterClosePrice,
  callOpenPrice,
  callHighPrice,
  callLowPrice,
  callClosePrice,
  putOpenPrice,
  putHighPrice,
  putLowPrice,
  putClosePrice,
  flatTradePositionBook,
  shoonyaPositionBook
} from '@/stores/globalStore'

import { brokerStatus } from '@/composables/useBrokerFunctions'

// Trade Configuration Composables
import { getExchangeSegment } from '@/composables/useTradeConfiguration'

export const isWebSocketReady = () => {
  return socket.value && socket.value.readyState === WebSocket.OPEN
}
export const safeWebSocketSend = (data) => {
  if (!isWebSocketReady()) {
    console.warn('WebSocket not ready, queuing message:', data)
    // Queue the message to be sent when connection is restored
    messageQueue.push(data)
    return false
  }

  try {
    socket.value.send(JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Error sending WebSocket message:', error)
    return false
  }
}
export const connectWebSocket = () => {
  let websocketUrl
  let reconnectTimer = null

  // Clear any existing connection state
  if (socket.value) {
    console.log('Closing existing WebSocket connection')
    socket.value.close()
    socket.value = null
  }

  const isDev = import.meta.env.DEV
  const wsBaseUrl = isDev
    ? 'ws://localhost'
    : import.meta.env.VITE_BASE_URL.replace('http', 'ws').replace('https', 'wss')

  const getWebSocketUrl = (broker) => {
    if (isDev) {
      return broker === 'Flattrade' ? `${wsBaseUrl}:8765` : `${wsBaseUrl}:8766`
    } else {
      return `${wsBaseUrl}/ws/${broker.toLowerCase()}`
    }
  }

  if (
    !['Flattrade', 'Shoonya'].includes(selectedBroker.value?.brokerName) ||
    brokerStatus.value !== 'Connected'
  ) {
    console.error('Invalid broker or broker not connected')
    return
  }

  websocketUrl = getWebSocketUrl(selectedBroker.value.brokerName)
  console.log(`Attempting to connect to WebSocket at ${websocketUrl}`)

  const connect = () => {
    try {
      socket.value = new WebSocket(websocketUrl)

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (socket.value?.readyState !== WebSocket.OPEN) {
          console.log('Connection timeout, retrying...')
          socket.value?.close()
          reconnect()
        }
      }, 5000)

      socket.value.onopen = (event) => {
        clearTimeout(connectionTimeout)
        console.log('WebSocket connection opened:', event)
        wsConnectionState.value = 'connected'
        reconnectAttempts.value = 0

        // Immediately send initial subscriptions
        const initialData = {
          action: 'initialize',
          broker: selectedBroker.value.brokerName,
          masterSymbol: selectedMasterSymbol.value,
          callSecurityId: defaultCallSecurityId.value,
          putSecurityId: defaultPutSecurityId.value
        }
        socket.value.send(JSON.stringify(initialData))

        // Subscribe to required symbols immediately
        subscribeToMasterSymbol()
        subscribeToOptions()
      }

      socket.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Process message immediately
          handleWebSocketMessage(event)
        } catch (error) {
          console.error('Error handling WebSocket message:', error)
        }
      }

      socket.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        wsConnectionState.value = 'error'
      }

      socket.value.onclose = (event) => {
        console.log('WebSocket connection closed:', event)
        wsConnectionState.value = 'disconnected'
        if (!event.wasClean) {
          reconnect()
        }
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      reconnect()
    }
  }

  const reconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
    reconnectTimer = setTimeout(connect, 1000)
  }

  connect()
}

export const handleWebSocketMessage = (event) => {
  try {
    const data = JSON.parse(event.data)
    // console.log('Processing WebSocket message:', data)

    // Process quote data immediately
    if (data.lp) {
      // Update master symbol price first
      updateMasterSymbolPrice(data)

      // Update option prices
      updateOptionPrices(data)

      // Update position LTPs
      updatePositionLTPs(data)

      // Log updates for debugging
      // console.log('Updated prices:', {
      //   masterSymbol: selectedMasterSymbol.value,
      //   securityId: data.tk,
      //   price: data.lp,
      //   callSecurityId: defaultCallSecurityId.value,
      //   putSecurityId: defaultPutSecurityId.value,
      //   callPrice: latestCallLTP.value,
      //   putPrice: latestPutLTP.value
      // })
    }
  } catch (error) {
    console.error('Error processing WebSocket message:', error)
  }
}

export const updateMasterSymbolPrice = (quoteData) => {
  const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value]
  if (symbolInfo && quoteData.tk === symbolInfo.exchangeSecurityId) {
    const priceMap = {
      NIFTY: niftyPrice,
      BANKNIFTY: bankNiftyPrice,
      FINNIFTY: finniftyPrice,
      MIDCPNIFTY: midcpniftyPrice,
      SENSEX: sensexPrice,
      BANKEX: bankexPrice
    }

    if (priceMap[selectedMasterSymbol.value]) {
      const newPrice = parseFloat(quoteData.lp)
      if (!isNaN(newPrice)) {
        priceMap[selectedMasterSymbol.value].value = newPrice
        // console.log(`Updated ${selectedMasterSymbol.value} price to:`, newPrice)
        updateOHLCIfNotEmpty('master', quoteData)
      } else {
        console.warn('Invalid price received for master symbol:', quoteData.lp)
      }
    }
  }
}

export const updateOptionPrices = (quoteData) => {
  const newPrice = parseFloat(quoteData.lp)
  if (isNaN(newPrice)) {
    console.warn('Invalid option price received:', quoteData.lp)
    return
  }

  if (quoteData.tk === defaultCallSecurityId.value) {
    latestCallLTP.value = newPrice
    // console.log('Updated Call LTP:', newPrice)
    updateOHLCIfNotEmpty('call', quoteData)
  } else if (quoteData.tk === defaultPutSecurityId.value) {
    latestPutLTP.value = newPrice
    // console.log('Updated Put LTP:', newPrice)
    updateOHLCIfNotEmpty('put', quoteData)
  }
}

export const updatePositionLTPs = (quoteData) => {
  const positionTsym = Object.keys(positionSecurityIds.value).find(
    (tsym) => positionSecurityIds.value[tsym] === quoteData.tk
  )

  if (positionTsym) {
    const newPrice = parseFloat(quoteData.lp)
    if (!isNaN(newPrice)) {
      // Create a new object to ensure reactivity
      positionLTPs.value = {
        ...positionLTPs.value,
        [positionTsym]: newPrice
      }
      // console.log(`Updated LTP for position ${positionTsym}:`, newPrice)
    } else {
      console.warn(`Invalid price received for position ${positionTsym}:`, quoteData.lp)
    }
  }
}

// Helper function to update OHLC values if they are not empty
export const updateOHLCIfNotEmpty = (type, data) => {
  if (type === 'master') {
    if (data.o) masterOpenPrice.value = data.o
    if (data.h) masterHighPrice.value = data.h
    if (data.l) masterLowPrice.value = data.l
    if (data.c) masterClosePrice.value = data.c
  } else if (type === 'call') {
    if (data.o) callOpenPrice.value = data.o
    if (data.h) callHighPrice.value = data.h
    if (data.l) callLowPrice.value = data.l
    if (data.c) callClosePrice.value = data.c
  } else if (type === 'put') {
    if (data.o) putOpenPrice.value = data.o
    if (data.h) putHighPrice.value = data.h
    if (data.l) putLowPrice.value = data.l
    if (data.c) putClosePrice.value = data.c
  }
}

export const subscribeToMasterSymbol = () => {
  if (!isWebSocketReady()) return

  const symbolInfo = exchangeSymbols.value.symbolData[selectedMasterSymbol.value]
  if (symbolInfo) {
    const symbolToSubscribe = `${symbolInfo.exchangeCode}|${symbolInfo.exchangeSecurityId}`
    if (
      symbolToSubscribe !==
      `${currentSubscriptions.value.masterSymbolExchangeCode}|${currentSubscriptions.value.masterSymbolSecurityId}`
    ) {
      const data = {
        action: 'subscribe',
        symbols: [symbolToSubscribe]
      }

      if (safeWebSocketSend(data)) {
        currentSubscriptions.value.masterSymbol = selectedMasterSymbol.value
        currentSubscriptions.value.masterSymbolExchangeCode = symbolInfo.exchangeCode
        currentSubscriptions.value.masterSymbolSecurityId = symbolInfo.exchangeSecurityId
      }
    }
  }
}
export const subscribeToOptions = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const symbolsToSubscribe = []
    const exchangeSegment = getExchangeSegment()

    // Add subscriptions for both Call and Put options
    if (defaultCallSecurityId.value && defaultCallSecurityId.value !== 'N/A') {
      symbolsToSubscribe.push(`${exchangeSegment}|${defaultCallSecurityId.value}`)
      currentSubscriptions.value.callOption = defaultCallSecurityId.value
    }
    if (defaultPutSecurityId.value && defaultPutSecurityId.value !== 'N/A') {
      symbolsToSubscribe.push(`${exchangeSegment}|${defaultPutSecurityId.value}`)
      currentSubscriptions.value.putOption = defaultPutSecurityId.value
    }

    if (symbolsToSubscribe.length > 0) {
      const data = {
        action: 'subscribe',
        symbols: symbolsToSubscribe
      }
      socket.value.send(JSON.stringify(data))
    }
  }

  // Subscribe to position LTPs separately
  subscribeToPositionLTPs()
}

export const unsubscribeFromSymbols = (symbols) => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN && symbols.length > 0) {
    const data = {
      action: 'unsubscribe',
      symbols: symbols
    }
    // console.log('Sending unsubscribe data:', data);
    socket.value.send(JSON.stringify(data))
  }
}

export const subscribeToPositionLTPs = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    const symbolsToSubscribe = Object.entries(positionSecurityIds.value)
      .map(([tsym, token]) => {
        const position = [...flatTradePositionBook.value, ...shoonyaPositionBook.value].find(
          (p) => p.tsym === tsym
        )

        if (!position) {
          // console.warn(`No position found for tsym: ${tsym}`);
          return null
        }

        const exchange = position.exch || position.exchangeSegment
        return `${exchange}|${token}`
      })
      .filter(Boolean)

    if (symbolsToSubscribe.length > 0) {
      const data = {
        action: 'subscribe',
        symbols: symbolsToSubscribe
      }
      // console.log('Sending position LTPs subscribe data:', data);
      socket.value.send(JSON.stringify(data))
    }
  }
}
