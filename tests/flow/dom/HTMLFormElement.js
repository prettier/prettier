// @flow

var form = document.createElement('form')

// properties
var acceptCharset: string = form.acceptCharset // valid
var action: string = form.action // valid
var encoding: string = form.encoding // valid
var enctype: string = form.enctype // valid
var length: number = form.length // valid
var method: string = form.method // valid
var name: string = form.name // valid
var target: string = form.target // valid

// methods
var valid: boolean = form.checkValidity() // valid
valid = form.reportValidity() // valid
form.reset() // valid
form.submit() // valid

// accessing items
var el = form[0]
el.className // invalid
if (el) el.className // valid

el = form['query']
el.className // invalid
if (el) el.className // valid

for (var field of form) {
  field.className // valid
}

for (var field of form.elements) {
  field.className // valid
}
