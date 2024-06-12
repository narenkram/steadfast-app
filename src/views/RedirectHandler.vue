<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>

<script>
import axios from 'axios';
import qs from 'qs';
import crypto from 'crypto-js';

export default {
  mounted() {
    console.log('RedirectHandler component mounted');

    // Extract the request_code and client from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const requestCode = urlParams.get('request_code');
    const client = urlParams.get('client');

    console.log('Request code:', requestCode);
    console.log('Client:', client);

    if (!requestCode) {
      console.error('Request code is undefined');
      return;
    }

    // Construct the message to send back to the parent window
    const message = `${window.location.origin}?request_code=${requestCode}&client=${client}`;

    console.log('Sending message:', message);

    // Check if window.opener is not null before posting the message
    if (window.opener) {
      window.opener.postMessage(message, 'http://localhost:5173');
      console.log('Message sent to parent window');
    } else {
      console.error('No parent window found. Cannot send message.');
    }

    // Wait for a few seconds before making the API call and closing the window
    setTimeout(async () => {
      const apiKey = 'your_api_key'; // Replace with actual API key
      const apiSecret = 'your_api_secret'; // Replace with actual API secret

      const concatenatedValue = `${apiKey}${requestCode}${apiSecret}`;
      const hashedSecret = crypto.SHA256(concatenatedValue).toString();
      console.log('Generated hashed secret:', hashedSecret);

      try {
        const response = await axios.post('https://authapi.flattrade.in/trade/apitoken', qs.stringify({
          api_key: apiKey,
          request_code: requestCode,
          api_secret: hashedSecret,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log('Token:', response.data.token);
        // You can store the token or send it back to the parent window if needed
      } catch (error) {
        console.error('Failed to generate token:', error);
      }

      // Close the current window
      window.close();
    }, 8000); // Wait for 8 seconds
  }
};
</script>

