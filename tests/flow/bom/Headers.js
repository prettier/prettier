/* @flow */

// constructor
const headers: Headers = new Headers(); // correct

// get
const a: null | string = headers.get('foo'); // correct
const b: string = headers.get('foo'); // incorrect
