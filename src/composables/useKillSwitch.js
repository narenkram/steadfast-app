import { ref, computed, watch } from 'vue'
import { killSwitchActive } from '@/stores/globalStore'
import { closeAllPositions } from '@/composables/useOrderManagement'

const activationTime = ref(0)
const currentTime = ref(Date.now())

// Update current time every second
setInterval(() => {
  currentTime.value = Date.now()
}, 1000)

const remainingTimeInMs = computed(() => {
  if (!activationTime.value || !killSwitchActive.value) return 0
  const sixHoursInMillis = 6 * 60 * 60 * 1000
  return Math.max(0, sixHoursInMillis - (currentTime.value - activationTime.value))
})

const killSwitchRemainingTime = computed(() => {
  if (remainingTimeInMs.value === 0) return ''

  const hours = Math.floor(remainingTimeInMs.value / (60 * 60 * 1000))
  const minutes = Math.floor((remainingTimeInMs.value % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((remainingTimeInMs.value % (60 * 1000)) / 1000)

  return `${hours}h ${minutes}m ${seconds}s`
})

const killSwitchButtonText = computed(() => (killSwitchActive.value ? 'Deactivate' : 'Activate'))

const killSwitchButtonClass = computed(() =>
  killSwitchActive.value
    ? 'btn btn-sm btn-success shadow fs-6'
    : 'btn btn-sm btn-danger shadow fs-6'
)

const toggleKillSwitch = async () => {
  const newStatus = killSwitchActive.value ? 'DEACTIVATED' : 'ACTIVATED'
  if (newStatus === 'ACTIVATED') {
    await closeAllPositions() // Wait for closeAllPositions to complete
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  if (newStatus === 'DEACTIVATED' && remainingTimeInMs.value > 0) {
    cycleClockEmoji()
    toastMessage.value = 'Kill Switch cannot be deactivated within 6 hours of activation'
    showToast.value = true
    return
  }

  // Handle different response messages
  if (newStatus === 'ACTIVATED') {
    toastMessage.value = 'Kill Switch activated successfully'
    killSwitchActive.value = true
    localStorage.setItem('KillSwitchStatus', 'true')
    activationTime.value = Date.now()
    localStorage.setItem('KillSwitchActivationTime', activationTime.value.toString())
    enableHotKeys.value = false
  } else {
    toastMessage.value = 'Kill Switch deactivated successfully'
    killSwitchActive.value = false
    localStorage.removeItem('KillSwitchStatus')
    activationTime.value = 0
    localStorage.removeItem('KillSwitchActivationTime')
  }

  showToast.value = true
}

const initKillSwitch = () => {
  const storedStatus = localStorage.getItem('KillSwitchStatus')
  const storedActivationTime = localStorage.getItem('KillSwitchActivationTime')

  if (storedStatus === 'true' && storedActivationTime) {
    killSwitchActive.value = true
    activationTime.value = parseInt(storedActivationTime)
  } else {
    // Deactivate kill switch if KillSwitchActivationTime is missing
    killSwitchActive.value = false
    activationTime.value = 0
    localStorage.removeItem('KillSwitchStatus')
    localStorage.removeItem('KillSwitchActivationTime')
  }
}

const cycleClockEmoji = () => {
  const currentHour = new Date().getHours()
  let index = currentHour % clockEmojis.length
  let cycles = 0

  const interval = setInterval(() => {
    currentClockEmoji.value = clockEmojis[index]
    index = (index + 1) % clockEmojis.length

    if (index === currentHour % clockEmojis.length) {
      cycles += 1
    }

    if (cycles === 1 && index === currentHour % clockEmojis.length) {
      // Complete one full cycle
      clearInterval(interval)
      currentClockEmoji.value = clockEmojis[currentHour % clockEmojis.length] // Ensure it ends at the current hour
    }
  }, 100) // Adjust the interval time for desired speed
}

const handleKillSwitchClick = () => {
  if (killSwitchActive.value) {
    // If the kill switch is already active, deactivate it directly
    toggleKillSwitch()
  }
  // If it's not active, the modal will be shown due to data-bs-target and data-bs-toggle
}

// Watch for kill switch timeout
watch(remainingTimeInMs, (newValue) => {
  if (newValue === 0 && killSwitchActive.value) {
    killSwitchActive.value = false
    localStorage.removeItem('killSwitchActive')
    localStorage.removeItem('killSwitchActivationTime')
  }
})

export {
  killSwitchActive,
  killSwitchRemainingTime,
  toggleKillSwitch,
  initKillSwitch,
  killSwitchButtonClass,
  handleKillSwitchClick,
  cycleClockEmoji,
  killSwitchButtonText
}
