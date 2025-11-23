import { AppUserDTO } from "./appUserDTO.model";

export interface ReportCustomerVisitDTO {
  id: string;
  fecha_programada: string;
  direccion: string;
  telefono: string;
  estado: string;
  descripcion: string;
  vendedor: Partial<AppUserDTO>;
  cliente: Partial<AppUserDTO>;
}