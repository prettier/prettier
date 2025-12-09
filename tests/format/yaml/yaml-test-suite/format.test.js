import yamlTestSuite from "yaml-test-suite";

const SKIP = new Set([
  // Plain value cannot start with a tab character
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuEAzCEkB0oAIswBGAhgE4gA0IEADjAJbQDOyoZpEA7gApkIspiAG07EAniyqFSxMAGs4MAMrEAtnAAy9KHGSphTOFQiEAVnDAwA6jJrIQNUnEOkAbrqkz5ipTVnaAc2QYUgBXIxBDVXpgsIi4AA8aOFJ6dVhhAHlkmRgIUm4IJnoGaHsEABNKEESctIQYYQAVFKgyemc9AwjiqAChOABFUIh4LqFDKlMmBKVAgeHR3SR9CYiARxH4bg4aARBiJgBaHTgKs+qQ4nohQIBhCFVVYnthIWre-rgAQRgQ+kIoW2KS0OnGkxAAAsYKohFZISVnH4wHAlPwSvRXCUxPYwExJCBXOEAJJQc6wJRgVJ0b5kpQwMQDcERRxFOA2Yh2FCOZwpdzVbQuGA7YgBZ7Mqh+UguexiNTvSWpWBWegVGCQ5AADgADFQnJt6E4RWKXitulRGoQVWqNUgAExUUKGJrEQgCVYQuCqQhnc4VDTEPqhUVwABi+Wef0CryBEBAAF940A
  "DK95.yaml",
  // Insufficient indentation in flow collection
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuEBaABAbQDpWzXdAMwgkIF1cQAaECABxgEtoBnZUAQwCduIB3AAo8E7FJwA2-TgE92tAEbdOYANZwYAZU4BbOABkmUOMiKTWcWhAUArOGBgB1ZfWQh63OBe4A3E4uU1DU16FSMAc2QYbgBXSxALHSYo2Pi4AA96OG4mPVhJAHks5RgIbkEIViZmaDcEABMaEAzi3IQYSQAVbKgeJi9Tc3iqqHCJOABFGIh4QYkLWhtWdM0I8amZkyQzefiAR2n4QT56MRBOVlRjOHqbpujOJgkIgGEIHR1ON0kJJpGxuAAQRg0SYChiR2yhmMcwWIAAFjAdBJHPDql5QmA4JpRNUmD5qjI3GBWPIQD44gBJKC3WCaMA5RiAmmaGAycaw+IeSpwZycVwoDxebJ+JpGbwwY6ccKfTm0ULcbxuGS6X7ynKwRxMeoweHIAAcAAZaJ4DkxPFKZV9tkNaB0FFqdXqkAAmWgxCydTgKMQ7OFwHQKG63er6TijGLSuAAMTKnxBEW+EIgIAAvqmgA
  "Y79Y-3.yaml",
]);

// https://github.com/prettier/prettier/issues/18302
const BUGS = new Set([
  "DE56-3.yaml",
  "DE56-4.yaml",
  "JEF9-2.yaml",
  "JEF9-3.yaml",
]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: yamlTestSuite.flatMap(({ name, id, cases }) =>
      cases
        .map((testCase, index) => {
          if (testCase.fail) {
            return;
          }

          const filename = `${id}${index === 0 ? "" : `-${index + 1}`}.yaml`;

          if (SKIP.has(filename) || BUGS.has(filename)) {
            // console.log(testCase);
            return;
          }

          return {
            name: filename + " - " + name,
            filename,
            code: testCase.yaml,
          };
        })
        .filter(Boolean),
    ),
  },
  ["yaml"],
);
