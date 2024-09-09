import axios from 'axios'
import { reactive } from 'vue'

const tokenStatus = reactive({
  Flattrade: 'unknown',
  Shoonya: 'unknown',
  PaperTrading: 'valid' // Always valid for paper trading
})

const flattradeFundLimits = async () => {
  const jKey = localStorage.getItem('FLATTRADE_API_TOKEN')
  const clientId = JSON.parse(localStorage.getItem('broker_Flattrade') || '{}').clientId

  if (!jKey || !clientId) {
    throw new Error('Token or client ID is missing for Flattrade.')
  }

  const jData = JSON.stringify({ uid: clientId, actid: clientId })
  const payload = `jKey=${jKey}&jData=${jData}`

  try {
    const res = await axios.post('https://piconnect.flattrade.in/PiConnectTP/Limits', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return res.data
  } catch (error) {
    throw new Error('Error fetching Flattrade fund limits: ' + error.message)
  }
}

const shoonyaFundLimits = async () => {
  const jKey = localStorage.getItem('SHOONYA_API_TOKEN')
  const clientId = JSON.parse(localStorage.getItem('broker_Shoonya') || '{}').clientId

  if (!jKey || !clientId) {
    throw new Error('Token or client ID is missing for Shoonya.')
  }

  const jData = JSON.stringify({ uid: clientId, actid: clientId })
  const payload = `jKey=${jKey}&jData=${jData}`

  try {
    const res = await axios.post('https://api.shoonya.com/NorenWClientTP/Limits', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return res.data
  } catch (error) {
    throw new Error('Error fetching Shoonya fund limits: ' + error.message)
  }
}

const validateToken = async (brokerName) => {
  try {
    switch (brokerName) {
      case 'Flattrade':
        await flattradeFundLimits()
        tokenStatus.Flattrade = 'valid'
        break
      case 'Shoonya':
        await shoonyaFundLimits()
        tokenStatus.Shoonya = 'valid'
        break
      case 'PaperTrading':
        // Paper trading is always valid, no need to validate
        tokenStatus.PaperTrading = 'valid'
        break
      default:
        throw new Error('Invalid broker name')
    }
  } catch (error) {
    if (brokerName !== 'PaperTrading') {
      tokenStatus[brokerName] = 'expired'
    }
  }
}

const checkAllTokens = async () => {
  const brokers = ['Flattrade', 'Shoonya', 'PaperTrading']
  for (const broker of brokers) {
    await validateToken(broker)
  }
}

const getBrokerStatus = (brokerName) => {
  if (brokerName === 'PaperTrading') {
    return 'valid' // Paper trading is always valid
  }
  const token = localStorage.getItem(`${brokerName.toUpperCase()}_API_TOKEN`)
  if (!token) {
    return 'Token missing'
  } else {
    return tokenStatus[brokerName]
  }
}

export { validateToken, checkAllTokens, getBrokerStatus, tokenStatus }
