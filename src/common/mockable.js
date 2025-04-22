import createMockable from "../utils/create-mockable.js";

const { mocked, mockable } = createMockable({
  getPrettierConfigSearchStopDirectory: () => undefined,
});

export default mocked;
export { mockable };
