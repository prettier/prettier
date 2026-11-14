import type { StoryObj } from "@storybook/angular";

export const Default = {
  render(args) {
    return {
      props: args,
      template: `<div>@if(ready){<span>{{name}}</span>}</div>`,
    };
  },
} satisfies StoryObj;
