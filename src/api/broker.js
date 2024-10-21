import axios from 'axios' // Make sure to install axios if you haven't already

const baseURL = import.meta.env.VITE_BASE_URL

export const updateSelectedBrokerOnServer = async (broker) => {
  try {
    const response = await axios.post(`${baseURL}/set-broker`, { broker })
    console.log(response.data.message)
    return response.data
  } catch (error) {
    console.error('Error setting broker:', error)
    throw error
  }
}
