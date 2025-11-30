/**
@template {{ [key: string]: any }} T
@template {keyof T} K
@param {T} implementations
@returns {{
  mocked: T,
  implementations: T,
  mockImplementation(functionality: K, implementation: T[K]): void,
  mockImplementations(overrideImplementations: T): void,
  mockRestore(): void,
}}
*/
function createMockable(implementations) {
  const mocked = { ...implementations };
  const mockImplementation = (functionality, implementation) => {
    if (!Object.hasOwn(implementations, functionality)) {
      throw new Error(`Unexpected mock '${functionality}'.`);
    }
    // @ts-expect-error -- ??
    mocked[functionality] = implementation;
  };
  const mockImplementations = (overrideImplementations) => {
    for (const [functionality, implementation] of Object.entries(
      overrideImplementations,
    )) {
      mockImplementation(functionality, implementation);
    }
  };
  const mockRestore = () => {
    Object.assign(mocked, implementations);
  };

  return {
    mocked,
    implementations,
    mockImplementation,
    mockImplementations,
    mockRestore,
  };
}

export default createMockable;
