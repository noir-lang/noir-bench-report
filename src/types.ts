export interface MemoryReport {
  artifact_name: string;
  peak_memory: string;
}

export interface MemoryReports {
  memory_reports: MemoryReport[];
}

export interface CompilationReport {
  artifact_name: string;
  time: string;
}

export interface CompilationReports {
  compilation_reports: CompilationReport[];
}
