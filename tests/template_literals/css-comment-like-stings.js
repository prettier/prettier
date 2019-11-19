// double quoted '//'
css`
[href*="//"]{${a}}
`

// single quoted '//'
css`
[href*='//']{${a}}
`

// escaped quotes
css`
[href*='//\'']{${a}}
`

// in url()
css`
a {background: url(//example.com);${a};}
`

// prettier-ignore like comment
css`
a {content: "// prettier-ignore";${a};}
`

// prettier-ignore like comment
css`
a{content: "/* prettier-ignore */";${a}}
`

// actual URL
css`
[href="https://example.com"]{${a}}
`

// quoted '/**/'
css`
         a{
content: "/* ";
content: " */";
${a}
}
`