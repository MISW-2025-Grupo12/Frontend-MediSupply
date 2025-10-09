import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translocoService = inject(TranslocoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    
    if (title) {
      // If the title is a translation key (contains 'titles.')
      if (title.includes('titles.')) {
        this.translocoService.selectTranslate(title).subscribe(translatedTitle => {
          this.title.setTitle(translatedTitle);
        });
      } else {
        this.title.setTitle(title);
      }
    } else {
      // Get titleKey from route data
      const titleKey = this.getTitleKey(snapshot);
      if (titleKey) {
        this.translocoService.selectTranslate(titleKey).subscribe(translatedTitle => {
          this.title.setTitle(translatedTitle);
        });
      } else {
        // Fallback to default title
        this.translocoService.selectTranslate('titles.home').subscribe(translatedTitle => {
          this.title.setTitle(translatedTitle);
        });
      }
    }
  }

  private getTitleKey(snapshot: RouterStateSnapshot): string | undefined {
    let route = snapshot.root;
    let titleKey: string | undefined;

    while (route) {
      if (route.data && route.data['titleKey']) {
        titleKey = route.data['titleKey'];
      }
      route = route.firstChild!;
    }

    return titleKey;
  }
}

