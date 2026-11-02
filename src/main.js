import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faClipboardUser } from '@fortawesome/free-solid-svg-icons';

// Add any icons you want to use
library.add(faClipboardUser);

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);
app.mount('#app');
