/* @flow */
const a: string = Intl.getCanonicalLocales(); // incorrect
const getCanonicalLocales = Intl.getCanonicalLocales;
if (getCanonicalLocales) {
  const b: string = getCanonicalLocales(); // incorrect
  const c: string[] = getCanonicalLocales(null); // incorrect
  const d: string[] = getCanonicalLocales([ 1, 2 ]); // incorrect
  const e: string[] = getCanonicalLocales(); // correct
  const f: string[] = getCanonicalLocales('ar'); // correct
  const g: string[] = getCanonicalLocales([ 'en', 'pt-BR' ]); // correct
}

const h = Intl.Unknown; // incorrect
const i = Intl.Collator; // correct
const j = Intl.DateTimeFormat; // correct
const k = Intl.NumberFormat; // correct
const l = Intl.PluralRules; // correct
