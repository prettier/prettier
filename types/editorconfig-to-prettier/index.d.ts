declare module "editorconfig-to-prettier" {
  function editorConfigToPrettier(editorConfig: any): {
    useTabs: boolean;
    tabWidth: any;
    printWidth: any;
    singleQuote: boolean;
    endOfLine: any;
    insertFinalNewline: any;
  } | null;
  export default editorConfigToPrettier;
}
