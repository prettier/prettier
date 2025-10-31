const locStart = (node) => node.sourceSpan.start.offset;
const locEnd = (node) => node.sourceSpan.end.offset;

export { locEnd, locStart };
