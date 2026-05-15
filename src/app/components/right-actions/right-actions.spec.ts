import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightActions } from './right-actions';

describe('RightActions', () => {
  let component: RightActions;
  let fixture: ComponentFixture<RightActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightActions],
    }).compileComponents();

    fixture = TestBed.createComponent(RightActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
