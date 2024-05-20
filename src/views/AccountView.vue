<template>
  <section class="row py-5">
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="brokers-tab"
          data-bs-toggle="tab"
          data-bs-target="#brokers-tab-pane"
          type="button"
          role="tab"
          aria-controls="brokers-tab-pane"
          aria-selected="true"
        >
          Brokers
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="profile-tab"
          data-bs-toggle="tab"
          data-bs-target="#profile-tab-pane"
          type="button"
          role="tab"
          aria-controls="profile-tab-pane"
          aria-selected="false"
        >
          Profile
        </button>
      </li>
    </ul>
    <div class="tab-content" id="myTabContent">
      <div
        class="tab-pane fade show active"
        id="brokers-tab-pane"
        role="tabpanel"
        aria-labelledby="brokers-tab"
        tabindex="0"
      >
        <div class="col-12 text-center py-5">
          <button>Add New Broker</button>
        </div>
      </div>
      <div
        class="tab-pane fade"
        id="profile-tab-pane"
        role="tabpanel"
        aria-labelledby="profile-tab"
        tabindex="0"
      >
        <div class="col-md-4 mx-auto py-5">
          <form>
            <div class="mb-3">
              <label for="RegUserEmail" class="form-label">Email address</label>
              <input
                type="email"
                class="form-control"
                id="RegUserEmail"
                aria-describedby="emailHelp"
              />
            </div>
            <hr />
            <h6>Change Password</h6>
            <div class="mb-3">
              <label for="ChangeUserPassword" class="form-label">Password</label>
              <input type="password" class="form-control" id="ChangeUserPassword" />
            </div>
            <div class="mb-3">
              <label for="RetypeChangeUserPassword" class="form-label">Retype Password</label>
              <input type="password" class="form-control" id="RetypeChangeUserPassword" />
            </div>
            <button type="submit" class="btn btn-primary w-100">Save</button>
          </form>
        </div>
      </div>
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
