import { CompilationReport } from "./types";

export const compilationReports = (content: string): CompilationReport[] => {
  return JSON.parse(content).compilation_reports;
};

export const formatCompilationReport = (compilationReports: CompilationReport[]): string => {
  let markdown = "## Compilation Sample\n | Program | Compilation Time |\n | --- | --- |\n";
  for (let i = 0; i < compilationReports.length; i++) {
    markdown = markdown.concat(
      " | ",
      compilationReports[i].artifact_name,
      " | ",
      compilationReports[i].time,
      " |\n"
    );
  }
  return markdown;
};

export const computeCompilationDiff = (
  refReports: CompilationReport[],
  compilationReports: CompilationReport[]
): string => {
  let markdown = "";
  const diff_percentage = [];
  let diff_column = false;
  if (refReports.length === compilationReports.length) {
    for (let i = 0; i < refReports.length; i++) {
      let diff_str = "N/A";
      let minSeconds = 0;
      if (refReports[i].artifact_name === compilationReports[i].artifact_name) {
        const compTimeString = compilationReports[i].time;
        const refTimeString = refReports[i].time;
        const compTimeSegments = compTimeString.split("m");
        const refTimeSegments = refTimeString.split("m");

        const minutesString = compTimeSegments[0];
        const refMinutesString = refTimeSegments[0];

        const compMinutesValue = parseInt(minutesString);
        const refMinutesValue = parseInt(refMinutesString);

        const secondsString = compTimeSegments[1];
        const compSecondsValue = parseFloat(secondsString.substring(0, secondsString.length - 1));
        const compSeconds = compMinutesValue * 60 + compSecondsValue;

        const refSecondsString = refTimeSegments[1];
        const refSecondsValue = parseFloat(
          refSecondsString.substring(0, refSecondsString.length - 1)
        );
        const refSeconds = refMinutesValue * 60 + refSecondsValue;
        minSeconds = Math.min(refSeconds, compSeconds);

        const diff = Math.floor(((compSeconds - refSeconds) / refSeconds) * 100);
        if (diff != 0) {
          diff_column = true;
        }
        diff_str = diff.toString() + "%";
      }

      // Reports under one seconds can often vary in their diff percentage by quite a bit more (e.g. .2 ms to .25 ms),
      // which can make it more difficult to interpret the output
      if (minSeconds > 1) {
        diff_percentage.push({ report_index: i, diff_str: diff_str });
      }
    }
  }

  if (diff_column == true) {
    markdown = "## Compilation Sample\n | Program | Compilation Time | % |\n | --- | --- | --- |\n";
    for (let i = 0; i < diff_percentage.length; i++) {
      const diffRow = diff_percentage[i];
      const reportIndex = diffRow.report_index;
      markdown = markdown.concat(
        " | ",
        compilationReports[reportIndex].artifact_name,
        " | ",
        compilationReports[reportIndex].time,
        " | ",
        diffRow.diff_str,
        " |\n"
      );
    }
  } else {
    markdown = formatCompilationReport(compilationReports);
  }

  return markdown;
};
