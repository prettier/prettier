import { execa } from "execa";
import enquirer from "enquirer";

export default async function publishToNpm({ dry }) {
  const args = ["publish"];
  if (dry) {
    args.push("--dry-run");
  }

  const runNpmPublish = async () => {
    const { otp } = await enquirer.prompt({
      type: "input",
      name: "otp",
      message: "Please enter your npm OTP",
    });
    await execa("npm", [...args, "--otp", otp], { cwd: "./dist" });
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
