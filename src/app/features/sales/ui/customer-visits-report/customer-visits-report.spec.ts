import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVisitsReport } from './customer-visits-report';

describe('CustomerVisitsReport', () => {
  let component: CustomerVisitsReport;
  let fixture: ComponentFixture<CustomerVisitsReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerVisitsReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerVisitsReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
