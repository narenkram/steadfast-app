<script setup>
import HeaderNav from './components/HeaderNav.vue'

// import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header></header>

  <main class="container py-5">
    <HeaderNav />
    <RouterView />
  </main>
</template>
