const locStart = (node) => node.loc.start.offset;
const locEnd = (node) => node.loc.end.offset;

export { locEnd, locStart };
