import { useActiveDocContext } from "@docusaurus/plugin-content-docs/client";
import IconExternalLink from "@theme/Icon/ExternalLink";

export default function PlaygroundLink({ mobile }) {
  const activeDocContext = useActiveDocContext("default");
  const activeVersion = activeDocContext?.activeVersion?.name;

  const className = mobile ? "menu__link" : "navbar__item navbar__link";

  return (
    <a
      className={className}
      href={
        activeVersion === "current"
          ? "/playground/?version=next"
          : "/playground"
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      Playground
      <IconExternalLink />
    </a>
  );
}
