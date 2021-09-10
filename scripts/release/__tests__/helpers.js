import merge from "lodash.merge";

export function getInjectedValues() {
  return globalThis.INJECTED_VALUES;
}

export function updateInjectedValues(newValues) {
  const currentValues = { ...globalThis.INJECTED_VALUES };
  globalThis.INJECTED_VALUES = merge(currentValues, newValues);
}

export function initializeInjectedValues() {
  const initialInjectedValues = {
    execa: {
      stdout: "",
      stderr: "",
    },
  };
  updateInjectedValues(initialInjectedValues);
}
