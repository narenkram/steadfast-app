import { ref, computed } from 'vue'
import { validateToken } from '@/composables/useBrokerTokenValidator'
import { updateSelectedBrokerOnServer } from '../api/broker'
import axios from 'axios'

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
  SHOONYA_API_TOKEN,
} from '@/stores/globalStore'

export const availableBrokers = computed(() => {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith('broker_'))
    .map((key) => key.replace('broker_', ''))
})

export const brokerStatus = computed(() => {
  const flattradeDetails = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}')
  const shoonyaDetails = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}')

  const flattradeClientId = flattradeDetails.clientId
  const flattradeApiToken = localStorage.getItem('FLATTRADE_API_TOKEN')
  const shoonyaApiToken = localStorage.getItem('SHOONYA_API_TOKEN')
  const shoonyaClientId = shoonyaDetails.clientId

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
  const availableBrokerNames = availableBrokers.value

  if (availableBrokerNames.length === 0) {
    selectedBroker.value = null
    localStorage.removeItem('selectedBroker')
    selectedBrokerName.value = ''
    await updateSelectedBrokerOnServer('') // Clear broker on server
  } else if (selectedBrokerName.value && availableBrokerNames.includes(selectedBrokerName.value)) {
    const brokerDetails = JSON.parse(
      localStorage.getItem(`broker_${selectedBrokerName.value}`) || '{}'
    )
    selectedBroker.value = brokerDetails
    localStorage.setItem('selectedBroker', JSON.stringify(brokerDetails))
    await updateSelectedBrokerOnServer(selectedBrokerName.value.toLowerCase())
  } else {
    selectedBroker.value = null
    localStorage.removeItem('selectedBroker')
    selectedBrokerName.value = ''
    await updateSelectedBrokerOnServer('') // Clear broker on server
  }
}

export const deleteBroker = (broker) => {
  // Remove broker details from localStorage
  localStorage.removeItem(`broker_${broker.brokerName}`)

  // Remove API token from localStorage if it exists
  if (broker.brokerName === 'Flattrade') {
    localStorage.removeItem('FLATTRADE_API_TOKEN')
    FLATTRADE_API_TOKEN.value = ''
    FLATTRADE_API_KEY.value = ''
    FLATTRADE_API_SECRET.value = ''
    FLATTRADE_CLIENT_ID.value = ''
  } else if (broker.brokerName === 'Shoonya') {
    localStorage.removeItem('SHOONYA_API_TOKEN')
    SHOONYA_API_TOKEN.value = ''
    SHOONYA_API_KEY.value = ''
    SHOONYA_CLIENT_ID.value = ''
  }

  // Update the brokers computed property
  // This will automatically update the table
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
