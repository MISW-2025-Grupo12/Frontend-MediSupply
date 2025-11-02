import { Component, OnInit, inject } from '@angular/core';
import { ApiClientService } from '../../services/api-client.service';
import { VersionDTO } from '../../../shared/DTOs/versionDTO.model';
import { Version } from '../../../shared/models/version.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  private apiClient = inject(ApiClientService);
  version: string = '';
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.fetchVersion();
  }

  private fetchVersion(): void {
    this.apiClient.get<VersionDTO>('/version', 'auth')
      .subscribe({
        next: (response) => {
          // Map DTO to model and extract version
          const version: Version = {
            buildDate: new Date(response.build_date),
            commitHash: response.commit_hash,
            environment: response.environment,
            version: response.version
          };
          this.version = version.version;
        },
        error: (error) => {
          console.error('Error fetching version:', error);
          this.version = 'N/A';
        }
      });
  }
}
