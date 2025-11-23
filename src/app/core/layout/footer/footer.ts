import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { of } from 'rxjs';
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';
import { ApiClientService } from '../../services/api-client.service';
import { VersionDTO } from '../../../shared/DTOs/versionDTO.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  imports: [AsyncPipe]
})
export class Footer {
  private apiClient = inject(ApiClientService);
  currentYear = new Date().getFullYear();

  readonly version$ = this.apiClient
    .get<VersionDTO>('/version', 'auth')
    .pipe(
      map((response) => response.version ?? environment.version),
      catchError((error) => {
        console.error('Error fetching version:', error);
        return of(environment.version);
      }),
      startWith(environment.version),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}
