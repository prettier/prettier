/* @flow */

const a = Intl.PluralRules(); // incorrect
const PluralRules = Intl.PluralRules
if (PluralRules) {
  const b = PluralRules(); // incorrect
  const c = new PluralRules(); // correct
  new PluralRules(1); // incorrect
  new PluralRules('en'); // correct
  new PluralRules([ 'en', 'pt' ]); // correct
  new PluralRules('en', {
    localeMatcher: 'best one',
    type: 'count',
    minimumIntegerDigits: '',
    minimumFractionDigits: a,
    maximumFractionDigits: b,
    minimumSignificantDigits: c,
    maximumSignificantDigits: ''
  }); // all kinds of incorrect
  new PluralRules('en', {
    localeMatcher: 'lookup',
    type: 'ordinal',
    minimumIntegerDigits: 2,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    minimumSignificantDigits: 4,
    maximumSignificantDigits: 6
  }); // correct

  new PluralRules().format() // incorrect
  new PluralRules().select() // incorrect

  new PluralRules().select(1) // correct

  new PluralRules().resolvedOptions() // correct

  PluralRules.getCanonicalLocales() // incorrect

  PluralRules.supportedLocalesOf(1) // incorrect
  PluralRules.supportedLocalesOf('en') // correct
  PluralRules.supportedLocalesOf([ 'en' ]) // correct
}
