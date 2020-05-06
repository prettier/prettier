// @flow

var collection = document.children

// properties
var length: number = collection.length // valid

// methods
var el = collection.item(0)
el.className // invalid
if (el) el.className // valid

el = collection.namedItem('name')
el.className // invalid
if (el) el.className // valid

// accessing items
el = collection[0]
el.className // valid
if (el) el.className // valid

el = collection['query']
el.className // valid
if (el) el.className // valid

for (var field of collection) {
  field.className // valid
}

// covariance
declare var Anchors: HTMLCollection<HTMLAnchorElement>;
(Anchors: HTMLCollection<HTMLElement>);
