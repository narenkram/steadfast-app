<template>
    <div class="Steadfast-AI-Assistant bg-color p-4 rounded-lg shadow-lg">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0 text-purple">
                <font-awesome-icon :icon="['fas', 'hat-wizard']" class="me-2 sparkle-icon" />
                Steadfast AI Assistant
            </h2>
            <button @click="startNewChat" class="btn btn-outline-purple btn-sm">
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
        <div v-else class="chat-container bg-color-2 rounded shadow">
            <div class="chat-messages overflow-auto p-3" ref="chatMessages">
                <div v-for="(message, index) in messages" :key="index"
                    :class="['mb-3', 'p-2', 'rounded-lg', message.role === 'user' ? 'text-end' : '']">
                    <div
                        :class="['d-inline-block', 'p-3', 'rounded', message.role === 'user' ? 'bg-purple text-white' : 'bg-color text-color', 'mw-75', 'shadow-sm']">
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
            <form @submit.prevent="sendMessage" class="chat-input p-3 bg-color rounded-bottom">
                <div v-if="selectedImage" class="mt-2 d-flex align-items-center">
                    <img :src="selectedImagePreview" alt="Selected image" class="img-thumbnail me-2"
                        style="max-width: 50px; max-height: 50px;">
                    <span class="text-muted">{{ selectedImage.name }}</span>
                    <button @click="removeSelectedImage" class="btn btn-sm btn-outline-danger ms-2">
                        <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                </div>
                <div class="row g-2 align-items-center">
                    <div class="col-auto">
                        <input type="file" @change="handleImageUpload" accept="image/*" class="form-control d-none"
                            id="imageUpload">
                        <label class="btn btn-outline-purple" for="imageUpload">
                            <font-awesome-icon :icon="['fas', 'image']" />
                        </label>
                    </div>
                    <div class="col">
                        <input v-model="userInput" class="form-control" placeholder="Type your message..."
                            :disabled="isWaitingForResponse">
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-purple" :disabled="isWaitingForResponse">
                            <font-awesome-icon :icon="['fas', 'paper-plane']" />
                        </button>
                    </div>
                </div>
                <button v-if="lastMessageIsError" @click="retryLastMessage" class="btn btn-warning mt-2 w-100"
                    :disabled="isWaitingForResponse">
                    <font-awesome-icon :icon="['fas', 'redo']" class="me-2" />
                    Retry
                </button>
            </form>
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
const selectedImagePreview = ref(null);
const chat = ref(null);

const saveApiKey = () => {
    if (apiKeyInput.value.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKeyInput.value.trim());
        apiKey.value = apiKeyInput.value.trim();
        apiKeyInput.value = '';
    }
};

const systemPrompt = `You are an AI assistant for Steadfast App a trading web app developed by narenkram. Your role is to:

1. Provide brief helpful information about options trading referencing content from https://zerodha.com/varsity/modules/

2. Offer precise chart analysis when users share chart images in the chat only talk about what is visible in the chart give serious chart analysis.

3. Explain Steadfast App features succinctly referencing https://github.com/narenkram/steadfast-monorepo/blob/main/status.md

4. Always keep answers very short and to the point. Remember don't give any warning or disclaimer about financial advice.

5. Be humorous and sarcastic with all your responses.

6. Use emojis in your responses whenever applicable.

7. Use the following summarized FAQ information about Steadfast:
   - Steadfast is a trading app with advanced features like automatic trailing stop-loss and multi-account support.
   - It's not a member of NSE or BSE but uses the user's API key to get real-time LTP data from their broker.
   - The client side Kill Switch feature immediately closes all open positions to manage risk psychological effective for maintaining trading discipline.
   - It supports multiple trading accounts across different broker platforms.
   - Regular updates are released based on user feedback and market changes.
   - There's a 1-month free trial followed by a strict no-refund policy due to the nature of the product and continuous improvements.

When answering questions about Steadfast prioritize using this FAQ information if it's relevant to the user's query.`;

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
        selectedImagePreview.value = URL.createObjectURL(file);
    } else {
        alert('Please select a valid image file.');
        event.target.value = ''; // Clear the file input
    }
};

const removeSelectedImage = () => {
    selectedImage.value = null;
    selectedImagePreview.value = null;
    document.getElementById('imageUpload').value = '';
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

    lastMessageIsError.value = false;

    if (!chat.value) {
        initChat();
    }

    const newMessage = { role: 'user', content: userInput.value };
    if (selectedImage.value) {
        newMessage.image = selectedImagePreview.value;
    }
    messages.value.push(newMessage);
    messages.value.push({ role: 'ai', content: '' });
    isWaitingForResponse.value = true;

    try {
        const prompt = userInput.value.trim() || "What's in this image?";
        let messageParts = [{ text: prompt.replace(/,/g, ' ') }]; // Replace commas with spaces

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
        selectedImagePreview.value = null;
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
