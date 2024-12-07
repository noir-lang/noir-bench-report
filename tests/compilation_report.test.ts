import * as fs from "fs";

import { computeCompilationDiff, formatCompilationReport } from "../src/compilation_report";
import { compilationReports } from "../src/report";

const srcContent = fs.readFileSync("tests/mocks/1-1-compilation-report.json", "utf8");
const ref_1_Content = fs.readFileSync("tests/mocks/1-1-compilation-report.json", "utf8");
const ref_2_Content = fs.readFileSync("tests/mocks/1-2-compilation-report.json", "utf8");

const compReports = compilationReports(srcContent);

describe("Markdown format", () => {
  it("should generate markdown format", () => {
    expect(compReports.length).toBeGreaterThan(0);
    const markdown = formatCompilationReport(compReports);
    expect(markdown.length).toBeGreaterThan(0);
  });

  it("should generate diff report format", () => {
    const ref_1_Reports = compilationReports(ref_1_Content);
    const ref_2_Reports = compilationReports(ref_2_Content);
    expect(ref_1_Reports.length).toBeGreaterThan(0);
    expect(ref_1_Reports.length).toBe(ref_2_Reports.length);
    const markdown = computeCompilationDiff(ref_1_Reports, ref_2_Reports);
    fs.writeFileSync("tests/mocks/1-2-compilation.md", markdown);
    expect(markdown.length).toBeGreaterThan(0);
  });
});
