import { inject, Injectable, signal, computed } from '@angular/core';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AppUser } from '../../../shared/models/user.model';
import { map, Observable, tap } from 'rxjs';
import { AppUserDTO } from '../../../shared/DTOs/addAppUserDTO.model';
import { UserType } from '../../../shared/enums/user-type';
import { LoginResponseDTO } from '../../../shared/DTOs/loginResponseDTO.model';
import { RegisterAdminResponseDTO, RegisterCustomerResponseDTO, RegisterDeliveryResponseDTO, RegisterProviderResponseDTO, RegisterSellerResponseDTO } from '../../../shared/DTOs/registerUserReponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiClient = inject(ApiClientService);

  private baseUrl = '/auth';

  // User state management using signals
  private currentUser = signal<AppUser | null>(null);
  private accessToken = signal<string | null>(null);

  // Public readonly signals for components to access
  readonly user = this.currentUser.asReadonly();
  readonly token = this.accessToken.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role || null);

  /**
   * Login a user and store user info and token
   */
  login(email: string, password: string): Observable<AppUser> {
    return this.apiClient.post<LoginResponseDTO>(`${this.baseUrl}/login`, { email, password }, 'users')
      .pipe(
        tap(response => {
          // Store the access token
          this.accessToken.set(response.access_token);

          // Transform and store user info
          const user: AppUser = {
            id: response.user_info.id?.toString() || '',
            name: response.user_info.nombre || '',
            email: response.user_info.email || '',
            legalId: response.user_info.identificacion || '',
            phone: response.user_info.telefono || '',
            address: response.user_info.direccion || '',
            role: this.mapUserRoleFromDTO(response.user_info)
          };

          this.setCurrentUser(user);
        }),
        map(response => {
          const user: AppUser = {
            id: response.user_info.id?.toString() || '',
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
        tap(response => {
          // Extract user data from the nested response structure
          const userFromResponse = this.extractUserFromResponse(response, userData.role);
          
          // Set the created user as current user
          const createdUser: AppUser = {
            id: userFromResponse.id?.toString() || '',
            name: userFromResponse.nombre,
            email: userFromResponse.email,
            legalId: userFromResponse.identificacion,
            phone: userFromResponse.telefono,
            address: userFromResponse.direccion || '',
            role: userData.role,
          };
          this.setCurrentUser(createdUser);
        }),
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
   * Set the current user (useful for setting user after registration or login)
   */
  setCurrentUser(user: AppUser): void {
    this.currentUser.set(user);
  }

  /**
   * Get the current user
   */
  getCurrentUser(): AppUser | null {
    return this.currentUser();
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken();
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserType): boolean {
    return this.userRole() === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserType[]): boolean {
    const currentRole = this.userRole();
    return currentRole !== null && roles.includes(currentRole);
  }

  /**
   * Map user role from DTO response
   */
  private mapUserRoleFromDTO(userInfo: Partial<AppUserDTO>): UserType {
    const tipoUsuario = userInfo.tipo_usuario;

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
