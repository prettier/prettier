const model = types
  .model({ something: mxSomething })
  .volatile<[boolean |
"idle" | "saving" | "saved" | "error"
 ]>(self => ({
    loading: false,
    savingStatus: "idle",
    undoDisabled: false,
    aiFocused: false,
    online: true,
  }));
