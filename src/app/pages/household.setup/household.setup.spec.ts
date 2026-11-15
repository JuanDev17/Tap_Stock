import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HouseholdSetup } from './household.setup';

describe('HouseholdSetup', () => {
  let component: HouseholdSetup;
  let fixture: ComponentFixture<HouseholdSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HouseholdSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(HouseholdSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
