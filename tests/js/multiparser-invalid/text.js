foo`\u{prettier}\u{0065}`;
html`\u{prettier}\u{0065}`;
graphql`\u{prettier}\u{0065}`;
markdown`\u{prettier}\u{0065}`;
css`\u{prettier}\u{0065}`;
foo = /* HTML */`\u{prettier}\u{0065}`;
foo = /* GraphQL */`\u{prettier}\u{0065}`;

foo`\u{prettier}${foo}pr\u{0065}ttier`;
html`\u{prettier}${foo}pr\u{0065}ttier`;
graphql`\u{prettier}${foo}pr\u{0065}ttier`;
markdown`\u{prettier}${foo}pr\u{0065}ttier`;
css`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* HTML */`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* GraphQL */`\u{prettier}${foo}pr\u{0065}ttier`;

foo`\u{0065}${foo}pr\u{0065}ttier`;
html`\u{0065}${foo}pr\u{0065}ttier`;
graphql`\u{0065}${foo}pr\u{0065}ttier`;
markdown`\u{0065}${foo}pr\u{0065}ttier`;
css`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* HTML */`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* GraphQL */`\u{prettier}${foo}pr\u{0065}ttier`;
