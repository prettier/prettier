import { useActiveDocContext } from "@docusaurus/plugin-content-docs/client";
import IconExternalLink from "@theme/Icon/ExternalLink";

const url =
  process.env.NODE_ENV === "production"
    ? "/playground/"
    : "http://localhost:5173/";

export default function PlaygroundLink({ mobile }) {
  const activeDocContext = useActiveDocContext("default");
  const activeVersion = activeDocContext?.activeVersion?.name;

  const className = mobile ? "menu__link" : "navbar__item navbar__link";

  return (
    <a
      className={className}
      href={activeVersion === "current" ? `${url}?version=next` : url}
      target="_self"
      rel="noopener noreferrer"
    >
      Playground
      <IconExternalLink />
    </a>
  );
}
