<template>
  <section class="row py-5">
    <div class="col-6 text-start">
      <button class="btn btn-primary">Add New Broker</button>
      <button class="ms-3 btn btn-outline-secondary">Refresh Broker List</button>
    </div>
    <div class="col-6 text-end">
      <RouterLink to="/">
        <button class="btn btn-primary">
          Open 1 Click Trade View
        </button>
      </RouterLink>
    </div>
  </section>

  <section class="row">
    <div class="col-12">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Broker</th>
            <th scope="col">Broker ID</th>
            <th scope="col">Name Tag</th>
            <th scope="col">App ID</th>
            <th scope="col">App Secret Key</th>
            <th scope="col">Status</th>
            <th scope="col">Last Token Generated At</th>
            <th scope="col">Generate Token</th>
            <th scope="col">Action</th>
            <th scope="col">Added At</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <!-- Broker -->
            <td>
              Broker Name
            </td>
            <td>
              Broker ID
            </td>
            <td>
              Name Tag
            </td>
            <td>
              App ID
            </td>
            <td>
              App Secret Key
            </td>
            <td>
              <span class="badge text-bg-success">Active</span>
            </td>
            <td>
              Last Token Generated At Time
            </td>
            <td>
              <a class="link">Generate Token</a>
            </td>
            <td>
              <a class="mx-1">
                <span class="SelectBroker">▶️</span>
              </a>
              <a class="mx-1">
                <span class="PauseBroker">⏸️</span>
              </a>
              <a class="mx-1">
                <span class="DeleteBroker">❌</span>
              </a>
            </td>
            <td>
              Added At Time
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

</template>


<script>

export default {

}
</script>
