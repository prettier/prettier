import { ref } from "vue";

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

const initialTheme = getInitialTheme();
export const theme = ref(initialTheme);

applyTheme(initialTheme);

export function toggleTheme() {
  const newTheme = theme.value === "dark" ? "light" : "dark";
  theme.value = newTheme;
  localStorage.setItem("theme", newTheme);

  applyTheme(newTheme);
}
