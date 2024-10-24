// Global Store
import { additionalSymbols, callStrikes, putStrikes } from '@/stores/globalStore'

// Vue
import { computed } from 'vue'

// Composables
import { getMasterSymbolPrice } from '@/composables/useMarketData'
export const additionalStrikes = computed(() => {
  if (!additionalSymbols.value) return []

  const currentPrice = getMasterSymbolPrice()
  const allStrikes = [
    ...new Set([...callStrikes.value, ...putStrikes.value].map((strike) => strike.strikePrice))
  ].sort((a, b) => a - b)

  const currentIndex = allStrikes.findIndex((strike) => strike >= currentPrice)
  const startIndex = Math.max(0, currentIndex - 3)
  const endIndex = Math.min(allStrikes.length - 1, currentIndex + 3)

  return allStrikes.slice(startIndex, endIndex + 1)
})
