<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log('RedirectHandler component mounted');

    // Extract the request_code and client from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const requestCode = urlParams.get('request_code');
    const client = urlParams.get('client');

    console.log('Request code:', requestCode);
    console.log('Client:', client);

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

    // Close the current window
    window.close();
  }
};
</script>
