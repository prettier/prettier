function locStart(nodeOrToken) {
  return nodeOrToken.kind === "Comment"
    ? nodeOrToken.start
    : nodeOrToken.loc.start;
}

function locEnd(nodeOrToken) {
  return nodeOrToken.kind === "Comment" ? nodeOrToken.end : nodeOrToken.loc.end;
}

export { locEnd, locStart };
