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
                <button @click="loginWithGoogle">Login with Google</button>
            </div>
        </section>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

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

const loginWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // Redirect to a protected page or update the UI accordingly
    } catch (error) {
        console.error('Error during Google login:', error);
    }
}
</script>
