import axios from 'axios'
import { tokenStatus, brokers } from './sharedState'

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

const dhanFundLimits = async () => {
  const accessToken = localStorage.getItem('DHAN_API_TOKEN')
  if (!accessToken) {
    throw new Error('Dhan API token is missing.')
  }
  try {
    const res = await axios.get('/dhanApi/fundlimit', {
      headers: {
        'access-token': accessToken
      }
    })
    return res.data
  } catch (error) {
    throw new Error(
      'Error fetching Dhan fund limits: ' + (error.response?.data?.message || error.message)
    )
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
      case 'Dhan':
        await dhanFundLimits()
        tokenStatus.Dhan = 'valid'
        break
      default:
        throw new Error('Invalid broker name')
    }
  } catch (error) {
    tokenStatus[brokerName] = 'expired'
  }
}

const checkAllTokens = async () => {
  for (const broker of brokers) {
    await validateToken(broker)
  }
}

const getBrokerStatus = (brokerName) => {
  const token = localStorage.getItem(`${brokerName.toUpperCase()}_API_TOKEN`)
  if (!token) {
    return 'Token missing'
  } else {
    return tokenStatus[brokerName]
  }
}

export { validateToken, checkAllTokens, getBrokerStatus, tokenStatus }