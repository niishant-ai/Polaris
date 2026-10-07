import "dotenv/config";
import { execFileSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN missing");
  process.exit(1);
}

const run = (args, opts = {}) =>
  execFileSync("git", args, { encoding: "utf8", stdio: opts.inherit ? "inherit" : "pipe", ...opts });

const branch = "main";

try {
  run(["init", "-b", branch]);
} catch {
  console.log("git already initialised");
}

run(["config", "user.email", "deploy@polaris.local"]);
run(["config", "user.name", "Polaris Deploy"]);
run(["add", "-A"]);

const staged = run(["diff", "--cached", "--name-only"]).trim().split("\n").filter(Boolean);
console.log(`staged files: ${staged.length}`);

const leaks = staged.filter(
  (f) => /(^|\/)\.env|\.zwork\/|node_modules\//.test(f),
);
if (leaks.length) {
  console.error("REFUSING to commit sensitive paths:", leaks.join(", "));
  process.exit(1);
}
console.log("sensitive-path check: clean");

const tracked = run(["ls-files"]);
const suspicious = tracked
  .split("\n")
  .filter((f) => f && /\.env(\.|$)|\.zwork|node_modules/.test(f));
if (suspicious.length) {
  console.error("REFUSING: tracked sensitive paths:", suspicious.join(", "));
  process.exit(1);
}
console.log(`tracked files: ${tracked.trim().split("\n").filter(Boolean).length}`);

const message = process.argv[2] ?? "feat: polaris knowledge repository";
try {
  run(["commit", "-m", message]);
  console.log("committed");
} catch (error) {
  const out = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  console.log("commit skipped:", out.trim().split("\n")[0] ?? "nothing to commit");
}

const remotes = run(["remote"]).trim();
if (!remotes.split("\n").includes("origin")) {
  run(["remote", "add", "origin", "https://github.com/niishant-ai/Polaris.git"]);
}

// Ephemeral credential helper: the token is read from the environment at push
// time and is never written to .git/config or the command line.
const helper = `!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f`;
execFileSync("git", ["-c", `credential.helper=${helper}`, "push", "-u", "origin", branch], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_TOKEN: token },
});
console.log("push complete");
