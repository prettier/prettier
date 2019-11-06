// current logic breaks on any expression fail,
// so test one by one

// expression in tag selector(middle)
<style jsx>{`
         foo${exp}bar {}
`}</style>;
// expression in tag selector(beginning)
<style jsx>{`
         ${exp}bar {}
`}</style>;
// expression in tag selector(end)
<style jsx>{`
         foo${exp} {}
`}</style>;

// expression in id selector(middle)
<style jsx>{`
         #foo${exp}bar {}
`}</style>;
// expression in id selector(beginning)
<style jsx>{`
         #${exp}bar {}
`}</style>;
// expression in id selector(end)
<style jsx>{`
         #${exp}bar {}
`}</style>;

// expression in class selector(middle)
<style jsx>{`
         .foo${exp}bar {}
`}</style>;
// expression in class selector(beginning)
<style jsx>{`
         .${exp}bar {}
`}</style>;
// expression in class selector(end)
<style jsx>{`
         .${exp}bar {}
`}</style>;

// expression in attribute name(middle)
<style jsx>{`
         [foo${exp}bar] {}
`}</style>;
// expression in attribute name(beginning)
<style jsx>{`
         [${exp}bar] {}
`}</style>;
// expression in attribute name(end)
<style jsx>{`
         [foo${exp}] {}
`}</style>;

// expression in attribute value(middle)
<style jsx>{`
         [a^=foo${exp}bar] {}
`}</style>;
// expression in attribute value(beginning)
<style jsx>{`
         [a^=${exp}bar] {}
`}</style>;
// expression in attribute value(end)
<style jsx>{`
         [a^=foo${exp}] {}
`}</style>;

// expression in declare prop(middle)
<style jsx>{`
         a {foo${exp}bar: 1;}
`}</style>;
// expression in declare prop(beginning)
<style jsx>{`
         a {${exp}bar: 1;}
`}</style>;
// expression in declare prop(end)
<style jsx>{`
         a {foo${exp}: 1;}
`}</style>;

// expression in declare value(middle)
<style jsx>{`
         a {a: foo${exp}bar;}
`}</style>;
// expression in declare value(beginning)
<style jsx>{`
         a {a: ${exp}bar;}
`}</style>;
// expression in declare value(end)
<style jsx>{`
         a {a: foo${exp};}
`}</style>;

// expression in at-rule(middle)
<style jsx>{`
         @foo${exp}bar (min-width: 100px) {div {}}
`}</style>;
// expression in at-rule(beginning)
<style jsx>{`
         @${exp}bar (min-width: 100px) {div {}}
`}</style>;
// expression in at-rule(end)
<style jsx>{`
         @foo${exp} (min-width: 100px) {div {}}
`}</style>;

// expression in at-rule prop(middle)
<style jsx>{`
         @media (foo${exp}bar: 100px) {div {}}
`}</style>;
// expression in at-rule prop(beginning)
<style jsx>{`
         @media (${exp}bar: 100px) {div {}}
`}</style>;
// expression in at-rule prop(end)
<style jsx>{`
         @media (foo${exp}: 100px) {div {}}
`}</style>;

// expression in at-rule value(middle)
<style jsx>{`
         @media (min-width: foo${exp}bar) {div {}}
`}</style>;
// expression in at-rule value(beginning)
<style jsx>{`
         @media (min-width: ${exp}bar) {div {}}
`}</style>;
// expression in at-rule value(end)
<style jsx>{`
         @media (min-width: foo${exp}) {div {}}
`}</style>;

// expression in at-rule condition(middle)
<style jsx>{`
         @media (foo${exp}bar) {div {}}
`}</style>;
// expression in at-rule condition(beginning)
<style jsx>{`
         @media (${exp}bar) {div {}}
`}</style>;
// expression in at-rule condition(end)
<style jsx>{`
         @media (foo${exp}) {div {}}
`}</style>;

// expression as declare
<style jsx>{`
         a {
${exp};
	   }
`}</style>;

// expression as declare(many)
<style jsx>{`
         a {
${exp};
${exp};
	   }
`}</style>;
// expression as declare(no breaks)
<style jsx>{`
         a {
${exp}${exp};
     }
`}</style>;

<style jsx>{`
         a {
${exp};${exp};
	   }
`}</style>;
// expression as declare(middle)
<style jsx>{`
         a {
@$foo_foo-foo${exp}bar;
	   }
`}</style>;
// expression as declare(beginning)
<style jsx>{`
         a {
${exp}bar;
	   }
`}</style>;
// expression as declare(end)
<style jsx>{`
         a {
foo${exp};
	   }
`}</style>;


// semi test

// should not insert semi
<style jsx>{`
         a {
${exp}}
`}</style>;
// should keep semi
<style jsx>{`
         b {${exp} ;
}
`}</style>;
// should not insert semi
<style jsx>{`
         c {
${exp}${exp}                }
`}</style>;
// should keep one semi
<style jsx>{`
         d {${exp} ${exp} ;}
`}</style>;
// should keep 2 semi
<style jsx>{`
         e {${exp}               ;
${exp};}
`}</style>;

// comment test

// inline-comment(before)
<style jsx>{`
         a {
// comment
          ${exp}
}
`}</style>;

// block-comment(before)
<style jsx>{`
         a {
/*comment*/
          ${exp}
}
`}</style>;

// inside-comment(before)
<style jsx>{`
         a {
/*comment${a}
*/
          ${exp}
}
`}</style>;

// inline-comment(after)
<style jsx>{`
         a {
          ${exp}
        // comment
}
`}</style>;

// block-comment(after)
<style jsx>{`
         a {
          ${exp}
        /*comment
*/
}
`}</style>;

// inside-comment(after)
<style jsx>{`
         a {
          ${exp}
        /*comment${b}
*/
}
`}</style>;

// inline-comment(both)
<style jsx>{`
         a {
// comment
          ${exp}
        // comment
}
`}</style>;

// block-comment(both)
<style jsx>{`
         a {
/*comment
*/
          ${exp}
        /*comment
*/
}
`}</style>;

// inside-comment(both)
<style jsx>{`
         a {
/*comment${a}
*/
          ${exp}
        /*comment${b}
*/
}
`}</style>;


// real world cases

<style jsx>{`
  div {
  display: ${expr};
    color: ${expr};
    ${expr};
    ${expr};
    background: red;
  animation: ${expr} 10s ease-out;
  }
  @media (${expr}) {
   div.${expr} {
    color: red;
   }
  ${expr} {
    color: red;
  }
  }
  @media (min-width: ${expr}) {
   div.${expr} {
    color: red;
   }
  all${expr} {
    color: red;
  }
  }
         @font-face {
${expr}
}
`}</style>;

<style jsx>{`
  div {
  animation: linear ${seconds}s ease-out;
  }
`}</style>;

<style jsx>{`
  div {
  animation: 3s ease-in 1s ${foo => foo.getIterations()} reverse both paused slidein;
  }
`}</style>;

// #5886
<style jsx>{`
         .class{
flex-direction: column${long_cond && long_cond && long_cond ? "-reverse" : ""};
}
`}</style>
