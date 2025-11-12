import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { provideRouter } from '@angular/router';

import { AddRoute } from './add-route';

describe('AddRoute', () => {
  let component: AddRoute;
  let fixture: ComponentFixture<AddRoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddRoute,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {}
          },
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en'
          }
        })
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRoute);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
