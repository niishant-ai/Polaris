import "dotenv/config";

const token = process.env.GITHUB_TOKEN;
const repo = "niishant-ai/Polaris";

const res = await fetch(`https://api.github.com/repos/${repo}`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "polaris-deploy" },
});
console.log(`repo status=${res.status}`);
const j = await res.json();
console.log(`name=${j.full_name ?? "-"} default_branch=${j.default_branch ?? "-"} private=${j.private ?? "-"} empty=${j.size ?? "-"}KB`);
console.log(`permissions: push=${j.permissions?.push ?? "-"} admin=${j.permissions?.admin ?? "-"}`);

const me = await fetch("https://api.github.com/user", {
  headers: { Authorization: `Bearer ${token}`, "User-Agent": "polaris-deploy" },
});
const u = await me.json();
console.log(`token user=${u.login ?? "-"}`);
