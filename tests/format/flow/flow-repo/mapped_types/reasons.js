// We make a SingeltonStringT to implement mapped types via substitution.
// Let's make sure they have good reasons for error messages.


// Make sure the substituted SingletonStringTs have good reasons
{
  type TakesFoo<T extends 'foo'> = T;

  type FooBarObj = {foo: number, bar: number};
  type MappedFooBarObj = {[key in keyof FooBarObj]: TakesFoo<key>}; // ERROR

  ({foo: 'foo', bar: 'bar'} as MappedFooBarObj);
}
