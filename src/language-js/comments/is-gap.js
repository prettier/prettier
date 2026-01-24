function isGap(text, { parser }) {
  if (parser === "flow" || parser === "hermes" || parser === "babel-flow") {
    // Example: (a /* b */ /* : c */)
    //                gap ^^^^
    text = text.replaceAll(/[\s(]/g, "");
    return text === "" || text === "/*" || text === "/*::";
  }
}

export default isGap;
