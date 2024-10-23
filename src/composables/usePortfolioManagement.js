import { selectedBroker } from '@/stores/globalStore'
import axios from 'axios'

import {
  BASE_URL,
  flatTradePositionBook,
  shoonyaPositionBook,
  positionSecurityIds,
  socket,
  defaultCallSecurityId,
  defaultPutSecurityId,
  additionalSymbols,
  currentSubscriptions,
  toastMessage,
  showToast,
  flatOrderBook,
  flatTradeBook,
  shoonyaOrderBook,
  shoonyaTradeBook,
  fundLimits,
  callStrikes,
  putStrikes
} from '@/stores/globalStore'

// Trade Configuration Composables
import { getExchangeSegment } from '@/composables/useTradeConfiguration'

// Additional Strikes Composables
import { additionalStrikes } from '@/composables/useAdditionalStrikes'

// Real Time LTP Data Composables
import { subscribeToLTP, updateAdditionalStrikeLTP } from '@/composables/useRealTimeLtpData'

export const updateFundLimits = async () => {
  await fetchFundLimit()
  // console.log('Updated Fund Limits:', fundLimits.value);
}
export const fetchFundLimit = async () => {
  try {
    if (!selectedBroker.value) {
      throw new Error('No broker selected')
    }

    let response
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
      if (!FLATTRADE_API_TOKEN) {
        throw new Error('Flattrade API Token is missing')
      }
      response = await axios.post(`${BASE_URL}/flattrade/fundLimit`, null, {
        params: {
          FLATTRADE_API_TOKEN,
          FLATTRADE_CLIENT_ID: selectedBroker.value.clientId
        }
      })
      fundLimits.value = {
        cash: response.data.cash,
        payin: response.data.payin,
        marginused: response.data.marginused
      }
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
      if (!SHOONYA_API_TOKEN) {
        throw new Error('Shoonya API Token is missing')
      }
      response = await axios.post(`${BASE_URL}/shoonya/fundLimit`, null, {
        params: {
          SHOONYA_API_TOKEN,
          SHOONYA_CLIENT_ID: selectedBroker.value.clientId
        }
      })
      // Make sure the response data has the correct structure
      fundLimits.value = {
        cash: response.data.cash,
        payin: response.data.payin,
        marginused: response.data.marginused
        // Add any other relevant fields from the Shoonya response
      }
    } else {
      throw new Error('Unsupported broker')
    }
    // fundLimits.value = response.data;
  } catch (error) {
    console.error('Failed to fetch fund limits:', error)
  }
}

export const fetchFlattradeOrdersTradesBook = async () => {
  let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
    toastMessage.value = 'Flattrade broker is not selected.'
    showToast.value = true
    return
  }

  const clientId = selectedBroker.value.clientId

  if (!jKey || !clientId) {
    toastMessage.value = 'Token or Client ID is missing. Please generate a token first.'
    showToast.value = true
    return
  }

  try {
    const response = await axios.get(`${BASE_URL}/flattrade/getOrdersAndTrades`, {
      params: {
        FLATTRADE_API_TOKEN: jKey,
        FLATTRADE_CLIENT_ID: clientId
      }
    })

    flatOrderBook.value = response.data.orderBook
    flatTradeBook.value = response.data.tradeBook
    // console.log('Flattrade Order Book:', response.data.orderBook);
    // console.log('Flattrade Trade Book:', response.data.tradeBook);
  } catch (error) {
    toastMessage.value = 'Error fetching trades: ' + error.message
    showToast.value = true
    console.error('Error fetching trades:', error)
  }
}
export const fetchShoonyaOrdersTradesBook = async () => {
  let jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
    toastMessage.value = 'Shoonya broker is not selected.'
    showToast.value = true
    return
  }

  const clientId = selectedBroker.value.clientId

  if (!jKey || !clientId) {
    toastMessage.value = 'Token or Client ID is missing. Please generate a token first.'
    showToast.value = true
    return
  }

  try {
    const response = await axios.get(`${BASE_URL}/shoonya/getOrdersAndTrades`, {
      params: {
        SHOONYA_API_TOKEN: jKey,
        SHOONYA_CLIENT_ID: clientId
      }
    })

    shoonyaOrderBook.value = response.data.orderBook
    shoonyaTradeBook.value = response.data.tradeBook
    // console.log('Shoonya Order Book:', response.data.orderBook);
    // console.log('Shoonya Trade Book:', response.data.tradeBook);
  } catch (error) {
    toastMessage.value = 'Error fetching trades: ' + error.message
    showToast.value = true
    console.error('Error fetching trades:', error)
  }
}
export const updatePositionSecurityIds = () => {
  flatTradePositionBook.value.forEach((position) => {
    if (position.tsym && !positionSecurityIds.value[position.tsym]) {
      positionSecurityIds.value[position.tsym] = position.token
    }
  })
  // Add this block for Shoonya positions
  shoonyaPositionBook.value.forEach((position) => {
    if (position.tsym && !positionSecurityIds.value[position.tsym]) {
      positionSecurityIds.value[position.tsym] = position.token
    }
  })
}
export const fetchFlattradePositions = async () => {
  let jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value

  if (!jKey) {
    toastMessage.value = 'Token is missing. Please generate a token first.'
    showToast.value = true
    return
  }

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
    toastMessage.value = 'Flattrade broker is not selected.'
    showToast.value = true
    return
  }

  const clientId = selectedBroker.value.clientId

  const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: clientId, actid: clientId })}`

  try {
    const positionBookRes = await axios.post(
      'https://piconnect.flattrade.in/PiConnectTP/PositionBook',
      positionBookPayload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (
      Array.isArray(positionBookRes.data) &&
      positionBookRes.data.every((item) => item.stat === 'Ok')
    ) {
      flatTradePositionBook.value = positionBookRes.data
      // console.log('Flattrade Position Book:', positionBookRes.data);
      updatePositionSecurityIds()
      subscribeToPositionLTPs()
      subscribeToOptions()
    } else if (
      positionBookRes.data.emsg === 'no data' ||
      positionBookRes.data.emsg.includes('no data')
    ) {
      flatTradePositionBook.value = []
      // console.log('No positions in Flattrade Position Book');
    } else {
      const errorMsg = positionBookRes.data.emsg || 'Unknown error'
      console.error('Error fetching position book:', errorMsg)
      flatTradePositionBook.value = []
    }
  } catch (error) {
    console.error('Error fetching position book:', error)
    flatTradePositionBook.value = []
  }
}
export const fetchShoonyaPositions = async () => {
  let jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value

  if (!jKey) {
    toastMessage.value = 'Token is missing. Please generate a token first.'
    showToast.value = true
    return
  }

  if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
    toastMessage.value = 'Shoonya broker is not selected.'
    showToast.value = true
    return
  }

  const clientId = selectedBroker.value.clientId

  const positionBookPayload = `jKey=${jKey}&jData=${JSON.stringify({ uid: clientId, actid: clientId })}`

  try {
    const positionBookRes = await axios.post(
      'https://api.shoonya.com/NorenWClientTP/PositionBook',
      positionBookPayload,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (
      Array.isArray(positionBookRes.data) &&
      positionBookRes.data.every((item) => item.stat === 'Ok')
    ) {
      shoonyaPositionBook.value = positionBookRes.data
      // console.log('Shoonya Position Book:', positionBookRes.data);
      updatePositionSecurityIds()
      subscribeToPositionLTPs()
      subscribeToOptions()
    } else if (
      positionBookRes.data.emsg === 'no data' ||
      positionBookRes.data.emsg.includes('no data')
    ) {
      shoonyaPositionBook.value = []
      // console.log('No positions in Shoonya Position Book');
    } else {
      const errorMsg = positionBookRes.data.emsg || 'Unknown error'
      console.error('Error fetching position book:', errorMsg)
      shoonyaPositionBook.value = []
    }
  } catch (error) {
    console.error('Error fetching position book:', error)
    shoonyaPositionBook.value = []
  }
}

export const updateOrdersAndPositions = async () => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    await Promise.all([fetchFlattradeOrdersTradesBook(), fetchFlattradePositions()])
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    await Promise.all([fetchShoonyaOrdersTradesBook(), fetchShoonyaPositions()])
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

    if (additionalSymbols.value) {
      additionalStrikes.value.forEach((strike) => {
        const callStrike = callStrikes.value.find((s) => s.strikePrice === strike)
        const putStrike = putStrikes.value.find((s) => s.strikePrice === strike)

        if (callStrike) subscribeToLTP(callStrike.securityId, updateAdditionalStrikeLTP)
        if (putStrike) subscribeToLTP(putStrike.securityId, updateAdditionalStrikeLTP)
      })
    }
  }

  // Subscribe to position LTPs separately
  subscribeToPositionLTPs()
}

export const findNewPosition = (tradingSymbol) => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.find((p) => p.tsym === tradingSymbol)
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.find((p) => p.tsym === tradingSymbol)
  }
  return null
}

export const getSymbol = (position) => {
  return position.tsym || position.tradingSymbol || ''
}
