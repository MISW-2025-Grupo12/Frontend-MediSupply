import { inject, Injectable } from '@angular/core';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AppStore } from '../../../core/state/app.store';
import { AppUser } from '../../../shared/models/user.model';
import { map, Observable, tap } from 'rxjs';
import { AppUserDTO } from '../../../shared/DTOs/appUserDTO.model';
import { UserType } from '../../../shared/enums/user-type';
import { LoginResponseDTO } from '../../../shared/DTOs/loginResponseDTO.model';
import { RegisterAdminResponseDTO, RegisterCustomerResponseDTO, RegisterDeliveryResponseDTO, RegisterProviderResponseDTO, RegisterSellerResponseDTO } from '../../../shared/DTOs/registerUserReponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiClient = inject(ApiClientService);
  private appStore = inject(AppStore);
  private baseUrl = '/auth';
  /**
   * Login a user and store user info and token
   */
  login(email: string, password: string): Observable<AppUser> {
    return this.apiClient.post<LoginResponseDTO>(`/login`, { email, password }, 'auth')
      .pipe(
        tap(response => {
          // Transform user info
          const user: AppUser = {
            id: response.user_info.entidad_id?.toString() || '',
            name: response.user_info.nombre || '',
            email: response.user_info.email || '',
            legalId: response.user_info.identificacion || '',
            phone: response.user_info.telefono || '',
            address: response.user_info.direccion || '',
            role: this.mapUserRoleFromDTO(response.user_info)
          };

          // Store user and token in AppStore
          this.appStore.setUserAndToken(user, response.access_token);
        }),
        map(response => {
          const user: AppUser = {
            id: response.user_info.entidad_id?.toString() || '',
            name: response.user_info.nombre || '',
            email: response.user_info.email || '',
            legalId: response.user_info.identificacion || '',
            phone: response.user_info.telefono || '',
            address: response.user_info.direccion || '',
            role: this.mapUserRoleFromDTO(response.user_info)
          };
          return user;
        })
      );
  }

  /**
   * Create a new user
   */
  createUser(userData: AppUser): Observable<AppUser> {
    if (!userData.password) {
      throw new Error('Password is required');
    }

    const dto: AppUserDTO = {
      nombre: userData.name,
      email: userData.email,
      identificacion: userData.legalId,
      telefono: userData.phone,
      direccion: userData.address,
      password: userData.password,
      tipo_usuario: this.getUserPathByUserType(userData.role)
    }

    const userPath = this.getUserPathByUserType(userData.role);
    return this.apiClient.post<
      RegisterSellerResponseDTO |
      RegisterCustomerResponseDTO |
      RegisterProviderResponseDTO |
      RegisterAdminResponseDTO |
      RegisterDeliveryResponseDTO>(`${this.baseUrl}/registro-${userPath}`, dto, 'users')
      .pipe(
        map(response => {
          // Extract user data from the nested response structure
          const userFromResponse = this.extractUserFromResponse(response, userData.role);
          
          return {
            id: userFromResponse.id?.toString() || '',
            name: userFromResponse.nombre,
            email: userFromResponse.email,
            legalId: userFromResponse.identificacion,
            phone: userFromResponse.telefono,
            address: userFromResponse.direccion || '',
            role: userData.role,
          };
        })
      );
  }

  /**
   * Get the current user from AppStore
   */
  getCurrentUser(): AppUser | null {
    return this.appStore.user();
  }

  /**
   * Get the current access token from AppStore
   */
  getAccessToken(): string | null {
    return this.appStore.accessToken();
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.appStore.clearUserSession();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserType): boolean {
    const currentUser = this.appStore.user();
    return currentUser?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserType[]): boolean {
    const currentUser = this.appStore.user();
    return currentUser !== null && roles.includes(currentUser.role);
  }

  /**
   * Map user role from DTO response
   */
  private mapUserRoleFromDTO(userInfo: Partial<AppUserDTO>): UserType {
    const tipoUsuario = userInfo.tipo_usuario?.toLowerCase();

    switch (tipoUsuario) {
      case 'administrador':
        return UserType.ADMIN;
      case 'vendedor':
        return UserType.SELLER;
      case 'cliente':
        return UserType.CUSTOMER;
      case 'repartidor':
        return UserType.DELIVERY;
      case 'proveedor':
        return UserType.PROVIDER;
      default:
        // Default to CUSTOMER if tipo_usuario is not recognized
        return UserType.CUSTOMER;
    }
  }

  getUserPathByUserType(userType: UserType): string {
    switch (userType) {
      case UserType.ADMIN:
        return 'administrador';
      case UserType.SELLER:
        return 'vendedor';
      case UserType.CUSTOMER:
        return 'cliente';
      case UserType.DELIVERY:
        return 'repartidor';
      case UserType.PROVIDER:
        return 'proveedor';
    }
  }

  /**
   * Extract user data from the nested response structure based on user role
   */
  private extractUserFromResponse(
    response: RegisterSellerResponseDTO |
             RegisterCustomerResponseDTO |
             RegisterProviderResponseDTO |
             RegisterAdminResponseDTO |
             RegisterDeliveryResponseDTO,
    userRole: UserType
  ): AppUserDTO {
    switch (userRole) {
      case UserType.ADMIN:
        return (response as RegisterAdminResponseDTO).administrador;
      case UserType.SELLER:
        return (response as RegisterSellerResponseDTO).vendedor;
      case UserType.CUSTOMER:
        return (response as RegisterCustomerResponseDTO).cliente;
      case UserType.DELIVERY:
        return (response as RegisterDeliveryResponseDTO).repartidor;
      case UserType.PROVIDER:
        return (response as RegisterProviderResponseDTO).proveedor;
      default:
        throw new Error(`Unknown user role: ${userRole}`);
    }
  }
}
