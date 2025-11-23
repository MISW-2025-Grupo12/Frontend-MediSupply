export interface LoadFileStatus {
  jobId: string;
  status: string;
  progress: Progress;
  createdAt: string;
  updatedAt: string;
  resultUrl: string;
}

export interface Progress {
  totalLines: number;
  processedLines: number;
  successfulLines: number;
  errorLines: number;
  rejectedLines: number;
  percentage: number;
}