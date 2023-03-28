const visitorKeys = Object.fromEntries(
  Object.entries({
    root: ["children"],
    document: ["head", "body", "children"],
    documentHead: ["children"],
    documentBody: ["children"],
    directive: [],
    alias: [],
    blockLiteral: [],
    blockFolded: ["children"],
    plain: ["children"],
    quoteSingle: [],
    quoteDouble: [],
    mapping: ["children"],
    mappingItem: ["key", "value", "children"],
    mappingKey: ["content", "children"],
    mappingValue: ["content", "children"],
    sequence: ["children"],
    sequenceItem: ["content", "children"],
    flowMapping: ["children"],
    flowMappingItem: ["key", "value", "children"],
    flowSequence: ["children"],
    flowSequenceItem: ["content", "children"],
    comment: [],
    tag: [],
    anchor: [],
  }).map(([type, keys]) => [
    type,
    [
      ...keys,
      "anchor",
      "tag",
      "indicatorComment",
      "leadingComments",
      "middleComments",
      "trailingComment",
      "endComments",
    ],
  ])
);

export default visitorKeys;
