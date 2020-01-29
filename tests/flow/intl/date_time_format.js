/* @flow */

const a: Intl$DateTimeFormat = Intl.DateTimeFormat() // correct
const b: Intl$DateTimeFormat = new Intl.DateTimeFormat() // correct
const c: Intl$NumberFormat = new Intl.DateTimeFormat() // incorrect
Intl.DateTimeFormat(1, {
  localeMatcher: 'look',
  timeZone: 1,
  hour12: '',
  formatMatcher: 'basic fit',
  weekday: '2-digit',
  era: '',
  year: '',
  month: '',
  day: '',
  hour: '',
  minute: 'long',
  second: 'short',
  timeZoneName: 'narrow'
}) // incorrect
Intl.DateTimeFormat('en') // correct
Intl.DateTimeFormat([ 'en', 'en-GB' ], {
  localeMatcher: 'best fit',
  timeZone: 'America/Pacific',
  hour12: true,
  formatMatcher: 'best fit',
  weekday: 'long',
  era: 'long',
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'long'
}) // correct

new DateTimeFormat().select() // incorrect

new DateTimeFormat().format() // correct
new DateTimeFormat().format(1) // correct
new DateTimeFormat().format(new Date(2018, 3, 17)) // correct

new DateTimeFormat().formatToParts();
new DateTimeFormat().formatToParts(1) // correct
new DateTimeFormat().formatToParts(new Date(2018, 3, 17)) // correct

new DateTimeFormat().resolvedOptions() // correct

DateTimeFormat.getCanonicalLocales() // incorrect

DateTimeFormat.supportedLocalesOf(1) // incorrect
DateTimeFormat.supportedLocalesOf('en') // correct
DateTimeFormat.supportedLocalesOf([ 'en' ]) // correct
