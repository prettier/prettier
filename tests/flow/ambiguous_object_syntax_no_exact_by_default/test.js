//@flow
const x: {} = {}; // lint
const y: {...} = {}; // Ok
const z: {||} = {}; // Error
