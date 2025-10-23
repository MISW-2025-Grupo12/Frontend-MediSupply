import { UserType } from "../enums/user-type";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  legalId: string | number;
  phone: string | number;
  address: string;
  password?: string;
  role: UserType;
}