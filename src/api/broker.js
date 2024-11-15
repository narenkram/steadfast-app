import axios from 'axios'

const baseURL = import.meta.env.VITE_BASE_URL

export const updateSelectedBrokerOnServer = async (broker) => {
  try {
    const response = await axios.post(`${baseURL}/set-broker`, { broker })
    console.log('Broker set successfully:', response.data.message)

    // Add delay to allow websocket server to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return response.data
  } catch (error) {
    console.error('Error setting broker:', error)
    throw new Error('Failed to set broker. Please try again.')
  }
}
