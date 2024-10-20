<template>
    <div class="container">
        <h2>Sign Up</h2>
        <form @submit.prevent="signUp">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" v-model="email" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" v-model="password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Sign Up</button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const signUp = async () => {
    const auth = getAuth();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const user = userCredential.user;
        console.log('User signed up:', user);
        // Redirect to a protected page or update the UI accordingly
        router.push('/dashboard'); // Replace '/dashboard' with the appropriate route
    } catch (error) {
        console.error('Error during sign up:', error);
        // Handle sign up error, display error message to the user
    }
};
</script>
