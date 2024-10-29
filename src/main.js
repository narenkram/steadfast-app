import 'bootstrap'
import './assets/main.scss'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { FontAwesomeIcon } from './font-awesome'
import { app as firebaseApp } from './firebase'

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)

app.mount('#app')
