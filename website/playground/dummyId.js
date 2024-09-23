/* cSpell:disable */
const dummyAdjectives = [
  "annular",
  "abugidic",
  "cantilevered",
  "equidistant",
  "hippopotamic",
  "octahedral",
  "particolored",
  "quadrupedal",
  "stellated",
  "transdecimal",
];

const dummyNouns = [
  "anteater",
  "dingbat",
  "dinosaur",
  "fossil",
  "kangaroo",
  "palimpsest",
  "platypus",
  "rhinoceros",
  "rhubarb",
  "romanocastor",
  "smorgasbord",
  "thingamabob",
  "weevil",
  "zamazingo",
];

const dummyFinalNouns = [
  "factory",
  "generator",
  "mutator",
  "processor",
  "provider",
  "replacer",
  "resolver",
  "service",
  "transformer",
  "wrapper",
];
// cSpell:enable

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function camelCase(string) {
  return string.replaceAll(/_(\w)/gu, (_, c) => c.toUpperCase());
}

export default function generateDummyId() {
  return camelCase(
    [dummyAdjectives, dummyNouns, dummyFinalNouns]
      .map(getRandomElement)
      .join("_"),
  );
}
