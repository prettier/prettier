import { useActiveVersion } from "@docusaurus/plugin-content-docs/client";
import IconExternalLink from "@theme/Icon/ExternalLink";

const url =
  process.env.NODE_ENV === "production"
    ? "/playground/"
    : "http://localhost:5173/";

export default function PlaygroundLink({ mobile }) {
  const activeVersion = useActiveVersion();

  const className = mobile ? "menu__link" : "navbar__item navbar__link";

  return (
    <a
      className={className}
      href={activeVersion.name === "current" ? `${url}?version=next` : url}
      target="_self"
      rel="noopener noreferrer"
    >
      Playground
      <IconExternalLink />
    </a>
  );
}
