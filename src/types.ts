export interface MemoryReport {
  artifact_name: string;
  peak_memory: string;
}

export interface MemoryReports {
  memory_reports: MemoryReport[];
}
