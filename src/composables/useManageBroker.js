import { ref, watch } from 'vue'
import axios from 'axios'
import {
  BASE_URL,
  flattradeReqCode,
  errorMessage,
  statusMessage,
  userTriggeredTokenGeneration,
  shoonyaBrokerPassword,
  shoonyaOneTimePassword,
  SHOONYA_API_TOKEN,
  shoonyaBrokerUserId,
  FLATTRADE_API_TOKEN,
  FLATTRADE_CLIENT_ID,
  FLATTRADE_API_SECRET,
  FLATTRADE_API_KEY
} from '@/stores/globalStore'

import { validateToken } from '@/composables/useBrokerTokenValidator'

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

  // Flattrade Token Generation
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

  watch(flattradeReqCode, async (newCode) => {
    if (newCode && userTriggeredTokenGeneration.value) {
      statusMessage.value = `Received flattradeReqCode: ${newCode}`

      // Find the Flattrade broker details
      let flattradeDetails = null
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key.startsWith('broker_Flattrade_')) {
          flattradeDetails = JSON.parse(localStorage.getItem(key))
          break
        }
      }

      if (!flattradeDetails || !flattradeDetails.apiKey || !flattradeDetails.apiSecret) {
        errorMessage.value = 'API key or secret is missing'
        clearErrorMessage()
        return
      }

      const storedApiKey = flattradeDetails.apiKey
      const storedApiSecret = flattradeDetails.apiSecret

      const api_secret = storedApiKey + newCode + storedApiSecret
      const hashedSecret = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(api_secret)
      )
      const apiSecretHex = Array.from(new Uint8Array(hashedSecret))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      const payload = {
        api_key: storedApiKey,
        request_code: newCode,
        api_secret: apiSecretHex
      }

      try {
        const apiUrl = import.meta.env.PROD
          ? `${BASE_URL}/flattrade/generateToken`
          : `${BASE_URL}/flattrade/generateToken`
        const res = await axios.post(apiUrl, payload)
        const token = res.data.token
        if (!token) {
          errorMessage.value = 'Token generation failed'
          clearErrorMessage()
        } else {
          FLATTRADE_API_TOKEN.value = token
          errorMessage.value = ''
          statusMessage.value = `Token generated successfully: ${token}`
          localStorage.removeItem('statusMessage') // Clear the stored status message
          console.log('Token generated successfully:', token)

          // Clear success message after 5 seconds
          setTimeout(() => {
            statusMessage.value = ''
          }, 5000)
        }
      } catch (error) {
        errorMessage.value = 'Error generating token: ' + error.message
        clearErrorMessage()
        console.error('Error generating token:', error)
      }
    }
  })

  // Watch for changes in FLATTRADE_API_TOKEN and update localStorage
  watch(FLATTRADE_API_TOKEN, (newToken) => {
    if (newToken) {
      localStorage.setItem('FLATTRADE_API_TOKEN', newToken)
      validateToken('Flattrade')
    } else {
      localStorage.removeItem('FLATTRADE_API_TOKEN')
    }
  })
  // Shoonya Token Generation
  const handleShoonyaLogin = async () => {
    try {
      const encoder = new TextEncoder()

      // Find the Shoonya broker details
      let shoonyaDetails = null
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key.startsWith('broker_Shoonya_')) {
          shoonyaDetails = JSON.parse(localStorage.getItem(key))
          break
        }
      }

      if (!shoonyaDetails || !shoonyaDetails.clientId || !shoonyaDetails.apiKey) {
        throw new Error('Shoonya client ID or API key is missing')
      }

      const clientId = shoonyaDetails.clientId
      const apiKey = shoonyaDetails.apiKey

      // Hash the password
      const pwdBuffer = await crypto.subtle.digest(
        'SHA-256',
        encoder.encode(shoonyaBrokerPassword.value)
      )
      const pwd = Array.from(new Uint8Array(pwdBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Create and hash the appkey
      const appkeyRaw = `${clientId}|${apiKey}`
      const appkeyBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(appkeyRaw))
      const appkey = Array.from(new Uint8Array(appkeyBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      const jData = {
        apkversion: '1.0.0',
        uid: clientId,
        pwd: pwd,
        factor2: shoonyaOneTimePassword.value,
        vc: `${clientId}_U`,
        appkey: appkey,
        imei: 'mac',
        source: 'API'
      }

      const jDataString = JSON.stringify(jData)
      const payload = `jData=${jDataString}&jKey=${apiKey}`

      const apiUrl = import.meta.env.PROD
        ? `${BASE_URL}/shoonya/login`
        : `${BASE_URL}/shoonya/login`

      const response = await axios.post(
        apiUrl,
        {
          jKey: apiKey,
          jData: jDataString
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.stat === 'Ok') {
        SHOONYA_API_TOKEN.value = response.data.susertoken
        localStorage.setItem('SHOONYA_API_TOKEN', SHOONYA_API_TOKEN.value)
        statusMessage.value = 'Shoonya login successful'

        // Clear the form fields
        shoonyaBrokerUserId.value = ''
        shoonyaBrokerPassword.value = ''
        shoonyaOneTimePassword.value = ''

        // Clear the status message after 5 seconds
        setTimeout(() => {
          statusMessage.value = ''
        }, 5000)
      } else {
        throw new Error(response.data.emsg || 'Login failed')
      }
    } catch (error) {
      errorMessage.value = `Shoonya login error: ${error.message}`
      clearErrorMessage()
    }
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
    openFlattradeAuthUrl,
    handleShoonyaLogin
  }
}
