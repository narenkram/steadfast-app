<template>
    <div v-if="show" class="toast" :class="{ 'show': show }" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto">Notification</strong>
            <button type="button" class="btn-close" @click="hide"></button>
        </div>
        <div class="toast-body">
            {{ message }}
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
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                // Play notification sound
                const audio = new Audio('/cyberpunk-notification.mp3');
                audio.play();

                setTimeout(() => {
                    this.hide();
                }, 3000); // Hide after 3 seconds
            }
        }
    },
    methods: {
        hide() {
            this.$emit('update:show', false);
        }
    }
};
</script>