<template>
    <div class="seo-hidden">
        <h6 class="mb-0 bg-warning text-dark p-2">
            Regulatory Compliance Notice: If you identify any potential regulatory issues, please
            <a href="mailto:email@narenkram.com" class="text-dark font-weight-bold">contact me at
                email@narenkram.com</a>.
            I am committed to promptly addressing and resolving any concerns to ensure full compliance.
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
