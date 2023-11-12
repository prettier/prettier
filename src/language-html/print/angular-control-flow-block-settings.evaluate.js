const ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS = new Map(
  [
    ["if", ["else if", "else"]],
    ["else if", ["else if", "else"]],
    ["else", []],

    ["switch", []],
    ["case", []],
    ["default", []],

    ["for", ["empty"]],
    ["empty", []],

    ["defer", ["placeholder", "error", "loading"]],
    ["placeholder", ["placeholder", "error", "loading"]],
    ["error", ["placeholder", "error", "loading"]],
    ["loading", ["placeholder", "error", "loading"]],
  ]
    .filter(([, followingBlockNames]) => followingBlockNames.length > 0)
    .map(([name, followingBlockNames]) => [name, new Set(followingBlockNames)]),
);

export default ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS;
