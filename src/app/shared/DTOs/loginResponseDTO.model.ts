import { AppUserDTO } from "./addAppUserDTO.model";

export interface LoginResponseDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_info: Partial<AppUserDTO>;
}