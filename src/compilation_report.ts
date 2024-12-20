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
      if (refReports[i].artifact_name === compilationReports[i].artifact_name) {
        const compTimeString = compilationReports[i].time;
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
    markdown = "## Compilation Sample\n | Program | Compilation Time | % |\n | --- | --- | --- |\n";
    for (let i = 0; i < diff_percentage.length; i++) {
      markdown = markdown.concat(
        " | ",
        compilationReports[i].artifact_name,
        " | ",
        compilationReports[i].time,
        " | ",
        diff_percentage[i],
        " |\n"
      );
    }
  } else {
    markdown = formatCompilationReport(compilationReports);
  }

  return markdown;
};
