import { ref, watch, computed } from 'vue'
import {
  showLTPRangeBar,
  showOHLCValues,
  showStrikeDetails,
  stickyMTM,
  callStrikeOffset,
  putStrikeOffset,
  expiryOffset,
  overtradeProtection,
  notificationSound,
  totalRiskTargetToggle,
  totalRiskTargetType,
  totalRiskAmount,
  totalRiskPercentage,
  totalTargetAmount,
  totalTargetPercentage,
  closePositionsRisk,
  closePositionsTarget,
  riskAction,
  targetAction,
  toastMessage,
  showToast,
  selectedExpiry,
  expiryDates
} from '@/stores/globalStore'

// Trade Configuration Composables
import { updateStrikesForExpiry } from '@/composables/useTradeConfiguration'

// UI Settings
export const toggleLTPRangeBar = () => {
  showLTPRangeBar.value = !showLTPRangeBar.value
  localStorage.setItem('showLTPRangeBar', JSON.stringify(showLTPRangeBar.value))
}

export const toggleOHLCValues = () => {
  showOHLCValues.value = !showOHLCValues.value
  localStorage.setItem('showOHLCValues', JSON.stringify(showOHLCValues.value))
}

export const toggleStrikeDetails = () => {
  showStrikeDetails.value = !showStrikeDetails.value
  localStorage.setItem('showStrikeDetails', JSON.stringify(showStrikeDetails.value))
}

export const toggleStickyMTM = () => {
  stickyMTM.value = !stickyMTM.value
  localStorage.setItem('stickyMTM', JSON.stringify(stickyMTM.value))
}

// Trading Settings
export const saveOffsets = () => {
  localStorage.setItem('callStrikeOffset', callStrikeOffset.value)
  localStorage.setItem('putStrikeOffset', putStrikeOffset.value)
  localStorage.setItem('expiryOffset', expiryOffset.value)
}

watch([callStrikeOffset, putStrikeOffset], () => {
  saveOffsets()
  updateStrikesForExpiry(selectedExpiry.value, true)
})

export const saveExpiryOffset = () => {
  localStorage.setItem('expiryOffset', expiryOffset.value)
}
export const setDefaultExpiry = () => {
  if (expiryDates.value.length > 0) {
    const offsetIndex = parseInt(expiryOffset.value)
    const selectedIndex = Math.min(offsetIndex, expiryDates.value.length - 1)
    selectedExpiry.value = expiryDates.value[selectedIndex]
  }
}
watch(expiryOffset, (newValue) => {
  saveExpiryOffset()
  setDefaultExpiry()
})
export const toggleOvertradeProtection = () => {
  overtradeProtection.value = !overtradeProtection.value
  localStorage.setItem('OvertradeProtection', overtradeProtection.value.toString())
}

// Notification Settings
export const toggleNotificationSound = () => {
  localStorage.setItem('notificationSound', notificationSound.value.toString())
  showToastNotification(
    notificationSound.value ? 'Notification sound enabled' : 'Notification sound disabled'
  )
}

// Helper Functions
export const showToastNotification = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Watchers for Risk Management Settings
watch(
  [
    totalRiskTargetType,
    totalRiskAmount,
    totalRiskPercentage,
    totalTargetAmount,
    totalTargetPercentage
  ],
  () => {
    localStorage.setItem(
      'riskManagementSettings',
      JSON.stringify({
        type: totalRiskTargetType.value,
        riskAmount: totalRiskAmount.value,
        riskPercentage: totalRiskPercentage.value,
        targetAmount: totalTargetAmount.value,
        targetPercentage: totalTargetPercentage.value
      })
    )
  }
)

export const riskReached = computed(() => {
  if (totalRiskTargetToggle.value) {
    if (totalRiskTargetType.value === 'amount' && totalRiskAmount.value > 0) {
      return totalProfit.value <= -totalRiskAmount.value
    } else if (totalRiskTargetType.value === 'percentage' && totalRiskPercentage.value > 0) {
      return totalCapitalPercentage.value <= -totalRiskPercentage.value
    }
  }
  return false
})
export const targetReached = computed(() => {
  if (totalRiskTargetToggle.value) {
    if (totalRiskTargetType.value === 'amount' && totalTargetAmount.value > 0) {
      return totalProfit.value >= totalTargetAmount.value
    } else if (totalRiskTargetType.value === 'percentage' && totalTargetPercentage.value > 0) {
      return totalCapitalPercentage.value >= totalTargetPercentage.value
    }
  }
  return false
})

watch(riskReached, async (newValue) => {
  if (newValue && closePositionsRisk.value) {
    console.log('Risk threshold reached. Taking action.')
    if (riskAction.value === 'close') {
      await closeAllPositions()
      showToastNotification('All positions closed due to risk threshold')
    } else if (riskAction.value === 'killSwitch') {
      await toggleKillSwitch()
    }
  }
})
watch(targetReached, async (newValue) => {
  if (newValue && closePositionsTarget.value) {
    console.log('Target reached. Taking action.')
    if (targetAction.value === 'close') {
      await closeAllPositions()
      showToastNotification('All positions closed due to target reached')
    } else if (targetAction.value === 'killSwitch') {
      await toggleKillSwitch()
    }
  }
})
