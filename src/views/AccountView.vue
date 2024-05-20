<template>
  <section class="row py-5">
    <div class="col-md-4 mx-auto">
      <form>
        <div class="mb-3">
          <label for="RegUserEmail" class="form-label">Email address</label>
          <input type="email" class="form-control" id="RegUserEmail" aria-describedby="emailHelp" />
        </div>
        <div class="mb-3">
          <label for="RegUserPassword" class="form-label">Password</label>
          <input type="password" class="form-control" id="RegUserPassword" />
        </div>
        <button type="submit" class="btn btn-primary w-100">Save</button>
        <button type="submit" class="btn btn-outline-primary w-100 mt-2">Log Out</button>
      </form>
    </div>
  </section>
</template>

<style>
@media (min-width: 1024px) {
  .Account {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
