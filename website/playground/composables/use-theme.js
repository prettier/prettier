import { ref } from "vue";

const getInitialTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved) {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (value = getInitialTheme()) => {
  document.documentElement.dataset.theme = value;
  theme.value = value;
};

const toggleTheme = () => {
  const value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("theme", value);
  applyTheme(value);
};

const theme = ref(undefined);
applyTheme();

function useTheme() {
  return { theme, toggleTheme };
}

export { useTheme };
