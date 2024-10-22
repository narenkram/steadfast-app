<template>
    <NormalNavigationComponent />
    <section class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-gradient">
        <div class="card bg-dark text-white shadow-lg border-0">
            <div class="card-body p-5 text-center">
                <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid" style="max-height: 200px;">
                <h2 class="card-title text-center mb-4 display-4 fw-bold text-warning">Sign Up</h2>
                <form @submit.prevent="signUp">
                    <div class="text-start mb-4">
                        <label for="email" class="form-label fs-5">
                            <font-awesome-icon :icon="['fas', 'envelope']" class="me-2" />
                            Email Address:
                        </label>
                        <input type="email" id="email" v-model="email"
                            class="form-control form-control-lg bg-secondary text-white border-0" required>
                    </div>
                    <div class="text-start mb-4">
                        <label for="password" class="form-label fs-5">
                            <font-awesome-icon :icon="['fas', 'key']" class="me-2" />
                            Password:
                        </label>
                        <input type="password" id="password" v-model="password"
                            class="form-control form-control-lg bg-secondary text-white border-0" required>
                    </div>
                    <button type="submit" class="btn btn-warning btn-lg w-100 mt-4 fw-bold text-uppercase">
                        Create Account
                        <font-awesome-icon :icon="['fas', 'user-plus']" class="ms-2" />
                    </button>
                </form>
                <div class="text-center mt-4">
                    <p class="mb-0">Already have an account?</p>
                    <router-link to="/login" class="btn btn-link text-warning">Log In</router-link>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@/font-awesome';

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
