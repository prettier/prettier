css`
/* prettier-ignore */
this{line:should;be:${ugly}}
`

css`
this{line:should;be:${pretty}}

/* prettier-ignore */
this{line:should;be:${ugly}}

this{line:should;be:${pretty}}
`

// css don't support inline comment of `prettier-ignore`
css`
this{line:should;be:${pretty}} // prettier-ignore
`
css`
this{line:should;be:${pretty}}

this{line:should;be:${pretty}} // prettier-ignore
`