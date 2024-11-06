import { computed, watch } from 'vue'
import {
  selectedBroker,
  fundLimits,
  flatTradePositionBook,
  shoonyaPositionBook,
  positionLTPs
} from '@/stores/globalStore'

export const availableBalance = computed(() => {
  // console.log('Fund Limits:', fundLimits.value);
  // console.log('Selected Broker:', selectedBroker.value?.brokerName);

  if (
    selectedBroker.value?.brokerName === 'Flattrade' ||
    selectedBroker.value?.brokerName === 'Shoonya'
  ) {
    const cash = Number(fundLimits.value.cash) || 0
    const payin = Number(fundLimits.value.payin) || 0
    const marginUsed = Number(fundLimits.value.marginused) || 0

    // Use payin if cash is zero, otherwise use cash
    const availableFunds = cash + payin

    const balance = availableFunds - marginUsed
    // console.log(`${selectedBroker.value?.brokerName} Available Balance:`, balance);
    return balance
  }
  return null
})
export const usedAmount = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    const marginUsed = Number(fundLimits.value.marginused) || 0
    return marginUsed
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    const marginUsed = Number(fundLimits.value.marginused) || 0
    return marginUsed
  }
  return 0
})
export const totalNetQty = computed(() => {
  const calculateTotalQty = (positions) => {
    return positions.reduce((total, position) => {
      const qty = Math.abs(parseInt(position.netQty || position.netqty, 10))
      return total + qty
    }, 0)
  }

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return calculateTotalQty(flatTradePositionBook.value)
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return calculateTotalQty(shoonyaPositionBook.value)
  }
  return 0
})
export const totalProfit = computed(() => {
  if (
    selectedBroker.value?.brokerName === 'Flattrade' ||
    selectedBroker.value?.brokerName === 'Shoonya'
  ) {
    return positionsWithCalculatedProfit.value.reduce((acc, position) => {
      const unrealizedProfit = position.calculatedUrmtom
      const realizedProfit = parseFloat(position.rpnl) || 0
      return acc + unrealizedProfit + realizedProfit
    }, 0)
  }
  return 0
})

export const calculateUnrealizedProfit = (position) => {
  const ltp =
    positionLTPs.value[position.tsym || position.tradingSymbol] || position.lp || position.lastPrice
  const netQty = parseFloat(position.netqty || position.netQty)
  const netAvgPrice = parseFloat(position.netavgprc || position.averagePrice)
  const priceFactor = parseFloat(position.prcftr || position.multiplier || 1)

  if (ltp && !isNaN(netQty) && !isNaN(netAvgPrice)) {
    return netQty * (ltp - netAvgPrice) * priceFactor
  }
  return 0
}

export const positionsWithCalculatedProfit = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.map((position) => ({
      ...position,
      calculatedUrmtom: calculateUnrealizedProfit(position)
    }))
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.map((position) => ({
      ...position,
      calculatedUrmtom: calculateUnrealizedProfit(position)
    }))
  }
  return []
})
export const totalCapitalPercentage = computed(() => {
  const totalMoney = Number(availableBalance.value) + Number(usedAmount.value)
  return totalMoney ? (Number(totalProfit.value) / totalMoney) * 100 : 0
})
export const totalBrokerage = computed(() => {
  let total = 0

  // Calculate totalValue based on totalBuyValue and totalSellValue
  const totalEquityValue = totalEquityBuyValue.value + totalEquitySellValue.value
  const totalDerivativeValue = totalDerivativeBuyValue.value + totalDerivativeSellValue.value

  if (
    selectedBroker.value?.brokerName === 'Flattrade' ||
    selectedBroker.value?.brokerName === 'Shoonya'
  ) {
    // Calculate charges for Flattrade and Shoonya (they have the same structure)
    const equityExchangeCharge = Math.round(totalEquityValue * 0.00003485 * 100) / 100 //avage price from both exchange
    const equityIpftCharge = Math.round(totalEquityValue * 0.000001 * 100) / 100
    const equitySebiCharge = Math.round(totalEquityValue * 0.000001 * 100) / 100
    const equityGstCharge =
      Math.round((equityExchangeCharge + equitySebiCharge + equityIpftCharge) * 18) / 100
    const equityStampdutyCharge = Math.round(totalEquityBuyValue.value * 0.00003)
    const equitySttCharge = Math.round(totalEquitySellValue.value * 0.00025)

    const derivativesExchangeCharge = Math.round(totalDerivativeValue * 0.000495 * 100) / 100
    const derivativesIpftCharge = Math.round(totalDerivativeValue * 0.000005 * 100) / 100
    const derivativesSebiCharge = Math.round(totalDerivativeValue * 0.000001 * 100) / 100
    const derivativesGstCharge =
      Math.round((derivativesExchangeCharge + derivativesIpftCharge + derivativesSebiCharge) * 18) /
      100
    const derivativesStampdutyCharge = Math.round(totalDerivativeBuyValue.value * 0.00003)
    const derivativesSttCharge = Math.round(totalDerivativeSellValue.value * 0.000625)

    // Add charges to total for Flattrade and Shoonya
    total +=
      equityExchangeCharge +
      equityIpftCharge +
      equitySebiCharge +
      equityGstCharge +
      equityStampdutyCharge +
      equitySttCharge +
      derivativesExchangeCharge +
      derivativesIpftCharge +
      derivativesSebiCharge +
      derivativesGstCharge +
      derivativesStampdutyCharge +
      derivativesSttCharge

    // No additional brokerage for Flattrade and Shoonya
  }

  return total
})
export const netPnl = computed(() => totalProfit.value - totalBrokerage.value)
export const totalBuyValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce(
      (total, position) => total + parseFloat(position.daybuyamt || 0),
      0
    )
  }
  if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.reduce(
      (total, position) => total + parseFloat(position.daybuyamt || 0),
      0
    )
  }
  return 0
})
export const totalSellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value.reduce(
      (total, position) => total + parseFloat(position.daysellamt || 0),
      0
    )
  }
  if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value.reduce(
      (total, position) => total + parseFloat(position.daysellamt || 0),
      0
    )
  }
  return 0
})
export const totalEquityBuyValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
  }
  return 0
})
export const totalEquitySellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter((position) => position.exch === 'BSE' || position.exch === 'NSE')
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
  }
  return 0
})
export const totalDerivativeBuyValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daybuyamt || 0), 0)
  }
  return 0
})
export const totalDerivativeSellValue = computed(() => {
  if (selectedBroker.value?.brokerName === 'Flattrade') {
    return flatTradePositionBook.value
      .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    return shoonyaPositionBook.value
      .filter((position) => position.exch === 'BFO' || position.exch === 'NFO')
      .reduce((total, position) => total + parseFloat(position.daysellamt || 0), 0)
  }
  return 0
})
