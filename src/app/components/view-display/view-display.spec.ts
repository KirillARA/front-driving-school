import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDisplay } from './view-display';

describe('ViewDisplay', () => {
  let component: ViewDisplay;
  let fixture: ComponentFixture<ViewDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDisplay],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
