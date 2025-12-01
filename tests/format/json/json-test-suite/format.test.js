import { parsing, transform } from "json-test-suite";

const SKIP = new Set([
  // Prettier doesn't support other encodings than utf8
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuEAdVBXADDrBtdbXdVNTXLQX--CKSyicBdEAGhAgAcYBLaAZ2SgAhgCcREAO4AFUQgEohAGwlCAngLYAjEULABrODADKQgLZwAMtyhxkAMyV84bCJoBWcMDADqOjshAOETgnEQA3Wy0dfUMjDl1rAHNkGBEMZxAnU24UtIy4AA8OOBFuc1glAHlinRgIESkIPm4eaACEABNWEEKasoQYJQAVEqhRbhD7RwzmqETFOABFDAh4KcUnNjc+AqMkheXV2yQHDYyARxX4KXEOeRAhPgBaGzgOt+7UoW5FJIBhCCmUxCAJKRTdWbzOAAQRgqW4mgw1xKVhs602IAAFjBTIpvJiWiF4mA4EY5C1uGEWqoAmA+BoQGF0gBJKDvWBGMClLjQtlGGCqBbojJBJpwXxCfwoIIhEoRbqdSp2VHHECKOzdayhGA3ISJYHCtjxEShALbNpG0qwbzcDowTHIAAcWDYwUu3GCuv1IJO0zYg00NrtDqQACY2BgnEMhJp5KcMXBTJo3u8OhYhHMMHq4AAxerAuFJUFIiAgAC+ZaAA
  "i_string_utf16BE_no_BOM.json",
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuEBtAOugrgBjzzdETXfQX-+T8DNjsqBdS-EAGhAgAcYBLaAZ2SgAhgCcREAO4AFUQgEohAGwlCAngLYAjEULABrODADKQgLZwAMtyhxkAMyV84bCJoBWcMDADqOjshAOETgnEQA3Wy0dfUMjDl1rAHNkGBEsZxAnU24UtIy4AA8OOBFuc1glAHlinRgIESkIPm4eaACEABNWEEKasoQYJQAVEqhRbhD7RwzmqETFOABFLAh4KcUnNjc+AqMkheXV2yQHDYyARxX4KXEOeRAhPgBaGzgOt+7UoW5FJIBhCCmUxCAJKRTdWbzOAAQRgqW4miw1xKVhs602IAAFjBTIpvJiWiF4mA4EY5C1uGEWqoAmA+BoQGF0gBJKDvWBGMClLjQtlGGCqBbojJBJpwXxCfwoIIhEoRbqdSp2VHHECKOzdayhGA3ISJYHCtjxEShALbNpG0qwbzcDowTHIAAcODYwUu3GCuv1IJO0zYg00NrtDqQACY2FgnEMhJp5KcMXBTJo3u8OhYhHMsHq4AAxerAuFJUFIiAgAC+ZaAA
  "i_string_utf16LE_no_BOM.json",
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuEhf-9QbQDpYK4AZD8csQcCjVyjicy8aBdaokAGhAgAcYBLaAM7JQAQwBOYiAHcACuIRCUIgDZSRATyEcARmJFgA1nBgBlEQFs4AGV5Q4yAGYqBcDhG0ArOGBgB1PVzIIFxicC5iAG72OnqGxiZc+rYA5sgwYriuIC7mvGkZWXAAHlxwYryWsCoA8qV6MBBiMhACvHzQQQgAJuwgxXUVCDAqACplUOK8YY7OWa1QycpwAIq4EPAzyi4cHgJFJilLq+v2SE5bWQCOa-AyklyKICICALR2cF0fvekivMopAGEIOZzCIgiplL15os4ABBGDpXjaXC3Mo2OybbYgAAWMHMyl82LaYUSYDgJgUbV4ETa6iCYAEWhAEUyAEkoJ9YCYwOUeLCOSYYOolpisiEWnB-CJAigQmEylFet1qg50acQMoHL1bOEYHcRMlQaKOIkxOEgrsOibyrBfLwujBscgABz4Diha68UL6w1gs6zDjDbR2h1OpAAJg4uBcIxE2kU5yxcHM2g+ny6VhEC1wBrgADFGqCESlwSiICAAL4VoA
  "i_string_UTF-16LE_with_BOM.json",

  // RangeError: Maximum call stack size exceeded
  // https://prettier.io/playground/#N4Igxg9gdgLgprEAuEBtdHNez3f8GFHEmlnkWVXU2130ONPMuYC6HnX3Pvf-AwUOEjRY8RMlTpM2XPkLFS5StVcQAGhAQADjACW0AM7JQAQwBOFiAHcACpYQmUZgDY2zATxNaARhbMwAGs4GABlMwBbOAAZfSg4ZAAzNyM4LQhfACs4MBgAdQCdZBAdCzg0iwA3RL8A4NCwnUD4gHNkGAsAV3SQNMj9Du7euAAPHTgLfWjYNwB5CYCYCAs7CCN9A2gShAATTRAxxemEGDcAFUmoS30K5NTejahW1zgARS6IeHvXNK0soyjMJtV4fL6JJApX69ACOn3gdmsOmcIDMRgAtAk4LtsQdOmZ9K42gBhCCRSJmEpuVwHJ4vOAAQRgnX0vi6CMmcQSPz+IAAFjBIq58nzNhVmmA4GEnJt9FVNp4SmAjD4QFUegBJKA42BhMBTPQM7VhGCeV483pldZwQpmYooMoVSY1A57OZJLkQkCuJIHeKVGCIsytCkWrTNCyVEoA7bhqawfL6XYwPnIAAcAAYtOU4fpykGQ5TIQ8tGdfInk6mkAAmLRdNLnMy+ZxQ3lwSK+bE43YxMzPLrBuAAMRWFOZbSp7IgIAAvjOgA
  "i_structure_500_nested_arrays.json",
]);

const BUGS = new Set([
  "i_number_neg_int_huge_exp.json",
  "i_number_real_neg_overflow.json",
]);

const cases = [...parsing, ...transform]
  .map(({ name, input, error }) => {
    if (error) {
      return;
    }

    if (SKIP.has(name) || BUGS.has(name)) {
      return;
    }

    return {
      name,
      code: input,
    };
  })
  .filter(Boolean);

for (const parser of ["json", "jsonc", "json5", "json-stringify"]) {
  runFormatTest(
    {
      importMeta: import.meta,
      snippets: cases,
    },
    [parser],
  );
}
