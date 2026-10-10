import "dotenv/config";
import { execFileSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN;
const run = (args, opts = {}) =>
  execFileSync("git", args, { encoding: "utf8", stdio: opts.inherit ? "inherit" : "pipe", ...opts });

run(["add", "-A"]);
const staged = run(["diff", "--cached", "--name-only"]).trim().split("\n").filter(Boolean);
console.log(`staged (${staged.length}):`);
for (const f of staged) console.log(`  ${f}`);

const leaks = staged.filter((f) => /(^|\/)\.env$|\.zwork\/|node_modules\//.test(f));
if (leaks.length) {
  console.error("REFUSING sensitive paths:", leaks.join(", "));
  process.exit(1);
}
console.log("sensitive-path check: clean");

if (staged.length) {
  run([
    "commit",
    "-m",
    "feat: background pattern layers + resolve all lint findings",
    "-m",
    "Adds five decorative background patterns (polar graticule, ice crystal, topographic contour, dot matrix, technical hairlines) as theme-aware CSS layers painted at z-index -1 so they sit above the page background but behind all content; disabled for reduced-motion and print.",
    "-m",
    "Also clears the 9 outstanding lint problems: replaces setState-in-effect with useSyncExternalStore / derived state / mount-scoped children, and fixes the useMemo dependency in the search console.",
  ]);
  console.log("committed");
}

const helper = `!f() { echo username=x-access-token; echo password=$GITHUB_TOKEN; }; f`;
execFileSync("git", ["-c", `credential.helper=${helper}`, "push", "origin", "main"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_TOKEN: token },
});
console.log("pushed");
console.log(run(["log", "--oneline", "-3"]).trim());
console.log(`tracked files: ${run(["ls-files"]).trim().split("\n").length}`);
