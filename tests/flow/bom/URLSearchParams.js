/* @flow */

// constructor
const params: URLSearchParams = new URLSearchParams();

// get
const a: null | string = params.get('foo'); // correct
const b: string = params.get('foo'); // incorrect
