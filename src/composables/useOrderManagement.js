import { ref } from 'vue'
import axios from 'axios'
import qs from 'qs'

// Global State
import {
  BASE_URL,
  selectedCallStrike,
  selectedPutStrike,
  quantities,
  selectedMasterSymbol,
  selectedOrderType,
  selectedQuantity,
  selectedBroker,
  selectedProductType,
  toastMessage,
  showToast,
  flatTradePositionBook,
  shoonyaPositionBook,
  flatOrderBook,
  shoonyaOrderBook,
  selectedExchange,
  enableStoploss,
  enableTarget,
  stoplossValue,
  targetValue,
  limitPrice
} from '@/stores/globalStore'

// Trade Configuration Composables
import { getExchangeSegment, getProductTypeValue } from '@/composables/useTradeConfiguration'

// Order Management Composables
import { selectedLots, getTransactionType } from '@/composables/useTradeConfiguration'

// Portfolio Management Composables
import {
  updateOrdersAndPositions,
  updateFundLimits,
  findNewPosition,
  getSymbol,
  fetchFlattradeOrdersTradesBook,
  fetchShoonyaOrdersTradesBook
} from '@/composables/usePositionManagement'

// Risk Management Composables
import { setStoploss, setTarget } from '@/composables/useRiskManagement'

export const prepareOrderPayload = (
  transactionType,
  drvOptionType,
  selectedStrike,
  exchangeSegment
) => {
  let price = '0'
  let priceType = 'MKT'

  switch (selectedOrderType.value) {
    case 'LMT':
      price = limitPrice.value.toString()
      priceType = 'LMT'
      break
    case 'LMT_LTP':
      price = getCurrentLTP().toString()
      priceType = 'LMT'
      break
  }

  const commonPayload = {
    uid: selectedBroker.value.clientId,
    actid: selectedBroker.value.clientId,
    exch: exchangeSegment,
    tsym: selectedStrike.tradingSymbol,
    qty: selectedQuantity.value.toString(),
    prc: price,
    prd: getProductTypeValue(selectedProductType.value),
    trantype: getTransactionType(transactionType),
    prctyp: priceType,
    ret: 'DAY',
    ordersource: 'API'
  }

  switch (selectedBroker.value?.brokerName) {
    case 'Flattrade':
      return {
        ...commonPayload
        // Add any additional fields specific to Flattrade here
      }
    case 'Shoonya':
      return {
        ...commonPayload
        // Add any additional fields specific to Shoonya here
      }
    default:
      throw new Error('Unsupported broker')
  }
}
export const placeOrder = async (transactionType, drvOptionType) => {
  try {
    let selectedStrike =
      drvOptionType === 'CALL' ? selectedCallStrike.value : selectedPutStrike.value

    if (!selectedStrike || !selectedStrike.tradingSymbol || !selectedStrike.securityId) {
      throw new Error(`Selected ${drvOptionType.toLowerCase()} strike is not properly defined`)
    }

    const exchangeSegment = getExchangeSegment()
    const instrument = quantities.value[selectedMasterSymbol.value]
    const freezeLimit = instrument.freezeLimit
    const orderLots = selectedLots.value
    const fullOrderQuantity = selectedQuantity.value

    let remainingLots = orderLots
    let placedLots = 0

    while (remainingLots > 0) {
      const lotsToPlace = Math.min(remainingLots, freezeLimit)
      const quantityToPlace = lotsToPlace * instrument.lotSize

      const orderData = prepareOrderPayload(
        transactionType,
        drvOptionType,
        selectedStrike,
        exchangeSegment
      )
      orderData.qty = quantityToPlace.toString()

      // Handle dynamic price updates for LMT_LTP
      if (['LMT_LTP'].includes(selectedOrderType.value)) {
        const currentLTP = getCurrentLTP()
        orderData.prc = currentLTP.toString()
      }

      let response
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
        const payload = qs.stringify(orderData)
        response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
          headers: {
            Authorization: `Bearer ${FLATTRADE_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
        const payload = qs.stringify(orderData)
        response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
          headers: {
            Authorization: `Bearer ${SHOONYA_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      }

      console.log(`Placed order for ${lotsToPlace} lots (${quantityToPlace} quantity)`)
      console.log('Order placed successfully:', response.data)
      remainingLots -= lotsToPlace
      placedLots += lotsToPlace

      // Add a small delay between orders for LMT_LTP to get updated LTP
      if (['LMT_LTP'].includes(selectedOrderType.value)) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    console.log(
      `All orders placed successfully. Total: ${placedLots} lots (${fullOrderQuantity} quantity)`
    )
    toastMessage.value = `Order(s) placed successfully for ${placedLots} lots`
    showToast.value = true

    // Add a delay before fetching updated data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update both orders and positions
    await updateOrdersAndPositions()

    // Find the new position after updating positions
    const newPosition = findNewPosition(selectedStrike.tradingSymbol)

    // If predefined stoploss is enabled, set stoploss for the new position
    if (enableStoploss.value && stoplossValue.value > 0 && newPosition) {
      setStoploss(newPosition, 'static')
    }

    // If predefined target is enabled, set target for the new position
    if (enableTarget.value && targetValue.value > 0 && newPosition) {
      setTarget(newPosition)
    }

    // Update fund limits
    await updateFundLimits()
  } catch (error) {
    console.error('Error placing order:', error)
    if (error.response?.data?.message) {
      const firstThreeWords = error.response.data.message.split(' ').slice(0, 3).join(' ')
      toastMessage.value = firstThreeWords
    } else {
      toastMessage.value = 'Failed to place order unfortunately'
    }
    showToast.value = true
  }
}
export const placeOrderForPosition = async (transactionType, optionType, position) => {
  try {
    const quantity = Math.abs(Number(position.netQty || position.netqty))
    const instrument = quantities.value[selectedMasterSymbol.value]
    const freezeLimit = instrument.freezeLimit * instrument.lotSize

    if (quantity === 0) {
      console.log('Quantity is zero, no order will be placed.')
      return
    }

    let remainingQuantity = quantity
    let placedQuantity = 0

    while (remainingQuantity > 0) {
      const quantityToPlace = Math.min(remainingQuantity, freezeLimit)

      let orderData
      if (
        selectedBroker.value?.brokerName === 'Flattrade' ||
        selectedBroker.value?.brokerName === 'Shoonya'
      ) {
        orderData = {
          uid: selectedBroker.value.clientId,
          actid: selectedBroker.value.clientId,
          exch: selectedExchange.value === 'NFO' ? 'NFO' : 'BFO',
          tsym: position.tsym,
          qty: quantityToPlace.toString(),
          prc: '0',
          prd: position.prd,
          trantype: transactionType,
          prctyp: 'MKT',
          ret: 'DAY'
        }
      }

      let response
      if (selectedBroker.value?.brokerName === 'Flattrade') {
        const FLATTRADE_API_TOKEN = localStorage.getItem('FLATTRADE_API_TOKEN')
        const payload = qs.stringify(orderData)
        response = await axios.post(`${BASE_URL}/flattrade/placeOrder`, payload, {
          headers: {
            Authorization: `Bearer ${FLATTRADE_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      } else if (selectedBroker.value?.brokerName === 'Shoonya') {
        const SHOONYA_API_TOKEN = localStorage.getItem('SHOONYA_API_TOKEN')
        const payload = qs.stringify(orderData)
        response = await axios.post(`${BASE_URL}/shoonya/placeOrder`, payload, {
          headers: {
            Authorization: `Bearer ${SHOONYA_API_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      }

      console.log(`Placed order for ${quantityToPlace} quantity`)

      remainingQuantity -= quantityToPlace
      placedQuantity += quantityToPlace
    }

    console.log(`All orders placed successfully. Total: ${placedQuantity} quantity`)
    toastMessage.value = `Order(s) placed successfully for ${getSymbol(position)}`
    showToast.value = true

    // Add a delay before fetching updated data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update both orders and positions
    await updateOrdersAndPositions()

    // Update fund limits
    await updateFundLimits()
  } catch (error) {
    console.error('Failed to place order for position:', error)
    toastMessage.value = 'Failed to place order for SL/Target'
    showToast.value = true
  }
}
export const closeAllPositions = async () => {
  try {
    let positionsClosed = false

    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const sortedPositions = [...flatTradePositionBook.value].sort(
        (a, b) => Number(b.netqty) - Number(a.netqty)
      )
      for (const position of sortedPositions) {
        const netqty = Number(position.netqty)
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B'
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
          await placeOrderForPosition(transactionType, optionType, position)
          positionsClosed = true
        }
      }
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const sortedPositions = [...shoonyaPositionBook.value].sort(
        (a, b) => Number(b.netqty) - Number(a.netqty)
      )
      for (const position of sortedPositions) {
        const netqty = Number(position.netqty)
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B'
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
          await placeOrderForPosition(transactionType, optionType, position)
          positionsClosed = true
        }
      }
    }

    // Add a delay before fetching updated data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update both orders and positions
    await updateOrdersAndPositions()

    // Update fund limits
    await updateFundLimits()

    if (positionsClosed) {
      toastMessage.value = `All ${selectedBroker.value?.brokerName} positions closed successfully`
    } else {
      toastMessage.value = `No positions to close for ${selectedBroker.value?.brokerName}`
    }
    showToast.value = true
  } catch (error) {
    console.error('Error closing positions:', error)
    toastMessage.value = 'Failed to close all positions'
    showToast.value = true
  }
}
export const cancelOrder = async (order) => {
  const orderId = order.norenordno
  const orderStatus = order.status

  console.log(`Attempting to cancel order ${orderId} with status ${orderStatus}`)
  // console.log(`Broker: ${selectedBroker.value?.brokerName}`);

  if (orderStatus !== 'OPEN') {
    console.log(`Order ${orderId} is not in a cancellable state and cannot be canceled.`)
    return
  }

  try {
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      const jKey = localStorage.getItem('FLATTRADE_API_TOKEN') || token.value
      const clientId = selectedBroker.value.clientId
      console.log(`Sending request to cancel Flattrade order ${orderId}`)
      await axios.post(
        `${BASE_URL}/flattrade/cancelOrder`,
        {
          norenordno: orderId,
          uid: clientId
        },
        {
          params: {
            FLATTRADE_API_TOKEN: jKey
          }
        }
      )
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      const jKey = localStorage.getItem('SHOONYA_API_TOKEN') || token.value
      const clientId = selectedBroker.value.clientId
      console.log(`Sending request to cancel Shoonya order ${orderId}`)
      await axios.post(
        `${BASE_URL}/shoonya/cancelOrder`,
        {
          norenordno: orderId,
          uid: clientId
        },
        {
          params: {
            SHOONYA_API_TOKEN: jKey
          }
        }
      )
    }
    console.log(`Order ${orderId} canceled successfully.`)
    // Update fund limits
    await updateFundLimits()
  } catch (error) {
    console.error(`Failed to cancel order ${orderId}:`, error)
    toastMessage.value = 'Failed to cancel order'
    showToast.value = true
    throw error // Rethrow to handle in cancelPendingOrders
  }
}
export const cancelPendingOrders = async () => {
  // Fetch orders based on the selected broker
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    await fetchFlattradeOrdersTradesBook()
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    await fetchShoonyaOrdersTradesBook()
  }

  let pendingOrders
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    pendingOrders = flatOrderBook.value.filter((order) => order.status === 'OPEN')
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    pendingOrders = shoonyaOrderBook.value.filter((order) => order.status === 'OPEN')
  } else {
    console.error('Unknown broker')
    return
  }

  const cancelPromises = pendingOrders.map((order) => cancelOrder(order))
  console.log(`Canceling pending orders for broker: ${selectedBroker.value?.brokerName}`) // placed here to prevent delay and debugging if required
  console.log(`Pending orders:`, pendingOrders) // placed here to prevent delay and debugging if required

  try {
    await Promise.all(cancelPromises)
    toastMessage.value = 'Pending orders canceled successfully'
    showToast.value = true

    // Refresh the orders list based on the selected broker
    if (selectedBroker.value?.brokerName === 'Flattrade') {
      await fetchFlattradeOrdersTradesBook()
    } else if (selectedBroker.value?.brokerName === 'Shoonya') {
      await fetchShoonyaOrdersTradesBook()
    }
  } catch (error) {
    console.error('Failed to cancel orders:', error)
    toastMessage.value = 'Failed to cancel some orders'
    showToast.value = true
  }
}
export const closeSelectedPositions = async () => {
  try {
    let positionsClosed = false

    if (selectedBroker.value?.brokerName === 'Shoonya') {
      // Create a copy of the selected positions to iterate over
      const positionsToClose = [...selectedShoonyaPositionsSet.value]

      for (const tsym of positionsToClose) {
        const position = shoonyaPositionBook.value.find((p) => p.tsym === tsym)
        const netqty = Number(position.netqty)
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B'
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
          await placeOrderForPosition(transactionType, optionType, position)
          positionsClosed = true

          // Remove the closed position from the selected positions
          selectedShoonyaPositionsSet.value.delete(tsym)
        }
      }
    } else if (selectedBroker.value?.brokerName === 'Flattrade') {
      // Create a copy of the selected positions to iterate over
      const positionsToClose = [...selectedFlattradePositionsSet.value]

      for (const tsym of positionsToClose) {
        const position = flatTradePositionBook.value.find((p) => p.tsym === tsym)
        const netqty = Number(position.netqty)
        if (netqty !== 0) {
          const transactionType = netqty > 0 ? 'S' : 'B'
          const optionType = position.tsym.includes('C') ? 'CALL' : 'PUT'
          await placeOrderForPosition(transactionType, optionType, position)
          positionsClosed = true

          // Remove the closed position from the selected positions
          selectedFlattradePositionsSet.value.delete(tsym)
        }
      }
    }

    // Add a delay before fetching updated data
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update both orders and positions
    await updateOrdersAndPositions()

    // Update fund limits
    await updateFundLimits()

    if (positionsClosed) {
      toastMessage.value = `Selected positions closed successfully`
    } else {
      toastMessage.value = `No positions to close`
    }
    showToast.value = true
  } catch (error) {
    console.error('Error closing selected positions:', error)
    toastMessage.value = 'Failed to close selected positions'
    showToast.value = true
  }
}
