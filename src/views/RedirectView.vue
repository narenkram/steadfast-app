<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
  const code = route.query.code;
  if (typeof code === 'string') {
    localStorage.setItem('authCode', code);
    localStorage.removeItem('statusMessage');
    window.opener.postMessage({ type: 'authCode', code }, '*');
    window.close();
  } else {
    console.error('No valid code found in the URL');
  }
});
</script>

<template>
  <div>Redirecting...</div>
</template>
