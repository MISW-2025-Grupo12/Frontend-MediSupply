export interface LoadFileStatusDTO {
  job_id: string;
  status: string;
  progreso: ProgressDTO;
  created_at: string;
  updated_at: string;
  result_url: string;
}

export interface ProgressDTO {
  total_filas: number;
  filas_procesadas: number;
  filas_exitosas: number;
  filas_error: number;
  filas_rechazadas: number;
  porcentaje: number;
}