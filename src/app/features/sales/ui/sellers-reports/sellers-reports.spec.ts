import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SellersReports } from './sellers-reports';

describe('SellersReports', () => {
  let component: SellersReports;
  let fixture: ComponentFixture<SellersReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellersReports],
      providers: [
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellersReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
