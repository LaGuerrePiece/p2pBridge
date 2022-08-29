import { createApp } from "vue"
import { createRouter } from "vue-router";
// import router from "./router"
import App from "./App.vue"
import { createPinia } from 'pinia'
import "./asset/css/global.scss"

import Notifications from '@kyvg/vue3-notification'

import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

const app = createApp(App)
Sentry.init({
  app,
  dsn: "https://913cbb547c9e45a48342fd55aa4d4530@o1382803.ingest.sentry.io/6698466",
  integrations: [
    new BrowserTracing({
      tracingOrigins: ["localhost", "nuclearbridge.io", /^\//],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  logErrors: true,
});

app.use(createPinia())
app.use(Notifications)

app.mount("#app")