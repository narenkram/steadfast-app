<template>
  <NavigationComponent />
  <section class="row py-5">
    <div class="col-12">
      <h1>App Settings</h1>
      <!-- App Settings will go here -->
    </div>
  </section>
</template>

<script setup>
import NavigationComponent from '../components/NavigationComponent.vue'
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

</script>
