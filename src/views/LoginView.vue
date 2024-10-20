<template>
    <NormalNavigationComponent />
    <div class="container-fluid">
        <!-- Hero Section -->
        <section class="row py-5 border border-success rounded">
            <div class="col-lg-8 mx-auto text-center">
                <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid" style="max-height: 200px;">
                <h1 class="display-3 mb-4">Steadfast</h1>
                <blockquote class="blockquote mb-5">
                    <p>
                        Designed to survive and thrive in the options market.
                    </p>
                </blockquote>
                <button @click="openTradeView" class="btn btn-success btn-lg">
                    ⚡ Launch App
                </button>
                <br />
                <br />
                <a href="https://t.me/steadfastapp" target="_blank" class="btn btn-outline btn-md">
                    💬 Join Telegram Community
                </a>
                <div>
                    <h2>Login with Email/Password</h2>
                    <form @submit.prevent="loginWithEmailPassword">
                        <input type="email" v-model="email" placeholder="Email" required>
                        <input type="password" v-model="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <p>
                        Don't have an account? <router-link to="/signup">Sign up</router-link>
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

const loginWithEmailPassword = async () => {
    const auth = getAuth();
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        // Redirect to a protected page or update the UI accordingly
    } catch (error) {
        console.error('Error during email/password login:', error);
    }
}
</script>
