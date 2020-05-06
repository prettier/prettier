// @flow

type Obj1 = {
  field: {key: ?string | Array<string>},
};

type Obj2 = {
  field: {key: ?(string | Array<string>)},
};


function foo (state : Obj2) : Obj1 {
  return {field : state.field};
}
