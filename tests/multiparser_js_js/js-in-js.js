function exprToFn(expr) {
  return Function(/* JS */ ` return ( ${expr} ) / 2 `);
}

const someJsCode1 = /* JS */ `    alert(   1)`;
const someJsCode2 = /* JavaScript */ `    alert(   ${1})`;
const someJsCode3 = /* JS */ `${a}( ${b} - 1 + "${c} - 1" )+(${d}).foo`;
const invalidJsStaysAsIs = /* JS */ `console . log(`;
const testEscaping = /* JS */ `var a=\`\` +'\${ 1}'`;
const nestedMess = /* JS */ `var x = /* JS */ \`var x = /* JS */ \\\`${1}\\\`;\`;`;
