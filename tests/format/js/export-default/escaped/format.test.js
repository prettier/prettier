runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // cspell:disable
      String.raw`export asyn\u{63} from "async";`,
      String.raw`export asyn\u0063 from "async";`,
      String.raw`export _asyn\u{63} from "async";`,
      // cspell:enable
    ],
  },
  ["babel", "flow", "typescript"],
  {
    errors: {
      acorn: true,
      espree: true,
      meriyah: true,
      flow: true,
      hermes: true,
      typescript: true,
      oxc: true,
      "oxc-ts": true,
      yuku: true,
      "yuku-ts": true,
    },
  },
);
runFormatTest(
  {
    importMeta: import.meta,
    snippets: [
      // cspell:disable
      String.raw`import asyn\u{63} from "async";`,
      // cspell:enable
    ],
  },
  ["babel", "flow"],
);
