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
import { AUTO_LOGIN_ACTION } from './stores/storeconstants.js'
// import { RouterLink, RouterView } from 'vue-router'


export default {
  name: 'App',
  computed: {
    ...mapState({
      showLoader: state => state.showLoader,
      autoLogout: state => state.auth.autoLogout
    })
  },
  watch: {
    autoLogout(currentValue, oldValue) {
      if (currentValue && currentValue != oldValue)
        this.$router.replace('/login')
    }
  },
  components: {
    TheLoader,
    HeaderNav,
  },
  created() {
    this.$store.dispatch(`auth/${AUTO_LOGIN_ACTION}`)
  }
}
</script>

