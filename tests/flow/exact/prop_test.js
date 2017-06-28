/***
 * Nonstrict prop testing and refinements on exact object types
 */

//
// property test on object type
//

type Person = { first: string, last: string };

function prop_test_exact(p: $Exact<Person>): string {
  if (p.xxx) {     // ok to test for prop existence on exact types
    return p.xxx;  // ok currently, but should be reachability error
  }
  return p.first;
}

//
// property test on union of object types
//

type Address = { city: string, state: string };

function prop_test_exact_union(pc: $Exact<Person> | $Exact<Address>): string {
  if (pc.first) {       // ok, union of exact types
    return pc.last;     // ok, refined to $Exact<Person>
  }
  return pc.state;      // error, since (pc: $Exact<Person>).first may be ""
}

//
// property test on union of object types (always truthy)
//

// direct declaration of subobjectss
type Bundle1 = { person: { first: string, last: string }, extra1: string };
type Bundle2 = { address: { city: string, state: string }, extra2: string };

function prop_test_exact_union_2(b: $Exact<Bundle1> | $Exact<Bundle2>): string {
  if (b.person) {       // ok
    return b.extra1;    // ok, refined to $Exact<Bundle1>
  }
  return b.extra2;      // ok, refined to $Exact<Bundle2>
}

// aliased declaration of subobjects
type Bundle3 = { person: Person, extra1: string };
type Bundle4 = { address: Address, extra2: string };

function prop_test_exact_union_3(b: $Exact<Bundle3> | $Exact<Bundle4>): string {
  if (b.person) {       // ok
    return b.extra1;    // ok, refined to $Exact<Bundle3>
  }
  return b.extra2;      // ok, refined to $Exact<Bundle4>
}
