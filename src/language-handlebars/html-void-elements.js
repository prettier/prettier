import { getVoidTags } from "@glimmer/syntax";

const htmlVoidElements = new Set(getVoidTags());

export default htmlVoidElements;
