import { locEndWithFullText, locStart } from "../loc.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  const text = options.originalText.slice(
    locStart(node),
    locEndWithFullText(node),
  );

  return text;
}

export { printIgnored };
