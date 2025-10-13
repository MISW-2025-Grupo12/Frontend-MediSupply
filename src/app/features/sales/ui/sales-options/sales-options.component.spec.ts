import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOptionsComponent } from './sales-options.component';

describe('SalesOptionsComponent', () => {
  let component: SalesOptionsComponent;
  let fixture: ComponentFixture<SalesOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
