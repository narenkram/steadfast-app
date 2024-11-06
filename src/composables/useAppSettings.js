import { ref, watch } from 'vue'
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
