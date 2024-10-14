<template>
    <div class="container">
        <h2 class="mb-3">Steadfast AI Assistant</h2>
        <div v-if="!apiKey" class="mb-3">
            <div class="input-group">
                <input v-model="apiKeyInput" type="text" class="form-control" placeholder="Enter your API key">
                <button @click="saveApiKey" class="btn btn-primary">Save API Key</button>
            </div>
        </div>
        <div v-else class="border rounded">
            <div class="overflow-auto p-3" style="height: 400px;" ref="chatMessages">
                <div v-for="(message, index) in messages" :key="index"
                    :class="['mb-2', 'p-2', 'rounded', message.role === 'user' ? 'text-end bg-light text-dark' : 'bg-light text-dark']">
                    <div v-if="message.role === 'ai' && message.content === ''" class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div v-else-if="message.role === 'ai'" v-html="renderMarkdown(message.content)"></div>
                    <div v-else>{{ message.content }}</div>
                </div>
            </div>
            <div class="p-3 bg-light">
                <div class="input-group">
                    <input v-model="userInput" @keyup.enter="sendMessage" class="form-control"
                        placeholder="Type your message..." :disabled="isWaitingForResponse">
                    <button @click="sendMessage" class="btn btn-primary" :disabled="isWaitingForResponse">Send</button>
                    <button v-if="lastMessageIsError" @click="retryLastMessage" class="btn btn-warning"
                        :disabled="isWaitingForResponse">Retry</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from 'marked';

const apiKey = ref(localStorage.getItem('GEMINI_API_KEY') || '');
const apiKeyInput = ref('');
const userInput = ref('');
const messages = ref([]);
const chatMessages = ref(null);
const isWaitingForResponse = ref(false);
const lastMessageIsError = ref(false);

const saveApiKey = () => {
    if (apiKeyInput.value.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKeyInput.value.trim());
        apiKey.value = apiKeyInput.value.trim();
        apiKeyInput.value = '';
    }
};

const systemPrompt = "You are an AI assistant for the Steadfast trading app. Provide helpful information about options trading, risk management, and using the Steadfast app features.";

const renderMarkdown = (content) => {
    return marked(content);
};

const scrollToBottom = () => {
    if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    }
};

const sendMessage = async () => {
    if (userInput.value.trim() === '' || isWaitingForResponse.value) return;

    messages.value.push({ role: 'user', content: userInput.value });
    messages.value.push({ role: 'ai', content: '' }); // Add empty AI message for typing indicator
    isWaitingForResponse.value = true;

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

        messages.value[messages.value.length - 1].content = text; // Update the last AI message with the response

        userInput.value = '';

        await nextTick();
        scrollToBottom(); // Scroll to bottom after adding AI response
    } catch (error) {
        console.error('Error sending message to AI:', error);
        messages.value[messages.value.length - 1] = { role: 'error', content: 'An error occurred while processing your request.' };
        lastMessageIsError.value = true;
    } finally {
        isWaitingForResponse.value = false;
    }
};

const retryLastMessage = async () => {
    if (messages.value.length < 2) return;

    const lastUserMessage = messages.value
        .slice()
        .reverse()
        .find(message => message.role === 'user');

    if (lastUserMessage) {
        messages.value.pop(); // Remove the error message
        userInput.value = lastUserMessage.content;
        await sendMessage();
    }
};

onMounted(() => {
    if (apiKey.value) {
        messages.value.push({ role: 'ai', content: 'Hello! How can I assist you with Steadfast today?' });
    }
});
</script>

<style scoped>
.typing-indicator {
    display: inline-block;
    width: 50px;
}

.typing-indicator span {
    height: 10px;
    width: 10px;
    float: left;
    margin: 0 1px;
    background-color: #6c757d;
    display: block;
    border-radius: 50%;
    opacity: 0.4;
    animation: blink 1s infinite;
}

.typing-indicator span:nth-of-type(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-of-type(3) {
    animation-delay: 0.4s;
}

@keyframes blink {
    0% {
        opacity: 0.4;
    }

    20% {
        opacity: 1;
    }

    100% {
        opacity: 0.4;
    }
}
</style>
