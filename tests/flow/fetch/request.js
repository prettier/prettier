/* @flow */
const a: Request = new Request(); // incorrect
const b: Request = new Request('http://example.org'); // correct
const c: Request = new Request(b); // correct
const d: Request = new Request(c.clone()); // correct (doesn't make much sense though)
const e: Request = new Request(b, c); // incorrect

const f: Request = new Request({}) // incorrect
const g: Request = new Request('http://example.org', {}) // correct

const h: Request = new Request('http://example.org', {
  method: 'GET',
  headers: {
    'Content-Type': 'image/jpeg'
  },
  mode: 'cors',
  cache: 'default'
}) // correct

const i: Request = new Request('http://example.org', {
  method: 'POST',
  headers: {
    'Content-Type': 'image/jpeg'
  },
  body: new URLSearchParams("key=value"),
  mode: 'cors',
  cache: 'default'
}) // correct

const j: Request = new Request('http://example.org', {
  method: 'GET',
  headers: 'Content-Type: image/jpeg',
  mode: 'cors',
  cache: 'default'
}) // incorrect - headers is string

const k: Request = new Request('http://example.org', {
  method: 'CONNECT',
  headers: {
    'Content-Type': 'image/jpeg'
  },
  mode: 'cors',
  cache: 'default'
}) // incorrect - CONNECT is forbidden

var l: boolean = h.bodyUsed;

h.text().then((t: string) => t); // correct
h.text().then((t: Buffer) => t); // incorrect
h.arrayBuffer().then((ab: ArrayBuffer) => ab); // correct
h.arrayBuffer().then((ab: Buffer) => ab); // incorrect
