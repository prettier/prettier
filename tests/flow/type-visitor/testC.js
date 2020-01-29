//@flow
declare function test<T>(): ((T => T) => any);

export default test(); // missing annotation error since T appears contravariantly.
