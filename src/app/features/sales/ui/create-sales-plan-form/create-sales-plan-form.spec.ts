import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalesPlanForm } from './create-sales-plan-form';

describe('CreateSalesPlanForm', () => {
  let component: CreateSalesPlanForm;
  let fixture: ComponentFixture<CreateSalesPlanForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSalesPlanForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalesPlanForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
