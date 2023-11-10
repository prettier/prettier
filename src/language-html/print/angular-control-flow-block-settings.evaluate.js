const DEFAULT_ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS = {
  isFollowingBlock: false,
  followingBlocks: new Set(),
};

const ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS = new Map(
  [
    ["if", { isFollowingBlock: false, followingBlocks: ["else if", "else"] }],
    [
      "else if",
      { isFollowingBlock: true, followingBlocks: ["else if", "else"] },
    ],
    ["else", { isFollowingBlock: true, followingBlocks: [] }],

    ["switch", { isFollowingBlock: false, followingBlocks: [] }],
    ["case", { isFollowingBlock: false, followingBlocks: [] }],
    ["default", { isFollowingBlock: false, followingBlocks: [] }],

    ["for", { isFollowingBlock: false, followingBlocks: ["empty"] }],
    ["empty", { isFollowingBlock: true, followingBlocks: [] }],

    [
      "defer",
      {
        isFollowingBlock: false,
        followingBlocks: ["placeholder", "error", "loading"],
      },
    ],
    [
      "placeholder",
      {
        isFollowingBlock: true,
        followingBlocks: ["placeholder", "error", "loading"],
      },
    ],
    [
      "error",
      {
        isFollowingBlock: true,
        followingBlocks: ["placeholder", "error", "loading"],
      },
    ],
    [
      "loading",
      {
        isFollowingBlock: true,
        followingBlocks: ["placeholder", "error", "loading"],
      },
    ],
  ].map(([name, settings]) => [
    name,
    {
      DEFAULT_ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS,
      ...settings,
      followingBlocks: settings.followingBlocks
        ? new Set(settings.followingBlocks)
        : DEFAULT_ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS.followingBlocks,
    },
  ]),
);

export default {
  DEFAULT_ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS,
  ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS,
};
