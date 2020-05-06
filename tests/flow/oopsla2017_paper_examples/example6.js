// @flow

type IDString = (string) => string;
type IDNullableString = (?string) => ?string;
type Ambiguous = IDString | IDNullableString;

function onString(f: Ambiguous) { f(""); }
let id = (x) => x;
onString(id);
id(null);
