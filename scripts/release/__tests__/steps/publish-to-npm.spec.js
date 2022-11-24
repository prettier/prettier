import { getReleaseUrl } from "../../steps/show-instructions-after-npm-publish.js";

describe("publish-to-npm", () => {
  describe("getReleaseUrl", () => {
    it("returns URL for patch releasing", () => {
      const result = getReleaseUrl("2.3.1", "2.3.0");
      expect(result).toBe(
        "https://github.com/prettier/prettier/releases/new?tag=2.3.1&title=2.3.1&body=%F0%9F%94%97%20%5BChangelog%5D(https%3A%2F%2Fgithub.com%2Fprettier%2Fprettier%2Fblob%2Fmain%2FCHANGELOG.md%23231)"
      );
    });

    it("returns URL for minor releasing", () => {
      const result = getReleaseUrl("2.4.0", "2.3.0");
      expect(result).toBe(
        "https://github.com/prettier/prettier/releases/new?tag=2.4.0&title=2.4.0&body=%5Bdiff%5D(https%3A%2F%2Fgithub.com%2Fprettier%2Fprettier%2Fcompare%2F2.3.0...2.4.0)%0A%0A%F0%9F%94%97%20%5BRelease%20note%5D(https%3A%2F%2Fprettier.io%2Fblog%2F2021%2F09%2F01%2F2.4.0.html)"
      );
    });

    it("returns URL for major releasing", () => {
      const result = getReleaseUrl("2.3.0", "2.2.0");
      expect(result).toBe(
        "https://github.com/prettier/prettier/releases/new?tag=2.3.0&title=2.3.0&body=%5Bdiff%5D(https%3A%2F%2Fgithub.com%2Fprettier%2Fprettier%2Fcompare%2F2.2.0...2.3.0)%0A%0A%F0%9F%94%97%20%5BRelease%20note%5D(https%3A%2F%2Fprettier.io%2Fblog%2F2021%2F09%2F01%2F2.3.0.html)"
      );
    });
  });
});
