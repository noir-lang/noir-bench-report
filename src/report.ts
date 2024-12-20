import _orderBy from "lodash/orderBy";

import { CompilationReport, MemoryReport } from "./types";

export const variation = (current: number, previous: number) => {
  const delta = current - previous;

  return {
    previous,
    current,
    delta,
    percentage: previous !== 0 ? (100 * delta) / previous : Infinity,
  };
};

export const memoryReports = (content: string): MemoryReport[] => {
  return JSON.parse(content).memory_reports;
};

export const compilationReports = (content: string): CompilationReport[] => {
  return JSON.parse(content).compilation_reports;
};

export const formatMemoryReport = (memReports: MemoryReport[]): string => {
  let markdown = "## Peak Memory Sample\n | Program | Peak Memory |\n | --- | --- |\n";
  for (let i = 0; i < memReports.length; i++) {
    markdown = markdown.concat(
      " | ",
      memReports[i].artifact_name,
      " | ",
      memReports[i].peak_memory,
      " |\n"
    );
  }
  return markdown;
};

export const computeMemoryDiff = (
  refReports: MemoryReport[],
  memReports: MemoryReport[],
  header: string
): string => {
  let markdown = "";
  const diff_percentage = [];
  let diff_column = false;
  if (refReports.length === memReports.length) {
    for (let i = 0; i < refReports.length; i++) {
      let diff_str = "N/A";
      if (refReports[i].artifact_name === memReports[i].artifact_name) {
        const compPeak = memReports[i].peak_memory;
        const refPeak = refReports[i].peak_memory;
        let diff = 0;
        if (compPeak[compPeak.length - 1] == refPeak[refPeak.length - 1]) {
          const compPeakValue = parseInt(compPeak.substring(0, compPeak.length - 1));
          const refPeakValue = parseInt(refPeak.substring(0, refPeak.length - 1));
          diff = Math.floor(((compPeakValue - refPeakValue) / refPeakValue) * 100);
        } else {
          diff = 100;
        }
        if (diff != 0) {
          diff_column = true;
        }
        diff_str = diff.toString() + "%";
      }
      diff_percentage.push(diff_str);
    }
  }

  if (diff_column == true) {
    markdown = `## ${header}\n | Program | Peak Memory | % |\n | --- | --- | --- |\n`;
    for (let i = 0; i < memReports.length; i++) {
      markdown = markdown.concat(
        " | ",
        memReports[i].artifact_name,
        " | ",
        memReports[i].peak_memory,
        " | ",
        diff_percentage[i],
        " |\n"
      );
    }
  } else {
    markdown = formatMemoryReport(memReports);
  }

  return markdown;
};
