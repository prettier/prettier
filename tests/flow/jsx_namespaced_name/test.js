//@flow
// We don't enforce that:
// 1. React is in scope
// 2. The properties match the config of the component
// 3. The component exists
//
// The only thing we check is that the properties don't cause errors.
<a:b />; // Ok

<a:b prop={doesNotExist} />; // Error, doesNotExist does not exist

<a:b prop={{x: 3}.y} />; // Error, y does not exist on the object

<a:b prop={'string' * 3} />; // Error, can't multiply string by number
