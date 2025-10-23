import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser } from '../../../shared/models/user.model';
import { ApiClientService } from '../../../core/services/api-client.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
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
}
