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
  selectedExpiry
} from '@/stores/globalStore'

// Trade Configuration Composables
import { updateStrikesForExpiry } from '@/composables/useTradeConfiguration'

export function useAppSettings() {
  // UI Settings
  const toggleLTPRangeBar = () => {
    showLTPRangeBar.value = !showLTPRangeBar.value
    localStorage.setItem('showLTPRangeBar', JSON.stringify(showLTPRangeBar.value))
  }

  const toggleOHLCValues = () => {
    showOHLCValues.value = !showOHLCValues.value
    localStorage.setItem('showOHLCValues', JSON.stringify(showOHLCValues.value))
  }

  const toggleStrikeDetails = () => {
    showStrikeDetails.value = !showStrikeDetails.value
    localStorage.setItem('showStrikeDetails', JSON.stringify(showStrikeDetails.value))
  }

  const toggleStickyMTM = () => {
    stickyMTM.value = !stickyMTM.value
    localStorage.setItem('stickyMTM', JSON.stringify(stickyMTM.value))
  }

  // Trading Settings
  const saveOffsets = () => {
    localStorage.setItem('callStrikeOffset', callStrikeOffset.value)
    localStorage.setItem('putStrikeOffset', putStrikeOffset.value)
    localStorage.setItem('expiryOffset', expiryOffset.value)
  }

  watch([callStrikeOffset, putStrikeOffset], () => {
    saveOffsets()
    updateStrikesForExpiry(selectedExpiry.value, true)
  })

  const toggleOvertradeProtection = () => {
    overtradeProtection.value = !overtradeProtection.value
    localStorage.setItem('OvertradeProtection', overtradeProtection.value.toString())
  }

  // Notification Settings
  const toggleNotificationSound = () => {
    localStorage.setItem('notificationSound', notificationSound.value.toString())
    showToastNotification(
      notificationSound.value ? 'Notification sound enabled' : 'Notification sound disabled'
    )
  }

  // Helper Functions
  const showToastNotification = (message) => {
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

  return {
    // UI Settings
    toggleLTPRangeBar,
    toggleOHLCValues,
    toggleStrikeDetails,
    toggleStickyMTM,

    // Trading Settings
    saveOffsets,
    toggleOvertradeProtection,

    // Notification Settings
    toggleNotificationSound,

    // Helper Functions
    showToastNotification
  }
}
