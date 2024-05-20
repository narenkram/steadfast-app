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
        <li class="nav-item ms-2">
          <RouterLink class="nav-link" to="/login">Login</RouterLink>
        </li>
        <li class="nav-item ms-2">
          <RouterLink class="nav-link" to="/account">Account</RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
