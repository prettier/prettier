// Error
const beep = (data/*: Object */) => {}

// OK
const beep = (data/*: Object */, secondData/*: Object */) => {}

const beep = (data/*: /* this is an object *-/ Object */) => {};

const run = (cmd /*: string */) /*: Promise<void> */ => {}
