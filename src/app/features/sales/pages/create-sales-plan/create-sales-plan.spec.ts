import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalesPlan } from './create-sales-plan';

describe('CreateSalesPlan', () => {
  let component: CreateSalesPlan;
  let fixture: ComponentFixture<CreateSalesPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSalesPlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalesPlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
