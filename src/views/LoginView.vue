<template>
    <NormalNavigationComponent />
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-gradient py-5">
        <div class="card bg-dark text-white shadow-lg border-0">
            <div class="card-body p-5 text-center">
                <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid" style="max-height: 200px;">
                <h1 class="card-title text-center mb-4 display-4 fw-bold text-warning">Steadfast</h1>
                <form @submit.prevent="loginWithEmailPassword">
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
                        Log In
                        <font-awesome-icon :icon="['fas', 'sign-in-alt']" class="ms-2" />
                    </button>
                </form>
                <div class="text-center mt-4">
                    <p class="mb-2">Don't have an account?</p>
                    <router-link to="/signup" class="btn btn-link text-warning">Sign Up</router-link>
                </div>
                <div class="d-flex justify-content-center mt-4">
                    <button @click="openTradeView" class="btn btn-success btn-lg me-3">
                        <font-awesome-icon :icon="['fas', 'bolt']" class="me-2" />
                        Launch App
                    </button>
                    <a href="https://t.me/steadfastapp" target="_blank" class="btn btn-outline-light btn-lg">
                        <font-awesome-icon :icon="['fab', 'telegram']" class="me-2" />
                        Join Telegram
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@/font-awesome';

const tradeViewWindow = ref(null)
const openTradeView = () => {
    const url = `${window.location.origin}/steadfast`
    window.location.href = url
}

onMounted(() => {
    window.addEventListener('beforeunload', () => {
        if (tradeViewWindow.value) {
            tradeViewWindow.value.close();
        }
    });
});

const email = ref('')
const password = ref('')

const router = useRouter();

const loginWithEmailPassword = async () => {
    const auth = getAuth();
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        // Redirect to the manage-brokers page
        router.push('/manage-brokers');
    } catch (error) {
        console.error('Error during email/password login:', error);
    }
}
</script>
