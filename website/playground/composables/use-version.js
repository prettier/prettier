import { ref } from "vue";

const ALLOWED_VERSIONS = new Set(["next", "stable"]);
// eslint-disable-next-line prefer-destructuring
const DEFAULT_VERSION = import.meta.env.DEFAULT_VERSION;
const DOCS_VERSION_KEY = "docs-preferred-version-default";

function getVersion() {
  const versionInUrl = new URLSearchParams(window.location.search).get(
    "version",
  );
  if (ALLOWED_VERSIONS.has(versionInUrl)) {
    return versionInUrl;
  }

  let docsVersion = localStorage.getItem(DOCS_VERSION_KEY);
  if (docsVersion === "current") {
    docsVersion = "next";
  }
  if (ALLOWED_VERSIONS.has(docsVersion)) {
    return docsVersion;
  }

  return DEFAULT_VERSION;
}

function setVersion(value) {
  const url = new URL(window.location);

  value = ALLOWED_VERSIONS.has(value) ? value : DEFAULT_VERSION;

  localStorage.setItem(DOCS_VERSION_KEY, value === "next" ? "current" : value);
  version.value = value;
  if (value === DEFAULT_VERSION) {
    url.searchParams.delete("version");
  } else {
    url.searchParams.set("version", value);
  }

  window.history.replaceState({}, "", url);
}

const version = ref(undefined);
setVersion(getVersion());

export { setVersion, version };
