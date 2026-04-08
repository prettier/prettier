import createMockable from "../utilities/create-mockable.js";

const mockable = createMockable({
  getPrettierConfigSearchStopDirectory: () => undefined,
});

export default mockable.mocked;
export { mockable };
