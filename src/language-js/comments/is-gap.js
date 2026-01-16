function isGap(text, { parser }) {
  if (parser === "flow" || parser === "hermes") {
    // Example: (a /* b */ /* : c */)
    //                gap ^^^^
    text = text.replaceAll(/[\s(]/gu, "");
    return text === "" || text === "/*" || text === "/*::";
  }
}

export default isGap;
