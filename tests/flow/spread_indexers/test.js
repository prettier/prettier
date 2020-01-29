//@flow
const a: {[string]: mixed} = {};
const b: {[string]: mixed} = {};
const c: {[string]: mixed} = {...a, ...b}; // Ok 

const d: {||} = {...null}; // {} ~> {||} errors, so spreading null 
const e: {[string]: mixed} = {};
const f: {[string]: mixed} = {...d, ...e}; // Ok
          
const g: {[string]: number} = {};
const h: {[number]: string} = {};
const i = {...g, ...h}; // Error. Keys and values of the indexers fail to unify 

const j: {} = {};
const k: {[string]: number} = {};
const l = {...j, ...k}; // Error, there may be some properties in j that are not overwritten by the indexer

const m: {|foo: number|} = {foo: 3};
const n: {[string]: string} = {foo: 'string'};
const o = {...m, ...n}; // Error, indexer may overwrite properties with explicit keys

const p: {foo: number} = {foo: 3};
const q: {[string]: string} = {foo: 'string'};
const r = {...p, ...q}; // Error, indexer may overwrite properties with explicit keys

const v: {[string]: number} = {};
const w: {[number]: string} = {};
const x: {+[string | number]: string | number} = v;
const y: {+[string | number]: string | number} = w;
const z: {[string | number]: string | number} = {...x, ...y}; // ok


const a2: {[string]: mixed} = {};
const b2: {['a' | 'b']: mixed} = {};
const c2: {[string]: mixed} = {...a2, ...b2}; // Ok 
