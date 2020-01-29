// @flow

type MapKeyValue<Spec> =
  (<Key, Value: {}>(
    Key,
    Value,
  ) => PickKeysFromObject<$ElementType<Spec, Key>, Value>) &
    (<Key>(Key) => $ElementType<Spec, Key>);
      
export type PickKeysFromObject<Spec, KeyMap> = $ObjMapi<
  KeyMap,
  MapKeyValue<Spec>,
>;
          
type MySpec = {|
  x: number,
|};
        
(function() {
  const keys = {x: null, q: null};
  // $FlowExpectedError: `q` is missing in `MySpec`
  type A = PickKeysFromObject<MySpec, typeof keys>;
  declare var _a: {|x: number|};
  // $FlowExpectedError: `q` is missing in object type
  const _b: A = _a;
})();      
      
