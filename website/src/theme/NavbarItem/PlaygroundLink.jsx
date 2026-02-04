import IconExternalLink from "@theme/Icon/ExternalLink";

export default function PlaygroundLink({ mobile, ...props }) {
  const className = mobile ? "menu__link" : "navbar__item navbar__link";

  return (
    <a
      className={className}
      href="/playground"
      target="_blank"
      rel="noopener noreferrer"
    >
      Playground
      <IconExternalLink />
    </a>
  );
}
