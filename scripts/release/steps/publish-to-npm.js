import enquirer from "enquirer";
import spawn from "nano-spawn";
import { waitForEnter } from "../utils.js";

export default async function publishToNpm({ dry }) {
  console.log(`Ready to publish to NPM${dry ? "(--dry-run)" : ""}`);

  await waitForEnter();

  const commonArgs = ["publish"];
  if (dry) {
    commonArgs.push("--dry-run");
  }

  const runNpmPublish = async () => {
    const args = [...commonArgs];

    if (!dry) {
      const { otp } = await enquirer.prompt({
        type: "input",
        name: "otp",
        message: "Please enter your npm OTP",
      });
      args.push("--otp", otp);
    }

    await spawn("npm", args, { cwd: "./dist/prettier" });
  };

  /**
   * Retry "npm publish" when to enter OTP is failed.
   */
  for (let i = 5; i > 0; i--) {
    try {
      return await runNpmPublish();
    } catch (error) {
      if (error.code === "EOTP" && i > 0) {
        console.log(`To enter OTP is failed, you can retry it ${i} times.`);
        continue;
      }
      throw error;
    }
  }
}
