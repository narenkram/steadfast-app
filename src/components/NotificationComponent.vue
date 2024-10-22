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

<script>
export default {
    name: 'NotificationComponent',
    props: {
        showToast: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ''
        }
    }
}
</script>

<style scoped>
/* Add any specific styles for the notification component here */
</style>
