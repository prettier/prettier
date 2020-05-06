/* @flow */

const a: Intl$Collator = Intl.Collator() // correct
const b: Intl$Collator = new Intl.Collator() // correct
const c: Intl$PluralRules = new Intl.Collator() // incorrect
Intl.Collator(1, {
  localeMatcher: 'look fit',
  usage: 'find',
  sensitivity: '',
  ignorePunctuation: null,
  numeric: 1,
  caseFirst: 'true'
}) // incorrect
Intl.Collator('en') // correct
Intl.Collator([ 'en', 'en-GB' ], {
  localeMatcher: 'best fit',
  usage: 'sort',
  sensitivity: 'accent',
  ignorePunctuation: false,
  numeric: true,
  caseFirst: 'false'
}) // correct

new Collator().format() // incorrect
new Collator().compare() // incorrect
new Collator().compare('a') // incorrect

new Collator().compare('a', 'b') // correct

new Collator().resolvedOptions() // correct

Collator.getCanonicalLocales() // incorrect

Collator.supportedLocalesOf(1) // incorrect
Collator.supportedLocalesOf('en') // correct
Collator.supportedLocalesOf([ 'en' ]) // correct
