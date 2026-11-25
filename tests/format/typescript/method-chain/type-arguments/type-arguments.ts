fooBar.get(t).set<{ scope: TypeA; methodName: TypeB; endpointDefaults: TypeC; decorations: TypeD }>(l);

const model = types
  .model({ something: mxSomething })
  .volatile<{
    loading: boolean;
    savingStatus: "idle" | "saving" | "saved" | "error";
    undoDisabled: boolean;
    online: boolean;
  }>((self) => [
    loading,
    false,
    savingStatus,
    "idle",
    undoDisabled,
    false,
    aiFocused,
    false,
    online,
    true,
  ]);
