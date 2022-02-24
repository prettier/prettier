import { jest } from "@jest/globals";

jest.unstable_mockModule("../get-formatted-date", () => ({
  default: () => ({
    year: "2021",
    month: "09",
    day: "01",
  }),
}));
