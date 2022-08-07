import { createApp } from "vue"
// import router from "./router"
import "./asset/css/global.scss"
import App from "./App.vue"
import { createPinia } from 'pinia'

import Notifications from '@kyvg/vue3-notification'

const app = createApp(App)
  // .use(router)
  .use(Notifications)
  .use(createPinia())

app.mount("#app")