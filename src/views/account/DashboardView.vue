<template>
    <AppNavigationComponent />
    <div class="container">
        <h2>Dashboard</h2>
        <p>Welcome to your dashboard!</p>
        <div v-if="user">
            <p><strong>Phone Number:</strong> {{ user.phoneNumber }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
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
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AppNavigationComponent from '@/components/AppNavigationComponent.vue';

const user = ref(null);

onMounted(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            // Fetch the user's data from Firestore
            const db = getFirestore();
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                user.value = {
                    ...currentUser,
                    phoneNumber: currentUser.phoneNumber || 'N/A',
                    email: userData.email || 'N/A',
                    // Add other user details from Firestore as needed
                };
            } else {
                console.log('User document not found in Firestore');
                user.value = {
                    ...currentUser,
                    phoneNumber: currentUser.phoneNumber || 'N/A',
                    email: 'N/A',
                };
            }
        } else {
            user.value = null;
        }
    });
});
</script>
