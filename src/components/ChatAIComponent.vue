<template>
    <div class="container">
        <h2 class="mb-3">AI Automation</h2>
        <div v-if="!apiKey" class="mb-3">
            <div class="input-group">
                <input v-model="apiKeyInput" type="text" class="form-control" placeholder="Enter your API key">
                <button @click="saveApiKey" class="btn btn-primary">Save API Key</button>
            </div>
        </div>
        <div v-else class="border rounded">
            <div class="overflow-auto p-3" style="height: 400px;" ref="chatMessages">
                <div v-for="(message, index) in messages" :key="index"
                    :class="['mb-2', 'p-2', 'rounded', message.role === 'user' ? 'text-end bg-light' : 'bg-secondary text-white']">
                    <div v-if="message.role === 'ai' && message.content === ''" class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div v-else>{{ message.content }}</div>
                </div>
            </div>
            <div class="p-3 bg-light">
                <div class="input-group">
                    <input v-model="userInput" @keyup.enter="sendMessage" class="form-control"
                        placeholder="Type your message...">
                    <button @click="sendMessage" class="btn btn-primary">Send</button>
                </div>
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

const systemPrompt = "You are an AI assistant for the Steadfast trading app. Provide helpful information about options trading, risk management, and using the Steadfast app features.";

const sendMessage = async () => {
    if (userInput.value.trim() === '') return;

    messages.value.push({ role: 'user', content: userInput.value });

    try {
        const genAI = new GoogleGenerativeAI(apiKey.value);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I'm here to assist users with the Steadfast trading app, providing information about options trading, risk management, and the app's features. How can I help you today?" }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage([{ text: userInput.value }]);
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

.typing-indicator {
    display: inline-block;
    width: 50px;
}

.typing-indicator span {
    height: 10px;
    width: 10px;
    float: left;
    margin: 0 1px;
    background-color: #9E9EA1;
    display: block;
    border-radius: 50%;
    opacity: 0.4;
}

.typing-indicator span:nth-of-type(1) {
    animation: 1s blink infinite 0.3333s;
}

.typing-indicator span:nth-of-type(2) {
    animation: 1s blink infinite 0.6666s;
}

.typing-indicator span:nth-of-type(3) {
    animation: 1s blink infinite 0.9999s;
}

@keyframes blink {
    50% {
        opacity: 1;
    }
}
</style>
