<template>
    <div class="Steadfast-AI-Assistant">
        <div class="d-flex justify-content-between align-items-center">
            <h2 class="mb-3">Steadfast AI Assistant</h2>
            <div class="d-flex justify-content-end p-2">
                <button @click="startNewChat" class="btn btn-outline btn-sm">New Chat</button>
            </div>
        </div>
        <div v-if="!apiKey" class="mb-3">
            <div class="input-group">
                <input v-model="apiKeyInput" type="text" class="form-control" placeholder="Enter your API key">
                <button @click="saveApiKey" class="btn btn-primary">Save API Key</button>
            </div>
        </div>
        <div v-else class="border rounded">
            <div class="overflow-auto p-3" ref="chatMessages">
                <div v-for="(message, index) in messages" :key="index"
                    :class="['mb-2', 'p-2', 'rounded', message.role === 'user' ? 'text-end' : '']">
                    <div
                        :class="['d-inline-block', 'p-2', 'rounded', message.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark', 'mw-75']">
                        <img v-if="message.image" :src="message.image" class="user-image" />
                        <div v-if="message.role === 'ai' && message.content === ''" class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div v-else-if="message.role === 'ai'" v-html="renderMarkdown(message.content)"></div>
                        <div v-else>{{ message.content }}</div>
                    </div>
                </div>
            </div>
            <div class="p-3 bg-light">
                <div class="row d-flex flex-row align-items-center justify-content-between">
                    <div class="col-1">
                        <input type="file" @change="handleImageUpload" accept="image/*" class="form-control d-none"
                            id="imageUpload">
                        <label class="input-group-text" for="imageUpload">🖼️</label>
                    </div>
                    <div class="col-9">
                        <input v-model="userInput" @keyup.enter="sendMessage" class="form-control"
                            placeholder="Type your message..." :disabled="isWaitingForResponse">

                    </div>
                    <div class="col-2">
                        <button @click="sendMessage" class="btn btn-primary w-100"
                            :disabled="isWaitingForResponse">Send</button>
                        <button v-if="lastMessageIsError" @click="retryLastMessage" class="btn btn-warning w-100"
                            :disabled="isWaitingForResponse">Retry</button>
                    </div>
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
const selectedImage = ref(null);
const chat = ref(null);

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

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        selectedImage.value = file;
    } else {
        alert('Please select a valid image file.');
        event.target.value = ''; // Clear the file input
    }
};

const initChat = () => {
    const genAI = new GoogleGenerativeAI(apiKey.value);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    chat.value = model.startChat({
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
};

const sendMessage = async () => {
    if ((userInput.value.trim() === '' && !selectedImage.value) || isWaitingForResponse.value) return;

    if (!chat.value) {
        initChat();
    }

    const newMessage = { role: 'user', content: userInput.value };
    if (selectedImage.value) {
        newMessage.image = URL.createObjectURL(selectedImage.value);
    }
    messages.value.push(newMessage);
    messages.value.push({ role: 'ai', content: '' });
    isWaitingForResponse.value = true;

    try {
        const prompt = userInput.value.trim() || "What's in this image?";
        const imageParts = selectedImage.value ? [
            { inlineData: { data: await fileToGenerativePart(selectedImage.value), mimeType: selectedImage.value.type } },
        ] : [];

        const result = await chat.value.sendMessage([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        messages.value[messages.value.length - 1].content = text;

        userInput.value = '';
        selectedImage.value = null;
        document.getElementById('imageUpload').value = '';

        await nextTick();
        scrollToBottom();
    } catch (error) {
        console.error('Error sending message to AI:', error);
        messages.value[messages.value.length - 1] = { role: 'error', content: 'An error occurred while processing your request.' };
        lastMessageIsError.value = true;
    } finally {
        isWaitingForResponse.value = false;
    }
};

const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return base64EncodedDataPromise;
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

const startNewChat = () => {
    messages.value = [];
    initChat();
    messages.value.push({ role: 'ai', content: 'Hello! How can I assist you with Steadfast today?' });
};

onMounted(() => {
    if (apiKey.value) {
        startNewChat();
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

.user-image {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
    margin-bottom: 10px;
}
</style>
