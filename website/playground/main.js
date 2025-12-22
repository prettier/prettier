import "./styles/index.css";

import { createApp } from "vue";
import App from "./App.vue";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.mjs", {
    type: "module",
    scope: "/playground/",
  });
}

const container = document.getElementById("root");
const root = createApp(App);
root.mount(container);
