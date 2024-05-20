import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.dhan.co/',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzE4ODA4MzUwLCJ0b2tlbkNvbnN1bWVyVHlwZSI6IlNFTEYiLCJ3ZWJob29rVXJsIjoiIiwiZGhhbkNsaWVudElkIjoiMTAwMDU4ODU1MSJ9.dsOQ5uA9eP-2A0hUjHvwbUZ_3Cg2S_1Rr68oufBJkiDqsqvGqjrjWB_7h6sKUDEJGUMmt4UEuV-oDW-FzzvjXQ'
  }
});

export default {
  getMarketData() {
    return apiClient.get('/market-data');
  },
  placeOrder(orderDetails) {
    return apiClient.post('/orders', orderDetails);
  },
  getFundLimit() {
    return apiClient.get('/fundlimit');
  },
  async getFundLimitWithToken() {
    const options = {
      method: 'GET',
      url: '/fundlimit',
      headers: {
        'access-token': 'YOUR_ACCESS_TOKEN',
        Accept: 'application/json'
      }
    };

    try {
      const { data } = await apiClient.request(options);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};

