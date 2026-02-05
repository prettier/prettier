import { ref } from "vue";

// eslint-disable-next-line prefer-destructuring
const DEFAULT_VERSION = import.meta.env.DEFAULT_VERSION;

function getVersion() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("version")) {
    return params.get("version") === "next" ? "next" : DEFAULT_VERSION;
  }

  const docsVersion = localStorage.getItem("docs-preferred-version-default");
  return docsVersion === "next" ? "next" : DEFAULT_VERSION;
}

function setVersion(value) {
  const url = new URL(window.location);

  if (value === "next") {
    localStorage.setItem("docs-preferred-version-default", "current");
    version.value = "next";
    url.searchParams.set("version", "next");
  } else {
    localStorage.removeItem("docs-preferred-version-default");
    version.value = "stable";
    url.searchParams.delete("version");
  }

  window.history.replaceState({}, "", url);
}

const version = ref(undefined);
setVersion(getVersion());

export { setVersion, version };
