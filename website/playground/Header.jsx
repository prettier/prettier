import { GitHubIcon, PrettierLogo } from "./components/Icons.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Button from "./components/ui/Button.jsx";
import VersionLink from "./components/VersionLink.jsx";

export default function Header({ version }) {
  return (
    <header class="header">
      <a href="/" class="header__logo-wrapper">
        <PrettierLogo class="header__logo" />
        <h1 class="header__title">
          Prettier Playground{" "}
          <span id="version">
            <VersionLink version={version} />
          </span>
        </h1>
      </a>

      <span class="header__links">
        <Button link icon href="https://github.com/prettier/prettier">
          <GitHubIcon />
        </Button>

        <ThemeToggle />
      </span>
    </header>
  );
}

Header.props = {
  version: { type: String, required: true },
};
