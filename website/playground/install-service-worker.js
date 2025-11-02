if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.mjs", {
    type: "module",
    scope: "/playground/",
  });
}
