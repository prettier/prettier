// @flow

type Key = 'A';
declare opaque type Val;

declare var key: Key;
declare var val: Val

module.exports = { [key]: val };
