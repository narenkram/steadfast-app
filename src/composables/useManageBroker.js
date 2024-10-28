import { ref } from 'vue'
import {
  flattradeReqCode,
  errorMessage,
  statusMessage,
  userTriggeredTokenGeneration
} from '@/stores/globalStore'

export function useManageBroker() {
  // Track visibility for each broker's client ID
  const visibleClientIds = ref({})
  const brokerDetails = ref([])

  const toggleBrokerClientIdVisibility = (brokerId) => {
    visibleClientIds.value[brokerId] = !visibleClientIds.value[brokerId]
  }

  const getBrokersFromLocalStorage = () => {
    const brokers = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('broker_')) {
        const brokerData = JSON.parse(localStorage.getItem(key))
        const [_, brokerName, ...clientIdParts] = key.split('_')
        brokers.push({
          id: clientIdParts.join('_'),
          brokerName: brokerName,
          ...brokerData,
          apiToken: localStorage.getItem(`${brokerName.toUpperCase()}_API_TOKEN`) || ''
        })
      }
    }
    return brokers
  }

  const generateToken = async (broker) => {
    userTriggeredTokenGeneration.value = true

    if (!broker) {
      errorMessage.value = 'Broker information is missing'
      clearErrorMessage()
      return
    }

    if (broker.brokerName === 'Flattrade') {
      openFlattradeAuthUrl()
      statusMessage.value = 'Waiting for flattradeReqCode...'
      return
    }

    if (!flattradeReqCode.value) {
      errorMessage.value = 'Request code is missing'
      clearErrorMessage()
      return
    }
  }

  const openFlattradeAuthUrl = () => {
    statusMessage.value = 'Waiting for broker auth to complete...'
    localStorage.setItem('statusMessage', statusMessage.value)

    let flattradeDetails = null
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('broker_Flattrade_')) {
        flattradeDetails = JSON.parse(localStorage.getItem(key))
        break
      }
    }

    if (!flattradeDetails || !flattradeDetails.apiKey) {
      errorMessage.value = 'Flattrade API key is missing'
      clearErrorMessage()
      return
    }

    const authUrl = `https://auth.flattrade.in/?app_key=${flattradeDetails.apiKey}`
    window.open(authUrl, '_blank')

    setTimeout(() => {
      if (statusMessage.value === 'Waiting for broker auth to complete...') {
        statusMessage.value = ''
        localStorage.removeItem('statusMessage')
      }
    }, 120000)
  }

  const clearErrorMessage = () => {
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  }

  return {
    visibleClientIds,
    brokerDetails,
    toggleBrokerClientIdVisibility,
    getBrokersFromLocalStorage,
    generateToken,
    openFlattradeAuthUrl
  }
}
