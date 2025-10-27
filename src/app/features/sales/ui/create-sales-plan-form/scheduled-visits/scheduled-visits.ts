import { Component, Input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCardContent } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@ngneat/transloco';
import { CommonModule, DatePipe } from '@angular/common';
import { ScheduledVisit, VisitStatus } from '../../../../../shared/models/scheduledVisit.model';

@Component({
  selector: 'app-scheduled-visits',
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatCardContent,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    TranslocoDirective
  ],
  templateUrl: './scheduled-visits.html',
  styleUrl: './scheduled-visits.scss'
})
export class ScheduledVisits {
  @Input() scheduledVisits = signal<ScheduledVisit[]>([]);
  @Input() onRemoveVisit!: (visitId: string | number) => void;

  getVisitStatusClass(status: VisitStatus): string {
    switch (status) {
      case VisitStatus.COMPLETED:
        return 'status-completed';
      case VisitStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  handleRemoveVisit(visitId: string | number): void {
    if (this.onRemoveVisit) {
      this.onRemoveVisit(visitId);
    }
  }
}

