import React from "react";
import ReactDOM from "react-dom";

const root = document.getElementById("version");

export default function({ version }) {
  const match = version.match(/^pr-(\d+)$/);
  let href;
  if (match) {
    href = `pull/${match[1]}`;
  } else if (version.match(/\.0$/)) {
    href = `releases/tag/${version}`;
  } else {
    href = `blob/master/CHANGELOG.md#${version.replace(/\./g, "")}`;
  }
  return ReactDOM.createPortal(
    <a
      href={`https://github.com/prettier/prettier/${href}`}
      target="_blank"
      rel="noopener"
    >
      {match ? `PR #${match[1]}` : `v${version}`}
    </a>,
    root
  );
}
