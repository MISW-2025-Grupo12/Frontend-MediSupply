import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  constructor(
    private matIconRegistry: MatIconRegistry, 
    private domSanitizer: DomSanitizer) {}

  registerIcons(): void {
    const icons = [
      'logo-header',
    ];

    icons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon, 
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
      );
    });
  }
}
