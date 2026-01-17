<!--

1. Choose a folder based on which language your PR is for.

   - For JavaScript, choose `javascript/` etc.
   - For TypeScript specific syntax, choose `typescript/`.
   - If your PR applies to multiple languages, such as TypeScript/Flow, choose one folder and mention which languages it applies to.

2. In your chosen folder, create a file with your PR number: `XXXX.md`. For example: `typescript/6728.md`.

3. Copy the content below and paste it in your new file.

4. Fill in a title, the PR number and your user name.

5. Optionally write a description. Many times it’s enough with just sample code.

6. Change ```jsx to your language. For example, ```yaml.

7. Change the `// Input` and `// Prettier` comments to the comment syntax of your language. For example, `# Input`.

8. Choose some nice input example code. Paste it along with the output before and after your PR.

-->

#### Title (#XXXX by @user)

<!-- Optional description if it makes sense. -->

<!-- prettier-ignore -->
```jsx
// Input
(foo ?? baz) || baz;

// Prettier stable
foo ?? baz || baz;

// Prettier main
(foo ?? baz) || baz;
```
