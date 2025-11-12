import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AppUser } from '../../../shared/models/user.model';
import { ApiClientService } from '../../../core/services/api-client.service';
import { PaginatedResponseDTO } from '../../../shared/DTOs/paginatedResponseDTO.model';
import { AppUserDTO } from '../../../shared/DTOs/appUserDTO.model';
import { UserType } from '../../../shared/enums/user-type';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiClient = inject(ApiClientService);

  private readonly baseUrl = '/users';

  /**
   * Get all users
   */
  getUsers(): Observable<AppUser[]> {
    return this.apiClient.get<AppUser[]>(this.baseUrl);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<AppUser> {
    return this.apiClient.get<AppUser>(`${this.baseUrl}/${id}`);
  }

  getDeliveryUsers(): Observable<PaginatedResponseDTO<AppUser>> {
    return this.apiClient
      .get<PaginatedResponseDTO<AppUserDTO>>('/repartidores', 'users')
      .pipe(
        map(response => ({
          items: response.items.map(user => this.mapAppUserDtoToModel(user)),
          pagination: response.pagination
        }))
      );
  }

  private mapAppUserDtoToModel(user: AppUserDTO): AppUser {
    return {
      id: String(user.id ?? ''),
      name: user.nombre,
      email: user.email,
      legalId: user.identificacion ?? '',
      phone: user.telefono ?? '',
      address: user.direccion ?? '',
      role: this.mapUserType(user.tipo_usuario)
    };
  }

  private mapUserType(tipoUsuario?: string): UserType {
    if (!tipoUsuario) {
      return UserType.DELIVERY;
    }

    const normalizedType = tipoUsuario.toUpperCase();
    const userType = (UserType as Record<string, UserType>)[normalizedType];

    return userType ?? UserType.DELIVERY;
  }
}
