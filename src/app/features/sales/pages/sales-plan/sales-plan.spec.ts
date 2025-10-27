import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPlanComponent } from './sales-plan';

describe('SalesPlanComponent', () => {
  let component: SalesPlanComponent;
  let fixture: ComponentFixture<SalesPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
