<template>
    <NormalNavigationComponent />
    <div class="container-fluid bg-gradient">
        <div class="row py-5">
            <div class="col-md-5 card shadow-lg border-0 mx-auto">
                <div class="card-body p-4 text-center">
                    <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid mb-3" style="max-height: 150px;">
                    <h2 class="card-title text-center mb-3 display-5 fw-bold">Sign Up</h2>
                    <form @submit.prevent="signUp" v-if="!showOtpInput">
                        <div class="mb-3">
                            <label for="phoneNumber" class="form-label text-start d-block">Phone Number:</label>
                            <div class="input-group">
                                <span class="input-group-text bg-color-2">
                                    <font-awesome-icon :icon="['fas', 'phone']" />
                                </span>
                                <input type="tel" id="phoneNumber" v-model="phoneNumber" class="form-control bg-color-2"
                                    placeholder="Enter your phone number" required autocomplete="tel">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label text-start d-block">Password:</label>
                            <div class="input-group">
                                <span class="input-group-text bg-color-2">
                                    <font-awesome-icon :icon="['fas', 'key']" />
                                </span>
                                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password"
                                    class="form-control bg-color-2" placeholder="Enter your password" required
                                    autocomplete="new-password">
                                <button type="button" class="btn btn-outline-secondary"
                                    @click="togglePasswordVisibility">
                                    <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                                </button>
                            </div>
                        </div>
                        <div id="recaptcha-container"></div>
                        <button type="submit" class="btn btn-warning w-100 mt-3 fw-bold text-uppercase">
                            Send OTP
                            <font-awesome-icon :icon="['fas', 'paper-plane']" class="ms-2" />
                        </button>
                    </form>
                    <form @submit.prevent="verifyOtp" v-else>
                        <div class="mb-3">
                            <label for="otp" class="form-label text-start d-block">Enter OTP:</label>
                            <div class="input-group">
                                <span class="input-group-text bg-color-2">
                                    <font-awesome-icon :icon="['fas', 'lock']" />
                                </span>
                                <input type="text" id="otp" v-model="otp" class="form-control bg-color-2"
                                    placeholder="Enter the OTP" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-warning w-100 mt-3 fw-bold text-uppercase">
                            Verify OTP
                            <font-awesome-icon :icon="['fas', 'check-circle']" class="ms-2" />
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
import { ref, onMounted } from 'vue';
import NormalNavigationComponent from '@/components/NormalNavigationComponent.vue';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@/font-awesome';

const phoneNumber = ref('');
const password = ref('');
const showPassword = ref(false);
const showOtpInput = ref(false);
const otp = ref('');
const confirmationResult = ref(null);
const router = useRouter();

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

onMounted(() => {
    const auth = getAuth();
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
            console.log('recaptcha resolved..')
        }
    });
});

const signUp = async () => {
    const auth = getAuth();
    const appVerifier = window.recaptchaVerifier;

    // Format the Indian phone number
    const indianPhoneNumber = phoneNumber.value.trim();
    const formattedPhoneNumber = `+91${indianPhoneNumber}`;

    signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier)
        .then((result) => {
            confirmationResult.value = result;
            showOtpInput.value = true;
        })
        .catch((error) => {
            console.error('Error during sign up:', error);
            if (error.code === 'auth/invalid-phone-number') {
                // Display an error message to the user indicating invalid phone number format
                alert('Invalid phone number format. Please enter a valid Indian phone number.');
            }
            // Reset reCAPTCHA on error
            window.recaptchaVerifier.render().then(function (widgetId) {
                grecaptcha.reset(widgetId);
            });
        });
};

const verifyOtp = async () => {
    confirmationResult.value.confirm(otp.value)
        .then((result) => {
            // User signed in successfully.
            const user = result.user;
            console.log('User signed up:', user);
            router.push('/dashboard');
        })
        .catch((error) => {
            console.error('Error during OTP verification:', error);
            alert('Invalid OTP. Please try again.');
        });
};
</script>
