import {isEmbedFrontMatter, isFrontMatter} from "./is-front-matter.js";

function clean(original, cloned) {
  if (
    isFrontMatter(original) &&
    isEmbedFrontMatter(original)
  ) {
    delete cloned.end;
    delete cloned.raw;
    delete cloned.value;
  }
}

export default clean;
