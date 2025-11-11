import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoute } from './add-route';

describe('AddRoute', () => {
  let component: AddRoute;
  let fixture: ComponentFixture<AddRoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRoute]
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
