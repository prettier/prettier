// @flow

function fn1<T: {p: any}>(a: T, b: T => void): $PropertyType<T, 'p'> {
  b(a);
  return a.p;
}

function fn2<T: {p: any}>(a: T, b: T => void): ($PropertyType<T, 'p'>) => void {
  return p => {
    a.p = p;
    return b(a);
  };
}

// These function calls are errors because in the second argument we have an
// empty object type, but $PropertyType expects that all bounds of T have a p
// property. Looking at these calls, erroring because we could not evaluate
// $PropertyType is overrestrictive. However, it is consistent with the
// implementation of type destructors.
//
// As we show in the following examples, there are some cases where we do need
// our type destructor to be restrictive. However, in this case we are
// over-restrictive.
fn1({p: 42}, (x: {}) => {});
fn2({p: 42}, (x: {}) => {})('foo');

function fn3<T: {p: any}>(a: T => void): ($Rest<T, {|p: number|}>) => void {
  return x => a({...x, p: 42});
}

// In this case, we have a clear error that we want to catch. foo is passed a
// number, but we expect a string.
fn3((x: {foo: string, p: number}) => {})({foo: 42});

// We error here because $Rest requires us to specify a p property in our object
// type. But if we look at the implementation of fn3 this is a fine program
// to accept.
fn3((x: {foo: number}) => {})({foo: 42});

function fn4<T: {|p: any|}>(a: T => void): ($PropertyType<T, 'p'>) => void {
  // We error here because the implementation of {p: empty} ~> empty currently
  // errors, but it would be a sound subtyping rule to allow.
  return p => a({p});
}

// Here is an error we need to catch.
fn4((x: {p: string}) => {})(42);

// However, we are overly restrictive and error here. This would be an OK
// program to accept.
fn4((x: {}) => {})(42);
