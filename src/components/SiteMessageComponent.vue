<template>
    <div class="seo-hidden">
        <h6 class="mb-0 bg-warning text-dark p-2">
            Regulatory Compliance Notice: If you identify any potential regulatory issues, please
            <a href="mailto:email@narenkram.com" class="fw-bold text-dark">contact me at
                email@narenkram.com</a>.
            I am committed to promptly addressing and resolving any concerns to ensure full compliance.
        </h6>
        <h6 class="mb-0 p-2">
            🚧 Site Under Active Development: Some features may be experimental.
            For any issues or feedback, please join our
            <a href="https://t.me/steadfastapp" target="_blank" rel="noopener noreferrer">Telegram community</a>.
        </h6>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    document.querySelector('.seo-hidden').classList.remove('seo-hidden');
});
</script>

<style scoped>
.seo-hidden {
    display: none;
}
</style>
