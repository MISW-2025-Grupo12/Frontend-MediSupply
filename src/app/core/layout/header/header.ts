import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslocoDirective, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MatIcon, TranslocoDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private translocoService = inject(TranslocoService);

  get currentLang(): string {
    return this.translocoService.getActiveLang();
  }

  switchLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'es' : 'en';
    this.translocoService.setActiveLang(newLang);
  }
}
