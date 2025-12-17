export default function VersionLink({ version }) {
  const match = version.match(/^pr-(\d+)$/u);
  let href;
  if (match) {
    href = `pull/${match[1]}`;
  } else if (/\.0$/u.test(version)) {
    href = `releases/tag/${version}`;
  } else {
    href = `blob/main/CHANGELOG.md#${version.replaceAll(".", "")}`;
  }

  const formattedVersion = match ? `PR #${match[1]}` : `v${version}`;

  document.title = `Prettier ${formattedVersion}`;

  return (
    <a
      href={`https://github.com/prettier/prettier/${href}`}
      target="_blank"
      rel="noreferrer noopener"
    >
      {formattedVersion}
    </a>
  );
}

VersionLink.props = {
  version: { type: String, required: true },
};
