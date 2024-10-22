<template>
    <div class="notification-container d-flex align-items-center">
        <div class="notification-icon me-2" :class="{ 'has-notification': showToast }">
            <font-awesome-icon icon="bell" />
        </div>
        <div class="notification-message" :class="{ 'show-message': showToast }">
            {{ message || 'No new notifications' }}
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@/font-awesome';

const props = defineProps({
    showToast: Boolean,
    message: String,
    notificationSound: Boolean,
    selectedSound: String,
});

const emit = defineEmits(['update:showToast', 'update:message']);

const audio = ref(null);
const notificationTimer = ref(null);

watch(() => props.showToast, (newShowToast, oldShowToast) => {
    if (newShowToast && newShowToast !== oldShowToast) {
        if (props.notificationSound) {
            playNotificationSound();
        }
        startNotificationTimer();
    }
});

const playNotificationSound = () => {
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
    }
    audio.value = new Audio(props.selectedSound);
    audio.value.play().catch(error => console.error('Error playing notification sound:', error));
};

const startNotificationTimer = () => {
    if (notificationTimer.value) {
        clearTimeout(notificationTimer.value);
    }
    notificationTimer.value = setTimeout(() => {
        clearNotification();
    }, 3000); // Hide after 3 seconds
};

const clearNotification = () => {
    emit('update:showToast', false);
    emit('update:message', '');
    if (audio.value) {
        audio.value.pause();
        audio.value.currentTime = 0;
    }
    if (notificationTimer.value) {
        clearTimeout(notificationTimer.value);
    }
};
</script>
