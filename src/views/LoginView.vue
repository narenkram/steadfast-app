<template>
  <section class="row py-5">
    <div class="col-md-4 mx-auto">
      <form>
        <div class="mb-3">
          <label for="UserEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="UserEmail" aria-describedby="emailHelp" />
        </div>
        <div class="mb-3">
          <label for="UserPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="UserPassword" />
        </div>
        <button type="submit" class="btn btn-primary w-100">Log In</button>
        <button type="submit" class="btn btn-outline-primary w-100 mt-2">Create an account</button>
      </form>
    </div>
  </section>
</template>

<style>
@media (min-width: 1024px) {
  .login {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
