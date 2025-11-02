import { AppUser } from "./user.model";

export interface ScheduledVisit {
  id: string | number;
  customerId: string;
  customerName: string;
  scheduledDate: Date;
  status: VisitStatus;
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
  estado: string;
}

