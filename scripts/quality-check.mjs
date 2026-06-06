import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const checks = [];

function file(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  return readFileSync(file(relativePath), "utf8");
}

function expect(condition, message) {
  checks.push({ passed: Boolean(condition), message });
}

const requiredFiles = [
  "app/page.tsx",
  "app/plan/page.tsx",
  "app/api/generate-plan/route.ts",
  "components/clear-day-app.tsx",
  "lib/plan-constants.ts",
  "lib/plan-schema.ts",
  "lib/plan-utils.ts",
  "lib/types.ts"
];

for (const requiredFile of requiredFiles) {
  expect(existsSync(file(requiredFile)), `${requiredFile} exists`);
}

const homePage = read("app/page.tsx");
const planPage = read("app/plan/page.tsx");
const component = read("components/clear-day-app.tsx");
const apiRoute = read("app/api/generate-plan/route.ts");
const planConstants = read("lib/plan-constants.ts");
const planUtils = read("lib/plan-utils.ts");
const packageJson = JSON.parse(read("package.json"));

expect(
  homePage.includes("ClearDayCapturePage"),
  "home route renders the capture page"
);
expect(planPage.includes("ClearDayPlanPage"), "plan route renders the plan page");
expect(
  component.includes("@/lib/plan-utils"),
  "ClearDay component imports shared plan utilities"
);
expect(!component.includes('type="date"'), "date picker stays fully English");
expect(
  planConstants.includes("clearday.plans.v1"),
  "shared constants own the localStorage key"
);
expect(
  planUtils.includes("@/lib/plan-constants"),
  "plan utilities reuse shared constants"
);
expect(
  planConstants.includes("MAX_NOTE_LENGTH"),
  "shared constants define the note limit"
);
expect(
  apiRoute.includes("MAX_NOTE_LENGTH"),
  "API route uses the shared note limit"
);
expect(apiRoute.includes("OPENAI_API_KEY"), "API route checks OPENAI_API_KEY");
expect(apiRoute.includes("OPENAI_MODEL"), "API route supports OPENAI_MODEL");
expect(apiRoute.includes("json_schema"), "API route requests structured JSON");
expect(packageJson.scripts?.lint, "package has a lint script");
expect(packageJson.scripts?.typecheck, "package has a typecheck script");
expect(packageJson.scripts?.build, "package has a build script");

const failed = checks.filter((check) => !check.passed);

if (failed.length > 0) {
  console.error("Quality check failed:");
  for (const check of failed) {
    console.error(`- ${check.message}`);
  }
  process.exit(1);
}

console.log(`Quality check passed (${checks.length} checks).`);
