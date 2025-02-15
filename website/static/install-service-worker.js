/* eslint-disable unicorn/prefer-module */
"use strict";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js", {
    scope: "/playground/",
  });
}
