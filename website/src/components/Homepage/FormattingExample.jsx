import ArrowIcon from "./ArrowIcon.jsx";
import CodeWindow from "./CodeWindow.jsx";
import styles from "./FormattingExample.module.css";

const unformattedCode = `const pets = [{name:'Kitty', type:"cat"},
    {name:'Rex',type:'dog'}]

function describe (pet)
{
    return pet.name+' is a '+pet.type
}

pets.forEach(pet=>{
console.log(describe(pet)) })`;

// `unformattedCode` formatted by Prettier with the default options
const formattedCode = `const pets = [
  { name: "Kitty", type: "cat" },
  { name: "Rex", type: "dog" },
];

function describe(pet) {
  return pet.name + " is a " + pet.type;
}

pets.forEach((pet) => {
  console.log(describe(pet));
});`;

export default function FormattingExample() {
  return (
    <div className={styles.example}>
      <CodeWindow title="Input" code={unformattedCode} />
      <div className={styles.arrow} aria-hidden="true">
        <ArrowIcon />
      </div>
      <CodeWindow title="Output" code={formattedCode} formatted />
    </div>
  );
}
