import { AppUser } from "./user.model";

export interface ScheduledVisit {
  id: string | number;
  customerId: string;
  customerName: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: VisitStatus;
  notes?: string;
}

export enum VisitStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface ScheduledVisitDTO {
  id: string | number;
  cliente_id: string;
  nombre_cliente: string;
  fecha_visita: string;
  hora_visita: string;
  estado: string;
  notas?: string;
}

