import { theme, toggleTheme } from "../composables/theme.js";
import { DarkIcon, LightIcon } from "./Icons.jsx";
import Button from "./ui/Button.jsx";

export default function ThemeToggle() {
  return (
    <Button
      onClick={toggleTheme}
      icon
      aria-label={`Switch to ${theme.value === "dark" ? "light" : "dark"} theme`}
    >
      {theme.value === "dark" ? <DarkIcon /> : <LightIcon />}
    </Button>
  );
}
