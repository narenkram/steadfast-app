<template>
  <section class="row py-5">
    <div class="col-md-4 mx-auto">
      <div class="alert alert-danger" v-if="error">{{ error }}</div>
      <form @submit.prevent="onLogin()">
        <div class="mb-3">
          <label for="UserEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="UserEmail" aria-describedby="emailHelp" v-model.trim="email" />
          <div class="form-text text-danger" v-if="errors.email">{{ errors.email }}</div>
        </div>
        <div class="mb-3">
          <label for="UserPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="UserPassword" v-model.trim="password" />
          <div class="form-text text-danger" v-if="errors.password">{{ errors.password }}</div>
        </div>
        <button type="submit" class="btn btn-primary w-100">Log In</button>
        <RouterLink to="/create-account" class="btn btn-outline-primary w-100 mt-2">Create an account</RouterLink>
      </form>
    </div>
  </section>
</template>

<script>
import CreateAccValidation from '../services/CreateAccValidation.js'
import { mapActions, mapMutations } from 'vuex'
import { LOGIN_ACTION } from '../stores/storeconstants.js'
import { SHOW_LOADER_MUTATION } from '../stores/storeconstants.js'

export default {
  data() {
    return {
      email: '',
      password: '',
      errors: [],
      error: '',
    }
  },
  methods: {

    ...mapActions('auth', {
      login: LOGIN_ACTION
    }),
    ...mapMutations({
      ShowLoader: SHOW_LOADER_MUTATION
    }),
    async onLogin() {
      // Check the validations
      let validations = new CreateAccValidation(
        this.email,
        this.password
      );
      this.errors = validations.checkValidations();
      if (this.errors.length) {
        return false
      }
      this.error = '';

      this.ShowLoader(true);
      // Login Check
      try {
        await this.login({
          email: this.email,
          password: this.password
        });
      } catch (e) {
        this.error = e;
        this.ShowLoader(false);
      }
      this.ShowLoader(false);

      this.$router.push('/trade-view');
    }
  }
}
</script>
