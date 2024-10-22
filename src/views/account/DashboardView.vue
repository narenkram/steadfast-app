<template>
    <AppNavigationComponent />
    <div class="container my-4">
        <div class="row py-3">
            <div class="col-md-6 mx-auto" v-if="user">
                <h5 class="text-center mb-4">Account Information</h5>
                <div class="mb-3">
                    <label for="phoneNumber" class="form-label">Phone Number</label>
                    <input type="text" id="phoneNumber" class="form-control" :value="user.phoneNumber" disabled>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" id="email" class="form-control" :value="user.email" disabled>
                </div>
                <div class="mb-3">
                    <label for="userId" class="form-label">User ID</label>
                    <input type="text" id="userId" class="form-control" :value="user.uid" disabled>
                </div>
                <!-- Display other user details as needed -->
            </div>
            <div v-else class="col-12 text-center">
                <p class="text-muted fw-bold m-0">Loading user details...</p>
            </div>
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
