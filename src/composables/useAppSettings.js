import { ref, watch } from 'vue'
import {
  // UI Settings
  showLTPRangeBar,
  showOHLCValues,
  showStrikeDetails,
  stickyMTM,

  // Trading Settings
  callStrikeOffset,
  putStrikeOffset,
  expiryOffset,
  overtradeProtection,

  // Feature Settings
  additionalSymbols,
  marketDepth,

  // Notification Settings
  notificationSound,
  selectedSound,

  // Risk Management Settings
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

  // Toast
  toastMessage,
  showToast
} from '@/stores/globalStore'

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

  const toggleOvertradeProtection = () => {
    overtradeProtection.value = !overtradeProtection.value
    localStorage.setItem('OvertradeProtection', overtradeProtection.value.toString())
  }

  // Feature Settings
  const toggleAdditionalSymbols = () => {
    additionalSymbols.value = !additionalSymbols.value
    localStorage.setItem('additionalSymbols', JSON.stringify(additionalSymbols.value))
  }

  const toggleMarketDepth = () => {
    marketDepth.value = !marketDepth.value
    localStorage.setItem('marketDepth', JSON.stringify(marketDepth.value))
  }

  // Notification Settings
  const playNotificationSound = () => {
    localStorage.setItem('notificationSound', notificationSound.value.toString())
    if (notificationSound.value) {
      const audio = new Audio(`/${selectedSound.value}`)
      audio.play()
      showToastNotification('Notification sound enabled')
    } else {
      showToastNotification('Notification sound disabled')
    }
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

    // Feature Settings
    toggleAdditionalSymbols,
    toggleMarketDepth,

    // Notification Settings
    playNotificationSound,

    // Helper Functions
    showToastNotification
  }
}
