<template>
    <div class="ai-automation">
        <h2>AI Automation</h2>
        <div v-if="!apiKey" class="api-key-input">
            <input v-model="apiKeyInput" type="text" placeholder="Enter your API key">
            <button @click="saveApiKey">Save API Key</button>
        </div>
        <div v-else class="chat-container">
            <div class="chat-messages" ref="chatMessages">
                <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
                    {{ message.content }}
                </div>
            </div>
            <div class="chat-input">
                <input v-model="userInput" @keyup.enter="sendMessage" placeholder="Type your message...">
                <button @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = ref(localStorage.getItem('GEMINI_API_KEY') || '');
const apiKeyInput = ref('');
const userInput = ref('');
const messages = ref([]);
const chatMessages = ref(null);

const saveApiKey = () => {
    if (apiKeyInput.value.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKeyInput.value.trim());
        apiKey.value = apiKeyInput.value.trim();
        apiKeyInput.value = '';
    }
};

const sendMessage = async () => {
    if (userInput.value.trim() === '') return;

    messages.value.push({ role: 'user', content: userInput.value });

    try {
        const genAI = new GoogleGenerativeAI(apiKey.value);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = userInput.value;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        messages.value.push({ role: 'ai', content: text });

        userInput.value = '';

        await nextTick();
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    } catch (error) {
        console.error('Error sending message to AI:', error);
        messages.value.push({ role: 'error', content: 'An error occurred while processing your request.' });
    }
};

onMounted(() => {
    if (apiKey.value) {
        messages.value.push({ role: 'ai', content: 'Hello! How can I assist you with Steadfast today?' });
    }
});
</script>

<style scoped>
.ai-automation {
    max-width: 600px;
    margin: 0 auto;
}

.api-key-input {
    display: flex;
    margin-bottom: 10px;
}

.api-key-input input {
    flex-grow: 1;
    margin-right: 10px;
}

.chat-container {
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
}

.chat-messages {
    height: 400px;
    overflow-y: auto;
    padding: 10px;
}

.message {
    margin-bottom: 10px;
    padding: 5px 10px;
    border-radius: 5px;
}

.user {
    background-color: #e6f2ff;
    text-align: right;
}

.ai {
    background-color: #f0f0f0;
}

.error {
    background-color: #ffebee;
    color: #d32f2f;
}

.chat-input {
    display: flex;
    padding: 10px;
    background-color: #f9f9f9;
}

input {
    flex-grow: 1;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}
</style>
