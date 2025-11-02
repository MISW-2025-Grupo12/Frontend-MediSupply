import { Component, OnInit, inject } from '@angular/core';
import { ApiClientService } from '../../services/api-client.service';

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
    this.apiClient.get<string | { version?: string }>('/version', 'auth')
      .subscribe({
        next: (response) => {
          // Handle both string and object responses
          if (typeof response === 'string') {
            this.version = response;
          } else if (response && typeof response === 'object' && 'version' in response) {
            this.version = response.version || '';
          } else {
            this.version = '';
          }
        },
        error: (error) => {
          console.error('Error fetching version:', error);
          this.version = 'N/A';
        }
      });
  }
}
