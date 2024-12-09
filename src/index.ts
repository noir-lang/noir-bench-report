import Zip from "adm-zip";
import * as fs from "fs";
import { dirname, resolve } from "path";

import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

import { computeCompilationDiff } from "./compilation_report";
import { memoryReports, computeMemoryDiff, compilationReports } from "./report";

const token = process.env.GITHUB_TOKEN || core.getInput("token");
const report = core.getInput("report");
const memory_report = core.getInput("memory_report");

const baseBranch = core.getInput("base");
const headBranch = core.getInput("head");

const baseBranchEscaped = baseBranch.replace(/[/\\]/g, "-");
const baseReport = `${baseBranchEscaped}.${report}`;

const octokit = getOctokit(token);
const artifactClient = artifact.create();
const localReportPath = resolve(report);

const { owner, repo } = context.repo;
const repository = owner + "/" + repo;

let referenceContent: string;
let compareContent: string;
let refCommitHash: string | undefined;

async function run() {
  try {
    // Upload the gates report to be used as a reference in later runs.
    await uploadArtifact();
    core.info(`Loading reports from "${localReportPath}"`);
    compareContent = fs.readFileSync(localReportPath, "utf8");
  } catch (error) {
    return core.setFailed((error as Error).message);
  }

  // cannot use artifactClient because downloads are limited to uploads in the same workflow run
  // cf. https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts#downloading-or-deleting-artifacts
  if (context.eventName === "pull_request") {
    try {
      core.startGroup(
        `Searching artifact "${baseReport}" on repository "${repository}", on branch "${baseBranch}"`
      );
      let count = 100;
      let artifactId: number | null = null;
      // Artifacts are returned in most recent first order.
      for await (const res of octokit.paginate.iterator(octokit.rest.actions.listArtifactsForRepo, {
        owner,
        repo,
      })) {
        if (count == 0) {
          break;
        }
        const artifact = res.data.find(
          (artifact) => !artifact.expired && artifact.name === baseReport
        );
        count = count - 1;
        if (!artifact) {
          await new Promise((resolve) => setTimeout(resolve, 900)); // avoid reaching the API rate limit

          continue;
        }

        artifactId = artifact.id;
        refCommitHash = artifact.workflow_run?.head_sha;
        core.info(
          `Found artifact named "${baseReport}" with ID "${artifactId}" from commit "${refCommitHash}"`
        );
        break;
      }
      core.endGroup();

      if (artifactId) {
        core.startGroup(
          `Downloading artifact "${baseReport}" of repository "${repository}" with ID "${artifactId}"`
        );
        const res = await octokit.rest.actions.downloadArtifact({
          owner,
          repo,
          artifact_id: artifactId,
          archive_format: "zip",
        });

        const zip = new Zip(Buffer.from(res.data as ArrayBuffer));
        for (const entry of zip.getEntries()) {
          core.info(`Loading reports from "${entry.entryName}"`);
          referenceContent = zip.readAsText(entry);
        }
        core.endGroup();
      } else core.error(`No workflow run found with an artifact named "${baseReport}"`);
    } catch (error) {
      return core.setFailed((error as Error).message);
    }
  }

  try {
    core.startGroup("Load reports");
    referenceContent ??= compareContent; // if no source reports were loaded, defaults to the current reports
    core.info("About to check memory reports");
    core.info(`memory report: ${memory_report}`);
    core.info(`compareContent: ${compareContent}`);
    core.info(`referenceContent: ${referenceContent}`);
    const isMemoryReport = Boolean(memory_report);
    if (isMemoryReport) {
      core.info(`Format Memory markdown rows`);
      core.info(`Got here`);
      core.info(`compareContent: ${compareContent}`);
      core.info(`referenceContent: ${referenceContent}`);
      const memoryContent = memoryReports(compareContent);
      const referenceReports = memoryReports(referenceContent);
      const markdown = computeMemoryDiff(referenceReports, memoryContent);
      core.setOutput("markdown", markdown);
    } else {
      core.info(`Format Compilation report markdown rows`);
      core.info(`Got here`);
      core.info(`compareContent: ${compareContent}`);
      core.info(`referenceContent: ${referenceContent}`);
      const compilationContent = compilationReports(compareContent);
      const referenceReports = compilationReports(referenceContent);
      const markdown = computeCompilationDiff(referenceReports, compilationContent);
      core.setOutput("markdown", markdown);
    }

    core.endGroup();
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

async function uploadArtifact() {
  const headBranchEscaped = headBranch.replace(/[/\\]/g, "-");
  const outReport = `${headBranchEscaped}.${report}`;

  core.startGroup(`Upload new report from "${localReportPath}" as artifact named "${outReport}"`);
  const uploadResponse = await artifactClient.uploadArtifact(
    outReport,
    [localReportPath],
    dirname(localReportPath),
    {
      continueOnError: false,
    }
  );

  if (uploadResponse.failedItems.length > 0) throw Error("Failed to upload gas report.");

  core.info(`Artifact ${uploadResponse.artifactName} has been successfully uploaded!`);
  core.endGroup();
}

run();
