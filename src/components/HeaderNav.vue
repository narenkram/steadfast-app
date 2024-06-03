
<template>
  <nav class="row">
    <div class="col-6">
      <h1>Steadfast Stoic</h1>
      <p class="lead">Designed to survive options buying.</p>
    </div>
    <div class="col-6">
      <ul class="navbar-nav flex-row float-end">
        <li class="nav-item">
          <RouterLink class="nav-link" to="/">Home</RouterLink>
        </li>
        <li class="nav-item ms-2" v-if="!isUserAuthenticated">
          <RouterLink class="nav-link" to="/login">Login</RouterLink>
        </li>
        <li class="nav-item ms-2" v-if="isUserAuthenticated">
          <a class="nav-link" @click.prevent="onLogout()">Logout</a>
        </li>
        <li class="nav-item ms-2">
          <RouterLink class="nav-link" to="/account">Account</RouterLink>
        </li>
        <li class="nav-item ms-2" v-if="isUserAuthenticated">
          <RouterLink class="nav-link" to="/trade-view">TradeView</RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
<script>
import { mapGetters } from 'vuex';
import { IS_USER_AUTHENTICATED_GETTER } from '@/stores/storeconstants';
import { LOGOUT_ACTION } from '@/stores/storeconstants';
import { mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters('auth', {
      isUserAuthenticated: IS_USER_AUTHENTICATED_GETTER
    })
  },
  methods: {

    ...mapActions('auth', {
      logout: LOGOUT_ACTION
    }),
    onLogout() {
      this.logout();
      this.$router.push('/');
    }
  }
}
</script>

