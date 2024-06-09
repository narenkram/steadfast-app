import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import store from './stores/store'

import VueSocketIO from 'vue-socket.io'
import { io } from 'socket.io-client' // Ensure this import is correct

const socketConnection = io('http://localhost:3000', {
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(store)

app.use(new VueSocketIO({
    debug: true,
    connection: socketConnection,
}))

app.mount('#app')
