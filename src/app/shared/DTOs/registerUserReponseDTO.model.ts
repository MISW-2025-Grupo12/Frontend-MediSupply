import { AppUserDTO } from "./addAppUserDTO.model";

interface RegisterUserReponseDTO {
  mensaje: string;
}

export interface RegisterSellerResponseDTO extends RegisterUserReponseDTO {
  vendedor: AppUserDTO;
}

export interface RegisterCustomerResponseDTO extends RegisterUserReponseDTO {
  cliente: AppUserDTO;
}

export interface RegisterProviderResponseDTO extends RegisterUserReponseDTO {
  proveedor: AppUserDTO;
}

export interface RegisterAdminResponseDTO extends RegisterUserReponseDTO {
  administrador: AppUserDTO;
}

export interface RegisterDeliveryResponseDTO extends RegisterUserReponseDTO {
  repartidor: AppUserDTO;
}
