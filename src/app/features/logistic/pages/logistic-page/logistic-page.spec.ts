import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticPage } from './logistic-page';

describe('LogisticPage', () => {
  let component: LogisticPage;
  let fixture: ComponentFixture<LogisticPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogisticPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogisticPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
