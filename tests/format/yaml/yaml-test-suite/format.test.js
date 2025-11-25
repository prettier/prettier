import yamlTestSuite from "yaml-test-suite";

const FIXTURE_EXTENSION = ".yaml";
const SKIP = new Set([
  // duplicate empty keys are invalid
  // https://github.com/eemeli/yaml/blob/92821f2b8164f9831ff5a51f6e5a575e06365742/tests/yaml-test-suite.ts#L20
  //  Map keys must be unique; "null" is repeated
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuZACAhgHSk1AjbEAGhAgAcYBLaAZ2VHQCdGIB3ABSYTpXQBtW6AJ50SeRujABrODADK6ALZwAMpShxkAM3404JCHgBWcMDADqEsshBlGcPYwBumsROmy5ZSeoDmyGEYAV30QPUVKAODQuAAPMjhGSmVYfgB5BIkYCEZ2CBpKKmgbBAATYhA4zOSEGH4AFUSoJkoHbV1QgqhfPjgARSCIeHa+PRIjGli5P16Boc0kHVHQgEdB+HYWMh4QdBoAWg04UuOKwPRKPj8AYQhFRXQbfj4Krp64AEEYQMo8II3EmoNCMxiAABYwRR8cxgwoObxgOBybiFShOQpCGxgGiiEBOEIASSgJ1gcjASQoH2JchgQl6INCdnycEs6GsKDsDkSLgq6kcME26F8DwZJG8jEcNiESheYqSsHMlFKMDByAAHAAGEj2NaUeyC4WPRYdEh1PCK5WqpAAJhIQT09XQeB4S1BcEUeGOJ1KKnQ3SCQrgADEcg9vn4nv8ICAAL4xoA
  "2JQS.yaml",
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
  "L24T-2.yaml",
]);

runFormatTest(
  {
    importMeta: import.meta,
    snippets: yamlTestSuite.flatMap(({ name, filename, cases }) =>
      cases
        .map((testCase, index) => {
          if (testCase.fail) {
            return;
          }

          const filenameToDisplay =
            index === 0
              ? filename
              : filename.slice(0, -FIXTURE_EXTENSION.length) +
                `-${index + 1}` +
                FIXTURE_EXTENSION;

          if (SKIP.has(filenameToDisplay) || BUGS.has(filenameToDisplay)) {
            // console.log(testCase);
            return;
          }

          return {
            name:
              filenameToDisplay +
              " - " +
              name +
              (index === 0 ? "" : `(${index + 1})`),
            filename: filenameToDisplay,
            code: testCase.yaml,
          };
        })
        .filter(Boolean),
    ),
  },
  ["yaml"],
);
