import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedDeliveries } from './selected-deliveries';

describe('SelectedDeliveries', () => {
  let component: SelectedDeliveries;
  let fixture: ComponentFixture<SelectedDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedDeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
