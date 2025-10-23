export interface AppUserDTO {
  id?: string | number;
  nombre: string;
  email: string;
  identificacion: string | number;
  telefono: string | number;
  direccion?: string;
  password: string;
  tipo_usuario?: string;
}