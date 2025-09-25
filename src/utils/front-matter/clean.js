import { isEmbedFrontMatter } from "./is-front-matter.js";

function clean(original, cloned) {
  if (isEmbedFrontMatter(original)) {
    delete cloned.end;
    delete cloned.raw;
    delete cloned.value;
  }
}

export default clean;
