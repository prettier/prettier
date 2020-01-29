// @flow

///////////
// Valid //
///////////
{
  // Let binding
  let x = 1;
  x += 2; // Ok
  x -= 2; // Ok
  x *= 2; // Ok
  x /= 2; // Ok
  x **= 2; // Ok
  x %= 2; // Ok

  let sx = "a";
  sx += "b"; // Ok
}

{
  // Regular object
  const o: {|p: number|} = {p: 1};
  o.p += 2; // Ok
  o.p -= 2; // Ok
  o.p *= 2; // Ok
  o.p /= 2; // Ok
  o.p **= 2; // Ok
  o.p %= 2; // Ok
}

////////////
// Errors //
////////////
{
  // Const binding
  const x = 1;
  x += 2; // Error: cannot reassign constant
  x -= 2; // Error: cannot reassign constant
  x *= 2; // Error: cannot reassign constant
  x /= 2; // Error: cannot reassign constant
  x **= 2; // Error: cannot reassign constant
  x %= 2; // Error: cannot reassign constant
}

{
  // Const binding, string value
  const sx = "a";
  sx += "b"; // Error: cannot reassign constant
}

{
  // Read-only property
  const o: {|+p: number|} = {p: 1};
  o.p += 2; // Error: property is non-writable
  o.p -= 2; // Error: property is non-writable
  o.p *= 2; // Error: property is non-writable
  o.p /= 2; // Error: property is non-writable
  o.p **= 2; // Error: property is non-writable
  o.p %= 2; // Error: property is non-writable
}

{
  // Read-only property, string value
  const o: {|+p: string|} = {p: "a"};
  o.p += "b"; // Error: property is non-writable
}

{
  // Write-only property
  const o: {|-p: number|} = {p: 1};
  o.p += 2; // Error: property is non-readable
  // TODO(T56716039): If you read a write-only property after it is written, there is no error
  // o.p -= 2; // Error: property is non-readable
}
