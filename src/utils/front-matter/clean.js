import { isEmbedFrontMatter } from "./embed.js";

function clean(original, cloned) {
  if (!isEmbedFrontMatter(original)) {
    return;
  }

  delete cloned.end;
  delete cloned.raw;
  delete cloned.value;

  return cloned;
}

export default clean;
