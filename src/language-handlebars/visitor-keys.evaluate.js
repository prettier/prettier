import { visitorKeys } from "@glimmer/syntax";

// add front-matter to the glimmer visitor keys
export default {
  ...visitorKeys,
  FrontMatter: [],
};
