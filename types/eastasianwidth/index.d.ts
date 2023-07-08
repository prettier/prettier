declare module "eastasianwidth" {
  const eastAsianWidth: {
    eastAsianWidth: (str: string) => "F" | "H" | "W" | "Na" | "A" | "N";
  };
  export default eastAsianWidth;
}
