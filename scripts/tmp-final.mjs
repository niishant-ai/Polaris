import "dotenv/config";
import { execFileSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN;
const run = (args, opts = {}) =>
  execFileSync("git", args, { encoding: "utf8", stdio: opts.inherit ? "inherit" : "pipe", ...opts });

run(["add", "-A"]);
const staged = run(["diff", "--cached", "--name-only"]).trim().split("\n").filter(Boolean);
console.log(`staged: ${staged.join(", ") || "(nothing)"}`);
const leaks = staged.filter((f) => /(^|\/)\.env$|\.zwork\/|node_modules\//.test(f));
if (leaks.length) {
  console.error("REFUSING sensitive paths:", leaks.join(", "));
  process.exit(1);
}

if (staged.length) {
  run(["commit", "-m", "chore: drop throwaway verification scripts from the repo"]);
  console.log("committed");
}

const helper = `!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f`;
execFileSync("git", ["-c", `credential.helper=${helper}`, "push", "origin", "main"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_TOKEN: token },
});
console.log("push done");
console.log(run(["log", "--oneline", "-3"]).trim());
console.log(`tracked files: ${run(["ls-files"]).trim().split("\n").length}`);
