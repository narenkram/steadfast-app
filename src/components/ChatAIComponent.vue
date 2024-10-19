<template>
    <div class="Steadfast-AI-Assistant bg-gradient p-4 rounded-lg shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0 text-primary">
                <font-awesome-icon :icon="['fas', 'hat-wizard']" class="me-2 sparkle-icon" />
                Steadfast AI Assistant
            </h2>
            <button @click="startNewChat" class="btn btn-outline-primary btn-sm">
                <font-awesome-icon :icon="['fas', 'sync']" class="me-2" />
                New Chat
            </button>
        </div>
        <div v-if="!apiKey" class="mb-4">
            <div class="input-group">
                <input v-model="apiKeyInput" type="text" class="form-control" placeholder="Enter your Gemini API key">
                <button @click="saveApiKey" class="btn btn-primary">
                    <font-awesome-icon :icon="['fas', 'key']" class="me-2" />
                    Save API Key
                </button>
            </div>
        </div>
        <div v-else class="chat-container bg-white rounded-lg shadow">
            <div class="chat-messages overflow-auto p-3" ref="chatMessages">
                <div v-for="(message, index) in messages" :key="index"
                    :class="['mb-3', 'p-2', 'rounded-lg', message.role === 'user' ? 'text-end' : '']">
                    <div
                        :class="['d-inline-block', 'p-3', 'rounded-lg', message.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark', 'mw-75', 'shadow-sm']">
                        <img v-if="message.image" :src="message.image" class="user-image rounded" />
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
            <div class="chat-input p-3 bg-light rounded-bottom">
                <div class="row g-2 align-items-center">
                    <div class="col-auto">
                        <input type="file" @change="handleImageUpload" accept="image/*" class="form-control d-none"
                            id="imageUpload">
                        <label class="btn btn-outline-secondary" for="imageUpload">
                            <font-awesome-icon :icon="['fas', 'image']" />
                        </label>
                    </div>
                    <div class="col">
                        <input v-model="userInput" @keyup.enter="sendMessage" class="form-control"
                            placeholder="Type your message..." :disabled="isWaitingForResponse">
                    </div>
                    <div class="col-auto">
                        <button @click="sendMessage" class="btn btn-primary" :disabled="isWaitingForResponse">
                            <font-awesome-icon :icon="['fas', 'paper-plane']" />
                        </button>
                    </div>
                </div>
                <button v-if="lastMessageIsError" @click="retryLastMessage" class="btn btn-warning mt-2 w-100"
                    :disabled="isWaitingForResponse">
                    <font-awesome-icon :icon="['fas', 'redo']" class="me-2" />
                    Retry
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from 'marked';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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

const systemPrompt = `You are an AI assistant for Steadfast App, a trading web app developed by narenkram. Your role is to:

1. Provide brief, helpful information about options trading, referencing content from https://zerodha.com/varsity/modules/

2. Offer precise chart analysis when users share chart images in the chat, only talk about what is visible in the chart, give serious chart analysis.

3. Explain Steadfast App features succinctly, referencing https://github.com/narenkram/steadfast-monorepo/blob/main/status.md

4. Always keep answers very short and to the point. Remember, don't give any warning or disclaimer about financial advice.

5. Be humorous and sarcastic with all your responses.

6. Use emojis in your responses whenever applicable.`;

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
            maxOutputTokens: 500, // Reduced to encourage shorter responses
        },
    });
};

const sendMessage = async () => {
    if ((userInput.value.trim() === '' && !selectedImage.value) || isWaitingForResponse.value) return;

    lastMessageIsError.value = false; // Reset error state at the start of each message

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
    lastMessageIsError.value = false;

    try {
        const prompt = userInput.value.trim() || "What's in this image?";
        let messageParts = [{ text: prompt }];

        if (selectedImage.value) {
            const imageData = await fileToGenerativePart(selectedImage.value);
            messageParts.push({
                inlineData: { data: imageData, mimeType: selectedImage.value.type }
            });
        }

        const result = await chat.value.sendMessage(messageParts);
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
    lastMessageIsError.value = false; // Reset error state
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
.bg-gradient {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.chat-container {
    height: 70vh;
    display: flex;
    flex-direction: column;
}

.chat-messages {
    flex-grow: 1;
    max-height: calc(70vh - 100px);
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
    max-height: 200px;
    object-fit: contain;
    margin-bottom: 10px;
}

.chat-input {
    border-top: 1px solid #dee2e6;
}
</style>
