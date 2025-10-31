import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPlanDetail } from './sales-plan-detail';

describe('SalesPlanDetail', () => {
  let component: SalesPlanDetail;
  let fixture: ComponentFixture<SalesPlanDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesPlanDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPlanDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
