// @flow

// Valid Usage
type Obj = {p: number};
declare var obj: $ReadOnly<Obj>;
obj.p = 42; // Should error!
(obj.p: number); // OK

declare var writableObj: Obj;
(writableObj: $ReadOnly<Obj>); // OK

type MultiKeyObj = {p: number, q: number};
declare var multiKeyObj: $ReadOnly<MultiKeyObj>;
multiKeyObj.p = 42; // Should error!
multiKeyObj.q = 42; // Should error!
(multiKeyObj.p: number); // OK
(multiKeyObj.q: number); // OK

type UnionObj = {key: 1, p: number} | {key: 2, p: number, q: number};
declare var unionObj: $ReadOnly<UnionObj>;
if (unionObj.key === 1) {
  unionObj.p = 42; // Should error!
  (unionObj.p: number); // OK
  (unionObj.q: number); // Should error!
} else {
  unionObj.p = 42; // Should error!
  unionObj.q = 42; // Should error!
  (unionObj.p: number); // OK
  (unionObj.q: number); // OK
}
(unionObj: {+key: 1, +p: number} | {+key: 2, +p: number, +q: number}); // OK

type SpreadUnionObj = {...UnionObj, z: number};
declare var spreadUnionObj: $ReadOnly<SpreadUnionObj>
if (spreadUnionObj.key === 1) {
  spreadUnionObj.p = 42; // Should error!
  spreadUnionObj.z = 42; // Should error!
  (spreadUnionObj.p: number); // OK
  (spreadUnionObj.z: number); // OK
  (spreadUnionObj.q: number); // Should error!
} else if (spreadUnionObj.key === 2) {
  spreadUnionObj.p = 42; // Should error!
  spreadUnionObj.q = 42; // Should error!
  spreadUnionObj.z = 42; // Should error!
  (spreadUnionObj.p: number); // OK
  (spreadUnionObj.q: number); // OK
  (spreadUnionObj.z: number); // OK
}

type IntersectionObj = Obj & MultiKeyObj;
declare var intersectionObj: $ReadOnly<IntersectionObj>;
intersectionObj.p = 42; // Should error!
intersectionObj.q = 42; // Should error!
(intersectionObj.p: number); // OK
(intersectionObj.q: number); // OK

type IndexerKeyObj = {p: number, [string]: boolean};
declare var indexerKeyObj: $ReadOnly<IndexerKeyObj>;
indexerKeyObj.p = 42; // Should error!
indexerKeyObj.x = true; // Should error!
(indexerKeyObj.p: number); // OK
(indexerKeyObj.x: boolean); // OK

type ExactObj = {|p: number|};
declare var exactObj: $ReadOnly<ExactObj>;
exactObj.p = 42; // Should error!
(exactObj.p: number); // OK

type SpreadObj = {...{p: number}};
declare var spreadObj: $ReadOnly<SpreadObj>;
spreadObj.p = 42; // Should error!
(spreadObj.p: number); // OK

type SpreadExactObj = {|...{|p: number|}|};
declare var spreadExactObj: $ReadOnly<SpreadExactObj>;
spreadExactObj.p = 42; // Should error!
(spreadExactObj.p: number); // OK

type ObjWithMethod = {p: number, fn(): boolean};
declare var objWithMethod: $ReadOnly<ObjWithMethod>;
objWithMethod.p = 42; // Should error!
objWithMethod.fn = () => true; // Should error!
(objWithMethod.p: number); // OK
(objWithMethod.fn: () => boolean); // OK

class A {
  p: number;
}
declare var instance: $ReadOnly<A>;
instance.p = 42; // Should error!
(instance.p: number); // OK

type WriteOnlyObj = {-p: 42};
declare var writeOnlyObj: $ReadOnly<WriteOnlyObj>;
writeOnlyObj.p = 42; // Should error!
(writeOnlyObj.p: number) // OK

// Invalid usage
type readOnlyNum = $ReadOnly<number>;
(42: readOnlyNum); // Should error!
