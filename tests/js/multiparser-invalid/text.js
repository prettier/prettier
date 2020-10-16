foo = foo`\u{prettier}\u{0065}`;
foo = html`\u{prettier}\u{0065}`;
foo = graphql`\u{prettier}\u{0065}`;
foo = markdown`\u{prettier}\u{0065}`;
foo = css`\u{prettier}\u{0065}`;
foo = /* HTML */`\u{prettier}\u{0065}`;
foo = /* GraphQL */`\u{prettier}\u{0065}`;

foo = foo`\u{prettier}${foo}pr\u{0065}ttier`;
foo = html`\u{prettier}${foo}pr\u{0065}ttier`;
foo = graphql`\u{prettier}${foo}pr\u{0065}ttier`;
foo = markdown`\u{prettier}${foo}pr\u{0065}ttier`;
foo = css`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* HTML */`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* GraphQL */`\u{prettier}${foo}pr\u{0065}ttier`;

foo = foo`\u{0065}${foo}pr\u{0065}ttier`;
foo = html`\u{0065}${foo}pr\u{0065}ttier`;
foo = graphql`\u{0065}${foo}pr\u{0065}ttier`;
foo = markdown`\u{0065}${foo}pr\u{0065}ttier`;
foo = css`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* HTML */`\u{prettier}${foo}pr\u{0065}ttier`;
foo = /* GraphQL */`\u{prettier}${foo}pr\u{0065}ttier`;
