<template>
    <NormalNavigationComponent />
    <div class="container-fluid bg-gradient">
        <div class="row py-5">
            <div class="col-md-5 card shadow-lg border-0 mx-auto">
                <div class="card-body p-4 text-center">
                    <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid mb-3" style="max-height: 150px;">
                    <h1 class="card-title text-center mb-3 display-5 fw-bold">Login</h1>
                    <form @submit.prevent="loginWithEmailPassword">
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
                            Log In
                            <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="ms-2" />
                        </button>
                    </form>
                    <div class="text-center mt-3">
                        <p class="mb-1">Don't have an account?</p>
                        <router-link to="/signup" class="btn btn-link text-danger">Sign Up</router-link>
                    </div>
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
