
// as part
css`
         a {
@foo${exp}bar;
--foo${exp}bar;
_foo${exp}bar;
FOO${exp}bar;
foo1${exp}bar;
     }
`;

css`a {foo${exp}bar;}`;
css`a {${exp}bar;}`;
css`a {foo${exp};}`;


// keep semicolon as it is
css`a {${exp};}`;
css`a {${exp}}`;

// many
css`a {
${exp}
${exp};
      }
`;
css`a {
${exp}

${exp};
      }
`;
css`a {${exp}${exp};
     }
`;
css`a {${exp} ${exp};
     }
`;
css`a {${exp} ;${exp};
     }
`;

// comments

// inline-comment
css`
         a {
// comment
          ${exp}
}
`;
css`
         a {
          ${exp}
        // comment
}
`;

// block-comment
css`
         a {
/*comment*/
          ${exp}
}
`;
css`
         a {
          ${exp}
        /*comment
*/
}
`;
css`
         a {
/*comment
*/
          ${exp}
        /*comment
*/
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
css`
         a {
          ${exp}
        /*comment${b}
*/
}
`;
css`
         a {
// comment
          ${exp}
        // comment
}
`;
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
${z}`;