import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

function validDay(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value + "T00:00:00Z")) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
}

/** Read metadata from the real TypeScript registry without executing links or credentials. */
export function readOfferWindows(source) {
  const file = ts.createSourceFile("offers.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declarations = file.statements.filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations]);
  const registry = declarations.find((declaration) => declaration.name.getText(file) === "affiliateOffers");
  if (!registry || !registry.initializer || !ts.isArrayLiteralExpression(registry.initializer)) {
    throw new Error("Expected literal affiliateOffers array in src/features/commerce/offers.ts");
  }
  function property(object, key) {
    const item = object.properties.find((node) =>
      ts.isPropertyAssignment(node) && node.name.getText(file).replace(/^['"]|['"]$/g, "") === key);
    if (!item || !ts.isPropertyAssignment(item)) throw new Error("Missing offer field: " + key);
    if (item.initializer.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (item.initializer.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isStringLiteral(item.initializer)) return item.initializer.text;
    throw new Error("Expected literal value for offer field: " + key);
  }
  return registry.initializer.elements.map((item) => {
    if (!ts.isObjectLiteralExpression(item)) throw new Error("Expected a literal offer object");
    const id = property(item, "id");
    const verifiedOn = property(item, "verifiedOn");
    const reviewBy = property(item, "reviewBy");
    const approved = property(item, "approved");
    if (typeof id !== "string" || !id.trim() || typeof approved !== "boolean" ||
        !validDay(verifiedOn) || !validDay(reviewBy) || verifiedOn > reviewBy) {
      throw new Error("Invalid review metadata for offer " + String(id));
    }
    return { id, verifiedOn, reviewBy, approved };
  });
}

/** Pure report: expiry creates a review task, never automatic approval or a CI failure. */
export function reviewStatus(records, asOf, warningDays = 14) {
  if (!validDay(asOf)) throw new Error("asOf must be an actual ISO calendar date");
  if (!Number.isInteger(warningDays) || warningDays < 0 || warningDays > 365) {
    throw new Error("warningDays must be an integer from 0 to 365");
  }
  const ids = new Set();
  return records.map(({ id, verifiedOn, reviewBy, approved }) => {
    if (ids.has(id)) throw new Error("Duplicate offer id: " + id);
    ids.add(id);
    if (!validDay(verifiedOn) || !validDay(reviewBy) || verifiedOn > reviewBy) {
      throw new Error("Invalid review metadata for offer " + id);
    }
    const daysLeft = Math.round((Date.parse(reviewBy + "T00:00:00Z") -
      Date.parse(asOf + "T00:00:00Z")) / 86400000);
    const status = !approved ? "unapproved" : verifiedOn > asOf ? "not-yet-verified" :
      daysLeft < 0 ? "expired" : daysLeft <= warningDays ? "due-soon" : "current";
    return { id, status, reviewBy, daysLeft };
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const option = process.argv.indexOf("--as-of");
    const asOf = option >= 0 ? process.argv[option + 1] : new Date().toISOString().slice(0, 10);
    const registry = new URL("../src/features/commerce/offers.ts", import.meta.url);
    const rows = reviewStatus(readOfferWindows(readFileSync(registry, "utf8")), asOf);
    process.stdout.write("Affiliate offer review check (" + asOf + ", warning window 14 days)\n");
    for (const row of rows) {
      process.stdout.write(row.id + ": " + row.status + "; reviewBy=" +
        row.reviewBy + "; daysLeft=" + row.daysLeft + "\n");
    }
    process.stdout.write("No approval is renewed and no build is blocked.\n");
  } catch (error) {
    process.stderr.write("Affiliate review metadata audit failed: " + error.message + "\n");
    process.exitCode = 1;
  }
}
