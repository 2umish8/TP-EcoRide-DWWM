import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// FontAwesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

// Add all solid icons to the library
library.add(fas)

const app = createApp(App)

// Ensure a sane default for colors: force dark bucket like previous design required
if (typeof document !== 'undefined' && !document.body.classList.contains('force-dark')) {
  document.body.classList.add('force-dark')
}

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
