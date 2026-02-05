import { ref } from "vue";

const ALLOWED_VERSIONS = new Set(["next", "stable"]);
const IS_PULL_REQUEST = import.meta.env.VITE_IS_PR;
const DEFAULT_VERSION = IS_PULL_REQUEST ? "next" : "stable";
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
  value = ALLOWED_VERSIONS.has(value) ? value : DEFAULT_VERSION;

  // Save to localStorage, so the docs can respond to version change
  localStorage.setItem(DOCS_VERSION_KEY, value === "next" ? "current" : value);

  const url = new URL(window.location);
  if (!IS_PULL_REQUEST && value === DEFAULT_VERSION) {
    url.searchParams.delete("version");
  } else {
    url.searchParams.set("version", value);
  }

  window.history.replaceState({}, "", url);

  version.value = value;
}

const version = ref(undefined);
setVersion(getVersion());

export { setVersion, version };
