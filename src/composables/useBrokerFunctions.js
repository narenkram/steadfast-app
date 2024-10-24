import { ref, computed } from 'vue'
import { validateToken } from '@/composables/useBrokerTokenValidator'
import { updateSelectedBrokerOnServer } from '../api/broker'
import axios from 'axios'
import { parseBrokerKey, getAllBrokersFromLocalStorage } from '@/composables/useFormatters'

// Global State
import {
  selectedBroker,
  selectedBrokerName,
  selectedBrokerToDelete,
  tokenStatus,
  BASE_URL,
  toastMessage,
  showToast,
  FLATTRADE_CLIENT_ID,
  FLATTRADE_API_KEY,
  FLATTRADE_API_TOKEN,
  FLATTRADE_API_SECRET,
  SHOONYA_CLIENT_ID,
  SHOONYA_API_KEY,
  SHOONYA_API_TOKEN
} from '@/stores/globalStore'

export const availableBrokers = computed(() => {
  return getAllBrokersFromLocalStorage()
})

export const brokerStatus = computed(() => {
  const brokers = getAllBrokersFromLocalStorage()
  const flattradeDetails = brokers.find((b) => b.brokerName === 'Flattrade')
  const shoonyaDetails = brokers.find((b) => b.brokerName === 'Shoonya')

  const flattradeClientId = flattradeDetails?.clientId
  const flattradeApiToken = localStorage.getItem('FLATTRADE_API_TOKEN')
  const shoonyaApiToken = localStorage.getItem('SHOONYA_API_TOKEN')
  const shoonyaClientId = shoonyaDetails?.clientId

  if (selectedBroker.value?.brokerName === 'Flattrade') {
    if (flattradeClientId && flattradeApiToken) {
      return tokenStatus.Flattrade === 'valid' ? 'Connected' : 'Token Expired'
    }
    return 'Not Connected'
  } else if (selectedBroker.value?.brokerName === 'Shoonya') {
    if (shoonyaClientId && shoonyaApiToken) {
      return tokenStatus.Shoonya === 'valid' ? 'Connected' : 'Token Expired'
    }
    return 'Not Connected'
  }
  return 'Not Connected'
})

export const updateSelectedBroker = async () => {
  const availableBrokers = getAllBrokersFromLocalStorage()

  if (availableBrokers.length === 0) {
    selectedBroker.value = null
    localStorage.removeItem('selectedBroker')
    selectedBrokerName.value = ''
    await updateSelectedBrokerOnServer('') // Clear broker on server
  } else if (
    selectedBrokerName.value &&
    availableBrokers.some((broker) => broker.brokerName === selectedBrokerName.value)
  ) {
    const selectedBrokerKey = Object.keys(localStorage).find((key) =>
      key.startsWith(`broker_${selectedBrokerName.value}_`)
    )
    if (selectedBrokerKey) {
      const brokerDetails = JSON.parse(localStorage.getItem(selectedBrokerKey) || '{}')
      selectedBroker.value = brokerDetails
      localStorage.setItem('selectedBroker', JSON.stringify(brokerDetails))
      await updateSelectedBrokerOnServer(selectedBrokerName.value.toLowerCase())
    } else {
      // Handle case where broker name is found but details are missing
      selectedBroker.value = null
      localStorage.removeItem('selectedBroker')
      selectedBrokerName.value = ''
      await updateSelectedBrokerOnServer('') // Clear broker on server
    }
  } else {
    selectedBroker.value = null
    localStorage.removeItem('selectedBroker')
    selectedBrokerName.value = ''
    await updateSelectedBrokerOnServer('') // Clear broker on server
  }
}

export const deleteBroker = (broker) => {
  const key = Object.keys(localStorage).find((key) =>
    key.startsWith(`broker_${broker.brokerName}_${broker.clientId}`)
  )
  if (key) {
    localStorage.removeItem(key)
  }
}

export const setFlattradeCredentials = async () => {
  try {
    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Flattrade') {
      toastMessage.value = 'Realtime LTP data only available for Flattrade'
      showToast.value = true
      return
    }

    // Check if the broker status is 'Connected'
    if (brokerStatus.value !== 'Connected') {
      console.error('Flattrade broker is not connected')
      toastMessage.value = 'Flattrade broker is not connected'
      showToast.value = true
      return
    }

    const clientId = selectedBroker.value.clientId
    const apiToken = localStorage.getItem('FLATTRADE_API_TOKEN')

    if (!clientId || !apiToken) {
      console.error('Flattrade client ID or API token is missing')
      toastMessage.value = 'Flattrade credentials are missing'
      showToast.value = true
      return
    }

    const response = await axios.post(`${BASE_URL}/flattrade/setCredentials`, {
      usersession: apiToken,
      userid: clientId
    })
    console.log('Credentials set successfully:', response.data)
    toastMessage.value = 'Flattrade changes set successfully'
    showToast.value = true
  } catch (error) {
    console.error('Error setting credentials :', error)
    toastMessage.value = 'Failed to set Flattrade credentials'
    showToast.value = true
  }
}
export const setShoonyaCredentials = async () => {
  try {
    if (!selectedBroker.value || selectedBroker.value?.brokerName !== 'Shoonya') {
      toastMessage.value = 'Realtime LTP data only available for Shoonya'
      showToast.value = true
      return
    }

    // Check if the broker status is 'Connected'
    if (brokerStatus.value !== 'Connected') {
      console.error('Shoonya broker is not connected')
      toastMessage.value = 'Shoonya broker is not connected'
      showToast.value = true
      return
    }

    const clientId = selectedBroker.value.clientId
    const apiToken = localStorage.getItem('SHOONYA_API_TOKEN')

    if (!clientId || !apiToken) {
      console.error('Shoonya client ID or API token is missing')
      toastMessage.value = 'Shoonya credentials are missing'
      showToast.value = true
      return
    }

    const response = await axios.post(`${BASE_URL}/shoonya/setCredentials`, {
      usersession: apiToken,
      userid: clientId
    })
    console.log('Credentials set successfully:', response.data)
    toastMessage.value = 'Shoonya changes set successfully'
    showToast.value = true
  } catch (error) {
    console.error('Error setting credentials: ', error)
    toastMessage.value = 'Failed to set Shoonya credentials'
    showToast.value = true
  }
}

// Initialize selected broker from localStorage
export const initializeBroker = () => {
  const storedBroker = localStorage.getItem('selectedBroker')
  if (storedBroker) {
    updateSelectedBroker(JSON.parse(storedBroker))
  }
}
