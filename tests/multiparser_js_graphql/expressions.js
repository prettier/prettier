// We currently don't support expressions in GraphQL template literals so these templates
// should not change.

graphql(schema, `
query allPartsByManufacturerName($name: String!) {
  allParts(filter:{manufacturer: {name: $name}}) {
...    PartAll
}}
${fragments.all}
`)

const veryLongVariableNameToMakeTheLineBreak = graphql(schema, `
query allPartsByManufacturerName($name: String!) {
  allParts(filter:{manufacturer: {name: $name}}) {
...    PartAll
}}
${fragments.all}
`)
