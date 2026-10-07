import "dotenv/config";
import { execFileSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN;
const branch = "main";

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

try {
  run([
    "commit",
    "-m",
    "fix: resolve session cookie parsing so authenticated roles take effect",
    "-m",
    "readSession() expects a Cookie header but role.ts passed a bare value, so every session fell back to `public` and all role-gated writes (ingest, draft save) returned 403 even after a successful login. Serialise the cookie jar into a header before parsing. Verified live: login -> upload 201 -> signed download 302/200 with byte-exact content; anonymous download 403.",
  ]);
  console.log("committed");
} catch (error) {
  console.log("commit output:", `${error.stdout ?? ""}${error.stderr ?? ""}`.trim().split("\n")[0]);
}

const helper = `!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f`;
execFileSync("git", ["-c", `credential.helper=${helper}`, "push", "origin", branch], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_TOKEN: token },
});
console.log("pushed");
console.log(run(["log", "--oneline", "-1"]).trim());
