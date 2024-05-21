<template>
  <section class="row py-5">
    <div class="col-md-4 mx-auto">
      <form @submit.prevent="createAccount()">
        <div class="mb-3">
          <label for="NewUserEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="NewUserEmail" aria-describedby="emailHelp" v-model.trim="email" />
          <div class="form-text text-danger" v-if="errors.email">{{ errors.email }}</div>
        </div>
        <div class="mb-3">
          <label for="NewUserPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="NewUserPassword" v-model.trim="password" />
          <div class="form-text text-danger" v-if="errors.password">{{ errors.password }}</div>
        </div>
        <button type="submit" class="btn btn-outline-primary w-100 mt-2">Create an account</button>
      </form>
    </div>
  </section>
</template>

<script>
import CreateAccValidation from '../services/CreateAccValidation.js';
import { mapActions } from 'vuex';
import { CREATE_ACCOUNT_ACTION } from '../stores/storeconstants.js';

export default {
  data() {
    return {
      email: '',
      password: '',
      errors: []
    };
  },
  methods: {
    ...mapActions('auth', {
      CreateAccount: CREATE_ACCOUNT_ACTION,
    }),
    createAccount() {
      let validations = new CreateAccValidation(
        this.email,
        this.password,
      );

      this.errors = validations.checkValidations();
      if ('email' in this.errors || 'password' in this.errors) {
        return false;
      }

      // Create Account Registration
      this.CreateAccount({
        email: this.email,
        password: this.password
      });
    }
  }
}
</script>

