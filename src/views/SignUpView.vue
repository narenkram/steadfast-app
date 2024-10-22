<template>
    <NormalNavigationComponent />
    <div class="container-fluid bg-gradient">
        <div class="row py-5">
            <div class="col-md-5 card shadow-lg border-0 mx-auto">
                <div class="card-body p-4 text-center">
                    <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid mb-3" style="max-height: 150px;">
                    <h2 class="card-title text-center mb-3 display-5 fw-bold">Sign Up</h2>
                    <form @submit.prevent="signUp">
                        <div class="mb-3">
                            <label for="email" class="form-label text-start d-block">Email Address:</label>
                            <div class="input-group">
                                <span class="input-group-text bg-color-2 border-0">
                                    <font-awesome-icon :icon="['fas', 'envelope']" />
                                </span>
                                <input type="email" id="email" v-model="email" class="form-control bg-color-2 border-0"
                                    placeholder="Enter your email" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label text-start d-block">Password:</label>
                            <div class="input-group">
                                <span class="input-group-text bg-color-2 border-0">
                                    <font-awesome-icon :icon="['fas', 'key']" />
                                </span>
                                <input type="password" id="password" v-model="password"
                                    class="form-control bg-color-2 border-0" placeholder="Enter your password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-warning w-100 mt-3 fw-bold text-uppercase">
                            Create Account
                            <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="ms-2" />
                        </button>
                    </form>
                    <div class="text-center mt-3">
                        <p class="mb-1">Already have an account?</p>
                        <router-link to="/login" class="btn btn-link text-danger">Log In</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
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
