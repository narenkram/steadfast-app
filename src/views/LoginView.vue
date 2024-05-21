<template>
  <section class="row py-5">
    <div class="col-md-4 mx-auto">
      <form @submit.prevent="onLogin()">
        <div class="mb-3">
          <label for="UserEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="UserEmail" aria-describedby="emailHelp" v-model="email" />
          <div class="form-text text-danger" v-if="errors.email">{{ errors.email }}</div>
        </div>
        <div class="mb-3">
          <label for="UserPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="UserPassword" v-model="password" />
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
export default {
  data() {
    return {
      email: '',
      password: '',
      errors: [],
    }
  },
  methods: {
    onLogin() {
      // Check the validations
      let validations = new CreateAccValidation(
        this.email,
        this.password
      );
      this.errors = validations.checkValidations();
      if (this.errors.length) {
        return false
      }


      // create account
    }
  }
}
</script>
