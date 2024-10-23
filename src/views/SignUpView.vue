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
                            <label for="email" class="form-label text-start d-block">Email:</label>
                            <div class="input-group">
                                <span class="input-group-text bg-color-2">
                                    <font-awesome-icon :icon="['fas', 'envelope']" />
                                </span>
                                <input type="email" id="email" v-model="email" class="form-control bg-color-2"
                                    placeholder="Enter your email" required autocomplete="email">
                            </div>
                        </div>
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
                        <div id="recaptcha-container"></div>
                        <button type="submit" class="btn btn-warning w-100 mt-3 fw-bold text-uppercase">
                            Get SMS OTP
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
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, updateProfile } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@/font-awesome';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const phoneNumber = ref('');
const email = ref('');
const showOtpInput = ref(false);
const otp = ref('');
const confirmationResult = ref(null);
const router = useRouter();

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

    // Check if a user with the same email already exists
    const emailExists = await checkEmailExists(email.value);
    if (emailExists) {
        alert('An account with this email already exists. Please use a different email.');
        return;
    }

    // Check if a user with the same phone number already exists
    const phoneNumberExists = await checkPhoneNumberExists(formattedPhoneNumber);
    if (phoneNumberExists) {
        alert('An account with this phone number already exists. Please use a different phone number.');
        return;
    }

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

// Function to check if a user with the given email exists
const checkEmailExists = async (email) => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

// Function to check if a user with the given phone number exists
const checkPhoneNumberExists = async (phoneNumber) => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

const verifyOtp = async () => {
    confirmationResult.value.confirm(otp.value)
        .then((result) => {
            // User signed in successfully.
            const user = result.user;
            console.log('User signed up:', user);

            // Update the user's profile with the email
            updateProfile(user, {
                email: email.value
            })
                .then(() => {
                    console.log('Email updated successfully');

                    // Store the user's email in Firestore
                    const db = getFirestore();
                    const userRef = doc(db, 'users', user.uid);
                    setDoc(userRef, {
                        email: email.value,
                        phoneNumber: phoneNumber.value,
                        // Add other user details as needed
                    })
                        .then(() => {
                            console.log('User data stored in Firestore');
                            // After successful sign-up
                            localStorage.setItem('userId', user.uid);
                            router.push('/dashboard');
                        })
                        .catch((error) => {
                            console.error('Error storing user data in Firestore:', error);
                            // Handle the error appropriately (e.g., show an error message)
                        });
                })
                .catch((error) => {
                    console.error('Error updating email:', error);
                    // Handle the error appropriately (e.g., show an error message)
                });
        })
        .catch((error) => {
            console.error('Error during OTP verification:', error);
            alert('Invalid OTP. Please try again.');
        });
};
</script>
