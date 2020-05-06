//@flow
const a: {||} = {...3};
const b: {||} = {...(3: 3)};
const c: {||} = {...''};
const d: {||} = {...('': '')};
const e: {||} = {...false};
const f: {||} = {...(false: false)};
const g: {||} = {...null};
const h: {||} = {...(null: null)};
const i: {||} = {...undefined};
const j: {||} = {...(undefined: void)};

declare function showBlue(): boolean;
const styles = {...(showBlue() && {backgroundColor: 'blue'}), color: 'red'};
