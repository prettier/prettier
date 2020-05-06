/* @flow */

const a: Intl$NumberFormat = Intl.NumberFormat() // correct
const b: Intl$NumberFormat = new Intl.NumberFormat() // correct
const c: Intl$DateTimeFormat = new Intl.NumberFormat() // incorrect
Intl.NumberFormat(1, {
  localeMatcher: 'best',
  style: 'octal',
  currency: 123,
  currencyDisplay: 'sym',
  useGrouping: 5,
  minimumIntegerDigits: {},
  minimumFractionDigits: '',
  maximumFractionDigits: null,
  minimumSignificantDigits: '',
  maximumSignificantDigits: null
}) // incorrect
Intl.NumberFormat('en') // correct
Intl.NumberFormat([ 'en', 'en-GB' ], {
  localeMatcher: 'best fit',
  style: 'currency',
  currency: 'GBP',
  currencyDisplay: 'code',
  useGrouping: true,
  minimumIntegerDigits: 1,
  minimumFractionDigits: 0,
  maximumFractionDigits: 21,
  minimumSignificantDigits: 1,
  maximumSignificantDigits: 21
}) // correct

new NumberFormat().select() // incorrect
new NumberFormat().format() // incorrect

new NumberFormat().format(1) // correct

new NumberFormat().resolvedOptions() // correct

NumberFormat.getCanonicalLocales() // incorrect

NumberFormat.supportedLocalesOf(1) // incorrect
NumberFormat.supportedLocalesOf('en') // correct
NumberFormat.supportedLocalesOf([ 'en' ]) // correct
