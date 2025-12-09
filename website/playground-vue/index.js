import "codemirror-graphql/cm6-legacy/mode.esm.js";
import "./install-service-worker.js";

import { createApp } from "vue";
import App from "./App.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const linksContainer = document.querySelector(".links");
if (linksContainer) {
  const themeToggleContainer = document.createElement("div");
  linksContainer.appendChild(themeToggleContainer);
  const themeToggleApp = createApp(ThemeToggle);
  themeToggleApp.mount(themeToggleContainer);
}

const container = document.getElementById("app");
const app = createApp(App);
app.mount(container);
