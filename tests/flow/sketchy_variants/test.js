//flowlint sketchy-null:error
var x: bool|mixed|number|string = null

//Four errors: one for each type
if (x){}

//No bool error
//flowlint-next-line sketchy-null-bool:off
if (x){}

//No mixed error
//flowlint-next-line sketchy-null-mixed:off
if (x){}

//No number error
//flowlint-next-line sketchy-null-number:off
if (x){}

//No string error
//flowlint-next-line sketchy-null-string:off
if (x){}

//flowlint sketchy-null:off

//Only bool error
//flowlint-next-line sketchy-null-bool:error
if (x){}

//Only mixed error
//flowlint-next-line sketchy-null-mixed:error
if (x){}

//Only number error
//flowlint-next-line sketchy-null-number:error
if (x){}

//Only string error
//flowlint-next-line sketchy-null-string:error
if (x){}
