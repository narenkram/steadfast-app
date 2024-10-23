import { currentTime } from '@/stores/globalStore'

// Update current time every second
setInterval(() => {
  currentTime.value = Date.now()
}, 1000)

// Export the interval creator function
export const clockAnimatorInterval = (callback, interval) => {
  return setInterval(callback, interval)
}
