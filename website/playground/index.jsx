import "codemirror-graphql/cm6-legacy/mode.esm.js";
import "./install-service-worker.js";

import { createApp, onMounted, reactive, ref, watch } from "vue";
import Playground from "./Playground.jsx";
import { fixPrettierVersion } from "./utilities.js";
import VersionLink from "./VersionLink.jsx";
import WorkerApi from "./WorkerApi.js";

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function ThemeToggle() {
  const theme = ref(getInitialTheme());

  const toggleTheme = () => {
    const newTheme = theme.value === "dark" ? "light" : "dark";
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  applyTheme(theme.value);

  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  return (
    <button
      onClick={toggleTheme}
      class="btn"
      aria-label={`Switch to ${theme.value === "dark" ? "light" : "dark"} theme`}
    >
      {theme.value === "dark" ? (
        <svg
          class="theme-icon"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M9.37 5.51a7.4 7.4 0 009.12 9.12A7 7 0 119.37 5.51M12 3a9 9 0 108.9 7.64 5.39 5.39 0 01-9.8-3.14 5.4 5.4 0 012.26-4.4Q12.69 3 12 3"
          />
        </svg>
      ) : (
        <svg
          class="theme-icon"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 9a1 1 0 0 1 0 6 1 1 0 0 1 0-6m0-2a5 5 0 1 0 0 10 5 5 0 0 0 0-10M2 13h2a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2m18 0h2a1 1 0 0 0 0-2h-2a1 1 0 0 0 0 2M11 2v2a1 1 0 0 0 2 0V2a1 1 0 0 0-2 0m0 18v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0M5.99 4.58a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41zm12.37 12.37a1 1 0 1 0-1.41 1.41l1.06 1.06a1 1 0 1 0 1.41-1.41zm1.06-10.96a1 1 0 1 0-1.41-1.41l-1.06 1.06a1 1 0 1 0 1.41 1.41zM7.05 18.36a1 1 0 1 0-1.41-1.41l-1.06 1.06a1 1 0 1 0 1.41 1.41z"
          />
        </svg>
      )}
    </button>
  );
}

const App = {
  name: "App",
  setup() {
    const state = reactive({ loaded: false });
    const worker = new WorkerApi();

    const componentDidMount = async () => {
      const { supportInfo, version } = await worker.getMetadata();

      Object.assign(state, {
        loaded: true,
        availableOptions: supportInfo.options.map(augmentOption),
        version: fixPrettierVersion(version),
      });
    };

    const render = () => {
      const { loaded, availableOptions, version } = state;

      if (!loaded) {
        return "Loading...";
      }

      return (
        <>
          <VersionLink version={version} />
          <Playground
            worker={worker}
            availableOptions={availableOptions}
            version={version}
          />
        </>
      );
    };

    onMounted(componentDidMount);
    return render;
  },
};

function augmentOption(option) {
  if (option.type === "boolean" && option.default === true) {
    option.inverted = true;
  }

  option.cliName =
    "--" +
    (option.inverted ? "no-" : "") +
    option.name.replaceAll(/(?<=[a-z])(?=[A-Z])/gu, "-").toLowerCase();

  return option;
}

const linksContainer = document.querySelector(".links");
if (linksContainer) {
  const themeToggleContainer = document.createElement("div");
  linksContainer.appendChild(themeToggleContainer);
  const themeToggleRoot = createApp(ThemeToggle);
  themeToggleRoot.mount(themeToggleContainer);
}

const container = document.getElementById("root");
const root = createApp(App);
root.mount(container);
