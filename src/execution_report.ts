import { ExecutionReport } from "./types";

export const executionReports = (content: string): ExecutionReport[] => {
  return JSON.parse(content).execution_reports;
};

export const formatExecutionReport = (
  executionReports: ExecutionReport[],
  header: string
): string => {
  let markdown = `## ${header}\n | Program | Execution Time |\n | --- | --- |\n`;
  for (let i = 0; i < executionReports.length; i++) {
    markdown = markdown.concat(
      " | ",
      executionReports[i].artifact_name,
      " | ",
      executionReports[i].time,
      " |\n"
    );
  }
  return markdown;
};

export const computeExecutionDiff = (
  refReports: ExecutionReport[],
  executionReports: ExecutionReport[],
  header: string
): string => {
  let markdown = "";
  const diff_percentage = [];
  let diff_column = false;
  if (refReports.length === executionReports.length) {
    for (let i = 0; i < refReports.length; i++) {
      let diff_str = "N/A";
      if (refReports[i].artifact_name === executionReports[i].artifact_name) {
        const compTimeString = executionReports[i].time;
        const refTimeString = refReports[i].time;

        const compSeconds = parseFloat(compTimeString.substring(0, compTimeString.length - 1));
        const refSeconds = parseFloat(refTimeString.substring(0, refTimeString.length - 1));

        const diff = Math.floor(((compSeconds - refSeconds) / refSeconds) * 100);
        if (diff != 0) {
          diff_column = true;
        }
        diff_str = diff.toString() + "%";
      }

      diff_percentage.push(diff_str);
    }
  }

  if (diff_column == true) {
    markdown = `## ${header}\n | Program | Execution Time | % |\n | --- | --- | --- |\n`;
    for (let i = 0; i < diff_percentage.length; i++) {
      markdown = markdown.concat(
        " | ",
        executionReports[i].artifact_name,
        " | ",
        executionReports[i].time,
        " | ",
        diff_percentage[i],
        " |\n"
      );
    }
  } else {
    markdown = formatExecutionReport(executionReports, header);
  }

  return markdown;
};
