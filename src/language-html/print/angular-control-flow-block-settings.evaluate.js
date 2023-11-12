const ANGULAR_CONTROL_FLOW_BLOCK_DEFAULT_SETTINGS = {
  isFollowingBlock: false,
  followingBlocks: new Set(),
};

const ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS = new Map(
  [
    {
      name: "if",
      isFollowingBlock: false,
      followingBlocks: ["else if", "else"],
    },
    {
      name: "else if",
      isFollowingBlock: true,
      followingBlocks: ["else if", "else"],
    },
    { name: "else", isFollowingBlock: true, followingBlocks: [] },

    { name: "switch", isFollowingBlock: false, followingBlocks: [] },
    { name: "case", isFollowingBlock: false, followingBlocks: [] },
    { name: "default", isFollowingBlock: false, followingBlocks: [] },

    { name: "for", isFollowingBlock: false, followingBlocks: ["empty"] },
    { name: "empty", isFollowingBlock: true, followingBlocks: [] },

    {
      name: "defer",
      isFollowingBlock: false,
      followingBlocks: ["placeholder", "error", "loading"],
    },

    {
      name: "placeholder",
      isFollowingBlock: true,
      followingBlocks: ["placeholder", "error", "loading"],
    },

    {
      name: "error",
      isFollowingBlock: true,
      followingBlocks: ["placeholder", "error", "loading"],
    },

    {
      name: "loading",
      isFollowingBlock: true,
      followingBlocks: ["placeholder", "error", "loading"],
    },
  ].map((settings) => [
    settings.name,
    {
      ANGULAR_CONTROL_FLOW_BLOCK_DEFAULT_SETTINGS,
      ...settings,
      followingBlocks: settings.followingBlocks
        ? new Set(settings.followingBlocks)
        : ANGULAR_CONTROL_FLOW_BLOCK_DEFAULT_SETTINGS.followingBlocks,
    },
  ]),
);

export {
  ANGULAR_CONTROL_FLOW_BLOCK_DEFAULT_SETTINGS,
  ANGULAR_CONTROL_FLOW_BLOCK_SETTINGS,
};
