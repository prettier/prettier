// expression as declare
css`
         a {
${exp};
      }
`;

// expression as declare(many)
css`
         a {
${exp};
${exp};
      }
`;
// expression as declare(no breaks)
css`
         a {
${exp}${exp};
     }
`;

css`
         a {
${exp};${exp};
      }
`;
// expression as declare part
css`
         a {
@foo${exp}bar;
--foo${exp}bar;
_foo${exp}bar;
FOO${exp}bar;
foo1${exp}bar;
     }
`;
// expression as declare(middle)
css`
         a {
foo${exp}bar;
      }
`;
// expression as declare(beginning)
css`
         a {
${exp}bar;
      }
`;
// expression as declare(end)
css`
         a {
foo${exp};
      }
`;

// semi test

// should not insert semi
css`
         a {
${exp}}
`;
// should keep semi
css`
         b {${exp} ;
}
`;
// should not insert semi
css`
         c {
${exp}${exp}                }
`;
// should keep one semi
css`
         d {${exp} ${exp} ;}
`;
// should keep 2 semi
css`
         e {${exp}               ;
${exp};}
`;

// comment test

// inline-comment(before)
css`
         a {
// comment
          ${exp}
}
`;

// block-comment(before)
css`
         a {
/*comment*/
          ${exp}
}
`;

// inside-comment(before)
css`
         a {
/*comment${a}
*/
          ${exp}
}
`;

// inline-comment(after)
css`
         a {
          ${exp}
        // comment
}
`;

// block-comment(after)
css`
         a {
          ${exp}
        /*comment
*/
}
`;

// inside-comment(after)
css`
         a {
          ${exp}
        /*comment${b}
*/
}
`;

// inline-comment(both)
css`
         a {
// comment
          ${exp}
        // comment
}
`;

// block-comment(both)
css`
         a {
/*comment
*/
          ${exp}
        /*comment
*/
}
`;

// inside-comment(both)
css`
         a {
/*comment${a}
*/
          ${exp}
        /*comment${b}
*/
}
`;

// should not crush
css`${a}${b}${c}${d}${e}${f}
// comment
${g}//comment
${h}/*comment*/;
         ${i};${j}${k}${l}${m}${n}${o}${p}${q}${r}${s}${t}${u}${v}${w}${x}${y}
// comment
${z}`