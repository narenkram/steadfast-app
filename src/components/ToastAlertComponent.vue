<template>
    <div v-if="show" class="bg-color toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex justify-content-between align-items-center p-2">
            <div class="fw-bold">🔔 Notification</div>
            <button type="button" class="btn-close" @click="hide" aria-label="Close"></button>
        </div>
        <div class="toast-body text-center">
            <span class="fs-6">{{ message }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ''
        },
        soundEnabled: {
            type: Boolean,
            default: true
        },
        selectedSound: {
            type: String,
            default: 'long-pop.wav'
        }
    },
    data() {
        return {
            audio: null
        };
    },
    watch: {
        show(newVal) {
            if (newVal) {
                if (this.soundEnabled) {
                    // Create audio object if not already created
                    if (!this.audio) {
                        this.audio = new Audio(`/${this.selectedSound}`);
                    }
                    // Attempt to play the sound
                    this.playSound();
                }

                setTimeout(() => {
                    this.hide();
                }, 3000); // Hide after 3 seconds
            }
        }
    },
    methods: {
        hide() {
            this.$emit('update:show', false);
        },
        playSound() {
            // Play the sound and catch any errors
            this.audio.play().catch(error => {
                console.warn('Audio playback failed:', error);
            });
        }
    }
};
</script>