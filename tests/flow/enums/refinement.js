// @flow

/////////////
// boolean //
/////////////
enum B of boolean {
  A = true,
  B = false,
}

declare var bVoidable: void | B;

if (typeof bVoidable === "undefined") {
  (bVoidable: void); // Valid
  (bVoidable: B); // Error
}

if (typeof bVoidable !== "undefined") {
  (bVoidable: void); // Error
  (bVoidable: B); // Valid
}

if (typeof bVoidable === "boolean") {
  (bVoidable: void); // Error
  (bVoidable: B); // Valid
}

if (typeof bVoidable !== "boolean") {
  (bVoidable: void); // Valid
  (bVoidable: B); // Error
}

if (bVoidable === undefined) {
  (bVoidable: void); // Valid
  (bVoidable: B); // Error
}

if (bVoidable !== undefined) {
  (bVoidable: void); // Error
  (bVoidable: B); // Valid
}

declare var bMaybe: ?B;

if (bMaybe == null) {
  (bMaybe: null | void); // Valid
  (bMaybe: B); // Error
}

if (bMaybe != null) {
  (bMaybe: null); // Error
  (bMaybe: void); // Error
  (bMaybe: B); // Valid
}

if (bMaybe === null || bMaybe === undefined) {
  (bMaybe: null | void); // Valid
  (bMaybe: B); // Error
}

if (bMaybe !== null && bMaybe !== undefined) {
  (bMaybe: null); // Error
  (bMaybe: void); // Error
  (bMaybe: B); // Valid
}

declare var bBoolVoid: B | boolean | void;

if (typeof bBoolVoid === "boolean") {
  (bBoolVoid: void); // Error
  (bBoolVoid: boolean); // Valid
  (bBoolVoid: B); // Error
  (bBoolVoid: B | boolean); // Valid
}

if (typeof bBoolVoid !== "boolean") {
  (bBoolVoid: void); // Valid
  (bBoolVoid: boolean); // Error
  (bBoolVoid: B); // Error
  (bBoolVoid: B | boolean); // Error
}

if (bVoidable) {
  (bVoidable: void); // Error
  (bVoidable: B); // Valid
}

if (!bVoidable) {
  (bVoidable: void | B); // Valid
  (bVoidable: B); // Error
  (bVoidable: void); // Error
}

enum BEmpty {}
declare var bEmpty: BEmpty | void;

if (bEmpty) {
  (bEmpty: void); // Error
  (bEmpty: BEmpty); // Valid
}

if (!bEmpty) {
  (bEmpty: void); // Valid
  (bEmpty: BEmpty); // Error
}

enum BTrue {
  A = true,
}
declare var bTrue: BTrue | void;

if (bTrue) {
  (bTrue: void); // Error
  (bTrue: BTrue); // Valid
}

if (!bTrue) {
  (bTrue: void); // Valid
  (bTrue: BTrue); // Error
}

enum BFalse {
  A = false,
}
declare var bFalse: BFalse | true;

if (bFalse) {
  (bFalse: true); // Valid
  (bFalse: BFalse); // Error
}

if (!bFalse) {
  (bFalse: true); // Error
  (bFalse: BFalse); // Valid
}

////////////
// number //
////////////
enum N of number {
  A = 0,
  B = 1,
}

declare var nVoidable: void | N;

if (typeof nVoidable === "undefined") {
  (nVoidable: void); // Valid
  (nVoidable: N); // Error
}

if (typeof nVoidable !== "undefined") {
  (nVoidable: void); // Error
  (nVoidable: N); // Valid
}

if (typeof nVoidable === "number") {
  (nVoidable: void); // Error
  (nVoidable: N); // Valid
}

if (typeof nVoidable !== "number") {
  (nVoidable: void); // Valid
  (nVoidable: N); // Error
}

declare var nMaybe: ?N;

if (nMaybe == null) {
  (nMaybe: null | void); // Valid
  (nMaybe: N); // Error
}

if (nMaybe != null) {
  (nMaybe: null); // Error
  (nMaybe: void); // Error
  (nMaybe: N); // Valid
}

declare var nNumVoid: N | number | void;

if (typeof nNumVoid === "number") {
  (nNumVoid: void); // Error
  (nNumVoid: number); // Valid
  (nNumVoid: N); // Error
  (nNumVoid: N | number); // Valid
}

if (typeof nNumVoid !== "number") {
  (nNumVoid: void); // Valid
  (nNumVoid: number); // Error
  (nNumVoid: N); // Error
  (nNumVoid: N | number); // Error
}

if (nVoidable) {
  (nVoidable: void); // Error
  (nVoidable: N); // Valid
}

if (!nVoidable) {
  (nVoidable: void | N); // Valid
  (nVoidable: N); // Error
  (nVoidable: void); // Error
}

enum NTruthy {
  A = 1,
  B = 2,
}
declare var nTruthy: NTruthy | void;

if (nTruthy) {
  (nTruthy: void); // Error
  (nTruthy: NTruthy); // Valid
}

if (!nTruthy) {
  (nTruthy: void); // Valid
  (nTruthy: NTruthy); // Error
}

////////////
// string //
////////////
enum S of string {
  A = "",
  B = "B",
}

declare var sVoidable: void | S;

if (typeof sVoidable === "undefined") {
  (sVoidable: void); // Valid
  (sVoidable: S); // Error
}

if (typeof sVoidable !== "undefined") {
  (sVoidable: void); // Error
  (sVoidable: S); // Valid
}

if (typeof sVoidable === "string") {
  (sVoidable: void); // Error
  (sVoidable: S); // Valid
}

if (typeof sVoidable !== "string") {
  (sVoidable: void); // Valid
  (sVoidable: S); // Error
}

declare var sMaybe: ?S;

if (sMaybe == null) {
  (sMaybe: null | void); // Valid
  (sMaybe: S); // Error
}

if (sMaybe != null) {
  (sMaybe: null); // Error
  (sMaybe: void); // Error
  (sMaybe: S); // Valid
}

declare var sStrVoid: S | string | void;

if (typeof sStrVoid === "string") {
  (sStrVoid: void); // Error
  (sStrVoid: string); // Valid
  (sStrVoid: S); // Error
  (sStrVoid: S | string); // Valid
}

if (typeof sStrVoid !== "string") {
  (sStrVoid: void); // Valid
  (sStrVoid: string); // Error
  (sStrVoid: S); // Error
  (sStrVoid: S | string); // Error
}

if (sVoidable) {
  (sVoidable: void); // Error
  (sVoidable: S); // Valid
}

if (!sVoidable) {
  (sVoidable: void | S); // Valid
  (sVoidable: S); // Error
  (sVoidable: void); // Error
}

enum STruthy {
  A,
  B,
}
declare var sTruthy: STruthy | void;

if (sTruthy) {
  (sTruthy: void); // Error
  (sTruthy: STruthy); // Valid
}

if (!sTruthy) {
  (sTruthy: void); // Valid
  (sTruthy: STruthy); // Error
}

//////////////
// multiple //
//////////////
declare var bn: B | N;

if (typeof bn == "boolean") {
  (bn: B); // Valid
  (bn: N); // Error
}

if (typeof bn == "number") {
  (bn: B); // Error
  (bn: N); // Valid
}

//////////////////
// sketchy-null //
//////////////////
// flowlint sketchy-null:error

if (bMaybe) { } // Error
if (!bMaybe) { } // Error

if (nMaybe) { } // Error
if (!nMaybe) { } // Error

if (sMaybe) { } // Error
if (!sMaybe) { } // Error

if (bTrue) { } // Valid
if (!bTrue) { } // Valid

if (nTruthy) { } // Valid
if (!nTruthy) { } // Valid

if (sTruthy) { } // Valid
if (!sTruthy) { } // Valid

// flowlint sketchy-null:off
