function locStart(nodeOrToken) {
  return nodeOrToken.loc.start;
}

function locEnd(nodeOrToken) {
  return nodeOrToken.loc.end;
}

export { locEnd, locStart };
