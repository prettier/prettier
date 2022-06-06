import { execa } from "execa";
import enquirer from "enquirer";
import { logPromise } from "../utils.js";

/**
 * Retry "npm publish" when to enter OTP is failed.
 */
async function retryNpmPublish() {
  const runNpmPublish = async () => {
    const { otp } = await enquirer.prompt({
      type: "input",
      name: "otp",
      message: "Please enter your npm OTP",
    });
    await execa("npm", ["publish", "--otp", otp], { cwd: "./dist" });
  };
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

export default async function publishToNpm({ dry }) {
  if (dry) {
    return;
  }

  await logPromise("Publishing to npm", retryNpmPublish());
}
