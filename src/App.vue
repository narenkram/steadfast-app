<template>
  <header></header>

  <main class="container py-5">
    <HeaderNav />
    <TheLoader v-if="showLoader" />
    <RouterView />
  </main>
</template>

<script>
import HeaderNav from './components/HeaderNav.vue'
import TheLoader from './components/TheLoader.vue'
import { mapState } from 'vuex'
// import { RouterLink, RouterView } from 'vue-router'


export default {
  name: 'App',
  computed: {
    ...mapState({
      showLoader: state => state.showLoader
    })
  },
  components: {
    TheLoader,
    HeaderNav,
  }
}
</script>