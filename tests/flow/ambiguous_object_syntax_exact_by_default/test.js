//@flow
const x: {} = {}; // Error + lint
const y: {...} = {}; // Ok
const z: {||} = {}; // Error
