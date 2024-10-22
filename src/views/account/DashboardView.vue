<template>
    <AppNavigationComponent />
    <div class="container">
        <h2>Dashboard</h2>
        <p>Welcome to your dashboard!</p>
        <div v-if="user">
            <p><strong>Phone Number:</strong> {{ user.phoneNumber }}</p>
            <p><strong>User ID:</strong> {{ user.uid }}</p>
            <!-- Display other user details as needed -->
        </div>
        <div v-else>
            <p>Loading user details...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AppNavigationComponent from '@/components/AppNavigationComponent.vue';

const user = ref(null);

onMounted(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // Fetch the user's phone number
            const phoneNumber = currentUser.phoneNumber;
            user.value = {
                ...currentUser,
                phoneNumber: phoneNumber || 'N/A',
            };
        } else {
            user.value = null;
        }
    });
});
</script>
