import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'app-users-page',
  imports: [TranslocoDirective],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss'
})
export class UsersPage {
  private router = inject(Router);
}
